import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, editPrompt } = await req.json();

        if (!imageUrl || !editPrompt) {
            return Response.json({ success: false, message: 'imageUrl e editPrompt são obrigatórios.' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return Response.json({ success: false, message: 'Chave de API Gemini não configurada.' }, { status: 500 });
        }

        // Download the original image and convert to base64
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return Response.json({ success: false, message: 'Não foi possível baixar a imagem original.' }, { status: 400 });
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const base64Image = imageBuffer.toString('base64');

        console.log(`  🎨 Editing image with Gemini: "${editPrompt.slice(0, 80)}"`);

        // Send original image + edit instruction to Gemini image model
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inlineData: { mimeType, data: base64Image } },
                            { text: editPrompt },
                        ],
                    }],
                    generationConfig: { responseModalities: ['Image', 'Text'] },
                }),
                signal: controller.signal,
            }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            console.error('  ❌ Gemini edit API error:', response.status, errText.slice(0, 200));
            return Response.json({ success: false, message: `Erro na API Gemini: ${response.status}.` }, { status: 500 });
        }

        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
            if (part.inlineData) {
                const editedMime: string = part.inlineData.mimeType ?? 'image/png';
                const editedBase64: string = part.inlineData.data;

                // Upload edited image to Supabase
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                const ext = editedMime === 'image/png' ? 'png' : 'jpg';
                const fileName = `zeninho_edit_${Date.now()}.${ext}`;
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
            }
        }

        // No image part returned
        const textParts = parts.filter((p: any) => p.text);
        console.warn('  ⚠️  Gemini returned no image for edit. Text:', textParts[0]?.text?.slice(0, 100));
        return Response.json({ success: false, message: 'O modelo não retornou uma imagem editada. Tente reformular o pedido.' }, { status: 500 });

    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error('  ❌ edit-image timeout');
            return Response.json({ success: false, message: 'Tempo limite excedido ao editar a imagem.' }, { status: 504 });
        }
        console.error('  ❌ edit-image error:', err);
        return Response.json({ success: false, message: err.message ?? 'Erro ao editar a imagem.' }, { status: 500 });
    }
}
