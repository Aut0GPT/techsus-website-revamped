-- ============================================================
-- Zeninho RAG — OpenAI text-embedding-3-large @ 3072 dims
-- Migrates from Gemini gemini-embedding-001 (768) to OpenAI (3072 via halfvec).
--
-- Why halfvec: pgvector's plain `vector` type caps HNSW indexes at ~2000
-- dimensions. `halfvec` (half-precision float) supports up to 4000 dims and
-- halves storage cost with negligible retrieval-quality loss.
--
-- Run this in Supabase Dashboard > SQL Editor.
-- After running, every `embedding` row will be NULL — run scripts/reembed.ts
-- to backfill before RAG search works again.
-- ============================================================

-- 1. Drop RPCs that depend on the old vector(768) column type
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_documents(vector, float, int);
DROP FUNCTION IF EXISTS hybrid_search(text, vector, integer, double precision, double precision, integer);
DROP FUNCTION IF EXISTS hybrid_search(text, vector, int, float, float, int);

-- 2. Drop the HNSW index bound to the old 768-dim column
DROP INDEX IF EXISTS document_embeddings_embedding_hnsw_idx;

-- 3. Clear existing embeddings (dimensions are incompatible; must re-embed)
UPDATE document_embeddings SET embedding = NULL;

-- 4. Convert column from vector(768) to halfvec(3072)
ALTER TABLE document_embeddings
  ALTER COLUMN embedding TYPE halfvec(3072)
  USING embedding::halfvec(3072);

-- 5. Recreate HNSW index using halfvec inner-product ops
CREATE INDEX document_embeddings_embedding_hnsw_idx
  ON document_embeddings
  USING hnsw (embedding halfvec_ip_ops)
  WITH (m = 16, ef_construction = 64);

-- 6. Recreate match_documents against halfvec(3072)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding halfvec(3072),
  match_threshold float DEFAULT 0.65,
  match_count int DEFAULT 5
)
RETURNS TABLE (id uuid, content text, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_documents(halfvec, float, int) TO service_role;

-- 7. Recreate hybrid_search against halfvec(3072)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text       text,
  query_embedding  halfvec(3072),
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
    WHERE embedding IS NOT NULL
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

GRANT EXECUTE ON FUNCTION hybrid_search(text, halfvec, int, float, float, int) TO service_role;
