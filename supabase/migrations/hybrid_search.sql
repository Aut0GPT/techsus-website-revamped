-- ============================================================
-- Zeninho RAG — Hybrid Search Migration
-- Run this in Supabase Dashboard > SQL Editor
-- Table: document_embeddings (columns: id, document_id, content, embedding)
-- ============================================================

-- 1. Add full-text search column to document_embeddings
ALTER TABLE document_embeddings
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(content, ''))) STORED;

-- 2. GIN index on fts for fast keyword search
CREATE INDEX IF NOT EXISTS document_embeddings_fts_idx ON document_embeddings USING GIN(fts);

-- 3. Hybrid search function with Reciprocal Rank Fusion (RRF)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text       text,
  query_embedding  vector(768),
  match_count      int     DEFAULT 5,
  full_text_weight float   DEFAULT 1.0,
  semantic_weight  float   DEFAULT 1.0,
  rrf_k            int     DEFAULT 50
)
RETURNS TABLE (
  id         uuid,
  content    text,
  similarity float
)
LANGUAGE sql STABLE AS $$
WITH
  full_text AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank_cd(fts, websearch_to_tsquery('portuguese', query_text)) DESC
      ) AS rank_ix
    FROM document_embeddings
    WHERE fts @@ websearch_to_tsquery('portuguese', query_text)
    LIMIT match_count * 2
  ),
  semantic AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY embedding <#> query_embedding
      ) AS rank_ix
    FROM document_embeddings
    ORDER BY embedding <#> query_embedding
    LIMIT match_count * 2
  )
SELECT
  de.id,
  de.content,
  (
    COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
    COALESCE(1.0 / (rrf_k + semantic.rank_ix),  0.0) * semantic_weight
  )::float AS similarity
FROM full_text
FULL OUTER JOIN semantic USING (id)
JOIN document_embeddings de USING (id)
ORDER BY similarity DESC
LIMIT match_count;
$$;

-- 4. Grant execute to service role
GRANT EXECUTE ON FUNCTION hybrid_search TO service_role;
