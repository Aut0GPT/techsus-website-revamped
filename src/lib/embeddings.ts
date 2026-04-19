const EMBEDDING_MODEL = 'text-embedding-3-large';
const EMBEDDING_DIMS = 3072;

const cache = new Map<string, { embedding: number[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX = 50;

function getCached(key: string): number[] | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.embedding;
}

function setCached(key: string, embedding: number[]) {
    if (cache.size >= CACHE_MAX) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
    }
    cache.set(key, { embedding, ts: Date.now() });
}

async function callOpenAiEmbeddings(input: string | string[]): Promise<number[][] | null> {
    const t0 = Date.now();
    const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: EMBEDDING_MODEL,
            input,
            dimensions: EMBEDDING_DIMS,
        }),
    });

    if (!res.ok) {
        console.error('  ❌ OpenAI embeddings error:', res.status, (await res.text()).slice(0, 200));
        return null;
    }
    const data = await res.json();
    const out = data.data?.map((d: { embedding: number[] }) => d.embedding) ?? null;
    console.log(`  ⏱  Embedding(s) generated in ${Date.now() - t0}ms (n=${Array.isArray(input) ? input.length : 1})`);
    return out;
}

export async function embedQuery(text: string): Promise<number[] | null> {
    const cached = getCached(text);
    if (cached) {
        console.log('  ⚡ Embedding cache HIT');
        return cached;
    }
    const results = await callOpenAiEmbeddings(text);
    const embedding = results?.[0] ?? null;
    if (embedding) setCached(text, embedding);
    return embedding;
}

export async function embedBatch(texts: string[], batchSize = 100): Promise<(number[] | null)[]> {
    const out: (number[] | null)[] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
        const slice = texts.slice(i, i + batchSize);
        const results = await callOpenAiEmbeddings(slice);
        if (!results) {
            for (let j = 0; j < slice.length; j++) out.push(null);
        } else {
            for (const e of results) out.push(e);
        }
    }
    return out;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMS };
