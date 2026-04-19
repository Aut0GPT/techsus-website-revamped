const DESCRIBE_MODEL = 'gpt-5.4';

const DESCRIBE_INSTRUCTION =
    'Descreva esta imagem em português, em 2-4 frases. Foque em: o que aparece (pessoas, objetos, cenário), elementos técnicos (se for diagrama, esquema ou gráfico) e contexto. Sem introdução. Apenas a descrição factual, otimizada para busca semântica.';

export async function describeImage(
    imageBase64: string,
    mimeType: string,
): Promise<string | null> {
    if (!process.env.OPENAI_API_KEY) {
        console.error('  ❌ describeImage: OPENAI_API_KEY not set');
        return null;
    }

    const t0 = Date.now();
    try {
        const res = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: DESCRIBE_MODEL,
                input: [{
                    role: 'user',
                    content: [
                        { type: 'input_text', text: DESCRIBE_INSTRUCTION },
                        { type: 'input_image', image_url: `data:${mimeType};base64,${imageBase64}` },
                    ],
                }],
                reasoning: { effort: 'minimal' },
            }),
            signal: AbortSignal.timeout(60000),
        });

        if (!res.ok) {
            console.error('  ❌ describeImage error:', res.status, (await res.text()).slice(0, 200));
            return null;
        }

        const data = await res.json();
        const text: string = extractOutputText(data);
        console.log(`  ⏱  describeImage in ${Date.now() - t0}ms (${text.length} chars)`);
        return text.trim() || null;
    } catch (err: any) {
        console.error('  ❌ describeImage exception:', err.message ?? err);
        return null;
    }
}

function extractOutputText(data: any): string {
    if (typeof data?.output_text === 'string' && data.output_text.length > 0) {
        return data.output_text;
    }
    const parts: string[] = [];
    for (const item of data?.output ?? []) {
        for (const c of item?.content ?? []) {
            if (typeof c?.text === 'string') parts.push(c.text);
            else if (c?.type === 'output_text' && typeof c?.text === 'string') parts.push(c.text);
        }
    }
    return parts.join('\n');
}
