export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { prompt, count = 1, aspectRatio = '1:1' } = await req.json();

        if (!prompt) {
            return new Response(
                JSON.stringify({ error: 'Prompt é obrigatório.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const images: string[] = [];

        for (let i = 0; i < Math.min(count, 10); i++) {
            const slidePrompt = count > 1
                ? `${prompt}\n\nThis is slide ${i + 1} of ${count}. Make it look like a professional presentation slide with clear layout.`
                : prompt;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: slidePrompt }],
                        }],
                        generationConfig: {
                            responseModalities: ['Image'],
                            ...(aspectRatio !== '1:1' && {
                                imageConfig: { aspectRatio },
                            }),
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Gemini image gen error:', errorData);
                continue;
            }

            const data = await response.json();

            // Extract image from response
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }

        if (images.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Não foi possível gerar a imagem. Tente com outra descrição.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ images, count: images.length }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Image generation error:', error);
        return new Response(
            JSON.stringify({ error: 'Erro ao gerar imagem.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
