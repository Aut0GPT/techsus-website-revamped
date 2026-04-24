import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 30;

const BUCKET = 'imagensrag';
// Vercel serverless has a ~4.5 MB request body cap, so this route never sees
// the file bytes — it just hands out a signed upload URL. The real per-file
// ceiling is Supabase Storage's per-object limit (5 GB by default). We still
// clamp here so the UI can surface an early error instead of a silent failure.
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

function sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

export async function POST(req: Request) {
    const { user, response: authErr } = await requireUser();
    if (authErr) return authErr;

    const limit = await checkRateLimit(user.id, 'chat_attach', 60, 3600);
    if (!limit.allowed) return rateLimitResponse(limit, 'anexos no chat');

    try {
        const body = await req.json().catch(() => null) as
            | { filename?: string; mediaType?: string; size?: number }
            | null;
        if (!body || !body.filename) {
            return new Response(JSON.stringify({ error: 'filename é obrigatório.' }), { status: 400 });
        }

        const size = Number(body.size ?? 0);
        if (size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({
                error: `Arquivo muito grande (${(size / 1024 / 1024).toFixed(1)} MB). Máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
            }), { status: 413 });
        }

        const mediaType = body.mediaType || 'application/octet-stream';
        const storagePath = `chat/${user.id}/${Date.now()}_${sanitize(body.filename)}`;

        // 1) Signed upload URL — the client PUTs file bytes directly to this.
        //    Supabase handles the upload; Vercel is bypassed entirely.
        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUploadUrl(storagePath);
        if (uploadErr || !uploadData) {
            console.error('  ❌ chat-attach createSignedUploadUrl error:', uploadErr?.message);
            return new Response(JSON.stringify({ error: 'Falha ao criar URL de upload.' }), { status: 500 });
        }

        // 2) Signed read URL — valid immediately; actual downloads only succeed
        //    after the client finishes the PUT above. Long TTL so the file
        //    remains accessible for the lifetime of the conversation.
        const { data: readData, error: readErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
        if (readErr || !readData?.signedUrl) {
            console.error('  ❌ chat-attach createSignedUrl error:', readErr?.message);
            return new Response(JSON.stringify({ error: 'Falha ao gerar URL de leitura.' }), { status: 500 });
        }

        return Response.json({
            uploadUrl: uploadData.signedUrl,
            token: uploadData.token,
            storagePath: uploadData.path,
            readUrl: readData.signedUrl,
            filename: body.filename,
            mediaType,
        });
    } catch (err: any) {
        console.error('  ❌ chat-attach error:', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Erro ao processar o anexo.' }), { status: 500 });
    }
}
