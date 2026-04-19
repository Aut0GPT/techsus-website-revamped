-- ============================================================
-- Zeninho — document_images table for image retrieval
-- Run this in Supabase Dashboard > SQL Editor.
-- Also create a private bucket named `imagensrag` in Storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS document_images (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id  uuid REFERENCES documents(id) ON DELETE CASCADE,
    source       text NOT NULL CHECK (source IN ('static','direct','docx','pptx','pdf')),
    image_url    text NOT NULL,
    storage_path text,
    filename     text,
    description  text NOT NULL,
    embedding    halfvec(3072),
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Idempotent re-runs of the static backfill skip existing rows
CREATE UNIQUE INDEX IF NOT EXISTS document_images_static_unique
    ON document_images (filename)
    WHERE source = 'static';

CREATE INDEX IF NOT EXISTS document_images_embedding_hnsw_idx
    ON document_images
    USING hnsw (embedding halfvec_ip_ops)
    WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION match_images(
    query_embedding  halfvec(3072),
    match_threshold  float DEFAULT 0.25,
    match_count      int   DEFAULT 5
)
RETURNS TABLE (id uuid, image_url text, description text, similarity float)
LANGUAGE sql STABLE AS $$
    SELECT
        id,
        image_url,
        description,
        1 - (embedding <=> query_embedding) AS similarity
    FROM document_images
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_images(halfvec, float, int) TO service_role;
