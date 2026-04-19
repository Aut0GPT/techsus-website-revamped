import { requireUser } from '@/lib/supabase/server';

export const maxDuration = 120;

const OPENAI_IMAGE_MODEL = 'gpt-image-1.5';

function mapAspectRatioToSize(aspectRatio: string): string {
    switch (aspectRatio) {
        case '16:9':
        case '4:3':
            return '1536x1024';
        case '9:16':
        case '3:4':
            return '1024x1536';
        case '1:1':
        default:
            return '1024x1024';
    }
}

export async function POST(req: Request) {
    const { response: authErr } = await requireUser();
    if (authErr) return authErr;

    try {
        const { prompt, count = 1, aspectRatio = '1:1' } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
        }
        if (!process.env.OPENAI_API_KEY) {
            return Response.json({ error: 'Chave de API não configurada.' }, { status: 500 });
        }

        const size = mapAspectRatioToSize(aspectRatio);
        const images: string[] = [];

        for (let i = 0; i < Math.min(count, 10); i++) {
            const slidePrompt = count > 1
                ? `${prompt}\n\nThis is slide ${i + 1} of ${count}. Make it look like a professional presentation slide with clear layout.`
                : prompt;

            const res = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: OPENAI_IMAGE_MODEL,
                    prompt: slidePrompt,
                    size,
                    quality: 'high',
                }),
            });

            if (!res.ok) {
                console.error('  ❌ OpenAI image gen error:', res.status, (await res.text()).slice(0, 200));
                continue;
            }

            const data = await res.json();
            const b64 = data.data?.[0]?.b64_json;
            if (b64) images.push(`data:image/png;base64,${b64}`);
        }

        if (images.length === 0) {
            return Response.json({ error: 'Não foi possível gerar a imagem. Tente com outra descrição.' }, { status: 500 });
        }

        return Response.json({ images, count: images.length });
    } catch (error) {
        console.error('Image generation error:', error);
        return Response.json({ error: 'Erro ao gerar imagem.' }, { status: 500 });
    }
}
