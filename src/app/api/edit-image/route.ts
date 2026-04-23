import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 120;

const OPENAI_IMAGE_MODEL = 'gpt-image-2';

export async function POST(req: NextRequest) {
    const { user, response: authErr } = await requireUser();
    if (authErr) return authErr;

    const limit = await checkRateLimit(user.id, 'image_edit', 15, 3600);
    if (!limit.allowed) return rateLimitResponse(limit, 'edição de imagens');

    try {
        const { imageUrl, editPrompt } = await req.json();

        if (!imageUrl || !editPrompt) {
            return Response.json({ success: false, message: 'imageUrl e editPrompt são obrigatórios.' }, { status: 400 });
        }
        if (!process.env.OPENAI_API_KEY) {
            return Response.json({ success: false, message: 'Chave de API não configurada.' }, { status: 500 });
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return Response.json({ success: false, message: 'Não foi possível baixar a imagem original.' }, { status: 400 });
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const mimeType = imageResponse.headers.get('content-type') || 'image/png';
        const ext = mimeType.includes('png') ? 'png' : 'jpg';

        console.log(`  🎨 Editing image with gpt-image-2: "${editPrompt.slice(0, 80)}"`);

        const fd = new FormData();
        fd.append('model', OPENAI_IMAGE_MODEL);
        fd.append('prompt', editPrompt);
        fd.append('quality', 'high');
        fd.append('image[]', new Blob([imageBuffer as any], { type: mimeType }), `source.${ext}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
            body: fd,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            console.error('  ❌ OpenAI image edit error:', response.status, errText.slice(0, 200));
            return Response.json({ success: false, message: `Erro na API: ${response.status}.` }, { status: 500 });
        }

        const data = await response.json();
        const editedBase64: string | undefined = data.data?.[0]?.b64_json;
        if (!editedBase64) {
            return Response.json({ success: false, message: 'O modelo não retornou uma imagem editada. Tente reformular o pedido.' }, { status: 500 });
        }

        const editedMime = 'image/png';
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const fileName = `zeninho_edit_${Date.now()}.png`;
        const editedBuffer = Buffer.from(editedBase64, 'base64');

        const { error: uploadError } = await supabase.storage
            .from('imagensgeradas')
            .upload(fileName, editedBuffer, { contentType: editedMime, upsert: false });

        if (uploadError) {
            console.error('  ❌ Supabase upload error:', uploadError.message);
            return Response.json({ success: true, imageUrl: `data:${editedMime};base64,${editedBase64}` });
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('imagensgeradas')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        if (signedUrlError || !signedUrlData?.signedUrl) {
            return Response.json({ success: true, imageUrl: `data:${editedMime};base64,${editedBase64}` });
        }

        console.log(`  ✅ Image edited and uploaded: ${signedUrlData.signedUrl.slice(0, 60)}...`);
        return Response.json({ success: true, imageUrl: signedUrlData.signedUrl });

    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error('  ❌ edit-image timeout');
            return Response.json({ success: false, message: 'Tempo limite excedido ao editar a imagem.' }, { status: 504 });
        }
        console.error('  ❌ edit-image error:', err);
        return Response.json({ success: false, message: err.message ?? 'Erro ao editar a imagem.' }, { status: 500 });
    }
}
