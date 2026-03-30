import { generateImage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, editPrompt } = await req.json();

        if (!imageUrl || !editPrompt) {
            return Response.json({ success: false, message: 'imageUrl e editPrompt são obrigatórios.' }, { status: 400 });
        }

        // Download the original image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return Response.json({ success: false, message: 'Não foi possível baixar a imagem original.' }, { status: 400 });
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Create OpenAI provider
        const oaiKey = process.env.OPENAI_API_KEY || process.env.openai_key || '';
        if (!oaiKey) {
            return Response.json({ success: false, message: 'Chave OpenAI não configurada.' }, { status: 500 });
        }
        const oaiProvider = createOpenAI({ apiKey: oaiKey });

        console.log(`  🎨 Editing image with OpenAI gpt-image-1: "${editPrompt.slice(0, 80)}"`);

        // Edit via OpenAI gpt-image-1
        const result = await generateImage({
            model: oaiProvider.image('gpt-image-1'),
            prompt: { images: [imageBuffer], text: editPrompt },
            size: '1024x1024',
            abortSignal: AbortSignal.timeout(90000),
        });

        // Upload edited image to Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const fileName = `zeninho_edit_${Date.now()}.png`;
        const editedBuffer = Buffer.from(result.image.base64, 'base64');

        const { error: uploadError } = await supabase.storage
            .from('imagensgeradas')
            .upload(fileName, editedBuffer, { contentType: 'image/png', upsert: false });

        if (uploadError) {
            console.error('  ❌ Supabase upload error:', uploadError.message);
            return Response.json({
                success: true,
                imageUrl: `data:image/png;base64,${result.image.base64}`,
            });
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('imagensgeradas')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        if (signedUrlError || !signedUrlData?.signedUrl) {
            return Response.json({
                success: true,
                imageUrl: `data:image/png;base64,${result.image.base64}`,
            });
        }

        console.log(`  ✅ Image edited and uploaded: ${signedUrlData.signedUrl.slice(0, 60)}...`);
        return Response.json({ success: true, imageUrl: signedUrlData.signedUrl });

    } catch (err: any) {
        console.error('  ❌ edit-image error:', err);
        return Response.json(
            { success: false, message: err.message ?? 'Erro ao editar a imagem.' },
            { status: 500 }
        );
    }
}
