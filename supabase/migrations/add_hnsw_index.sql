-- ============================================================
-- Zeninho RAG — Performance Fix: HNSW Index + match_documents
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. HNSW index on embedding column for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_hnsw_idx
  ON document_embeddings
  USING hnsw (embedding vector_ip_ops)
  WITH (m = 16, ef_construction = 64);

-- 2. Drop the old match_documents (has incompatible return type)
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_documents(vector, float, int);

-- 3. Recreate match_documents with correct return type
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
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
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 4. Grant execute to service role
GRANT EXECUTE ON FUNCTION match_documents TO service_role;
