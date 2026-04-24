import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 60;

const BUCKET = 'imagensrag';
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB — mirrors /api/upload

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
        const form = await req.formData();
        const file = form.get('file') as File | null;
        if (!file) {
            return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado.' }), { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({
                error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
            }), { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const contentType = file.type || 'application/octet-stream';
        const storagePath = `chat/${user.id}/${Date.now()}_${sanitize(file.name || 'file')}`;

        const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, { contentType, upsert: false });
        if (upErr) {
            console.error('  ❌ chat-attach upload error:', upErr.message);
            return new Response(JSON.stringify({ error: 'Falha ao salvar o arquivo.' }), { status: 500 });
        }

        const { data: signed, error: signErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
        if (signErr || !signed?.signedUrl) {
            console.error('  ❌ chat-attach sign error:', signErr?.message);
            return new Response(JSON.stringify({ error: 'Falha ao gerar URL assinada.' }), { status: 500 });
        }

        return Response.json({
            url: signed.signedUrl,
            filename: file.name,
            mediaType: contentType,
            size: file.size,
        });
    } catch (err: any) {
        console.error('  ❌ chat-attach error:', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Erro ao processar o anexo.' }), { status: 500 });
    }
}
