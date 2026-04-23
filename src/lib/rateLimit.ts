import { createClient } from '@supabase/supabase-js';

export type RateLimitResult =
    | { allowed: true; used: number; limit: number }
    | { allowed: false; used: number; limit: number; retryAfterSeconds: number };

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function checkRateLimit(
    userId: string,
    bucket: string,
    limit: number,
    windowSeconds: number,
): Promise<RateLimitResult> {
    const { data, error } = await admin.rpc('check_rate_limit', {
        p_user_id: userId,
        p_bucket: bucket,
        p_limit: limit,
        p_window_secs: windowSeconds,
    });

    // Fail-open: if Supabase itself is unreachable we don't want the whole
    // chat to 500. Log loudly and let the request through.
    if (error || !data?.length) {
        console.error('  ⚠ rate-limit RPC failed, allowing request:', error?.message);
        return { allowed: true, used: 0, limit };
    }

    const row = data[0] as { allowed: boolean; used: number; limit_: number; retry_after_seconds: number };
    if (row.allowed) return { allowed: true, used: row.used, limit: row.limit_ };
    return {
        allowed: false,
        used: row.used,
        limit: row.limit_,
        retryAfterSeconds: row.retry_after_seconds,
    };
}

export function rateLimitResponse(result: Extract<RateLimitResult, { allowed: false }>, label: string) {
    return new Response(
        JSON.stringify({
            error: `Limite de uso atingido para ${label} (${result.used}/${result.limit}). Tente novamente em ${result.retryAfterSeconds}s.`,
            retryAfterSeconds: result.retryAfterSeconds,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(result.retryAfterSeconds),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': String(Math.max(0, result.limit - result.used)),
            },
        },
    );
}
