-- ============================================================
-- Zeninho — per-user rate limiting (rolling window)
-- Run this in Supabase Dashboard > SQL Editor.
--
-- Each row is one "hit" against a named bucket for a given user.
-- The `check_rate_limit` RPC atomically inserts a hit and returns
-- whether the user is still under the cap for the window.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limit_hits (
    id         bigserial PRIMARY KEY,
    user_id    uuid        NOT NULL,
    bucket     text        NOT NULL,
    hit_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_hits_lookup_idx
    ON rate_limit_hits (user_id, bucket, hit_at DESC);

-- Atomic check + insert. Returns (allowed, used, limit_, retry_after_seconds).
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id     uuid,
    p_bucket      text,
    p_limit       int,
    p_window_secs int
)
RETURNS TABLE (allowed boolean, used int, limit_ int, retry_after_seconds int)
LANGUAGE plpgsql AS $$
DECLARE
    v_count       int;
    v_oldest      timestamptz;
    v_window_start timestamptz := now() - make_interval(secs => p_window_secs);
BEGIN
    -- Best-effort cleanup so the table doesn't grow forever.
    DELETE FROM rate_limit_hits
    WHERE hit_at < now() - interval '1 day';

    SELECT count(*), min(hit_at)
      INTO v_count, v_oldest
      FROM rate_limit_hits
     WHERE user_id = p_user_id
       AND bucket  = p_bucket
       AND hit_at >= v_window_start;

    IF v_count >= p_limit THEN
        RETURN QUERY SELECT
            false,
            v_count,
            p_limit,
            GREATEST(
                1,
                CEIL(EXTRACT(EPOCH FROM (v_oldest + make_interval(secs => p_window_secs)) - now()))::int
            );
        RETURN;
    END IF;

    INSERT INTO rate_limit_hits (user_id, bucket) VALUES (p_user_id, p_bucket);

    RETURN QUERY SELECT true, v_count + 1, p_limit, 0;
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit(uuid, text, int, int) TO service_role;
