const EMBEDDING_MODEL = 'text-embedding-3-large';
const EMBEDDING_DIMS = 3072;

// OpenAI limits for text-embedding-3-large:
// - 8191 tokens per input
// - 300,000 tokens per request (summed across the batch)
// We use a conservative chars→tokens ratio of 3.5 (PT is denser than EN) and
// leave ~10-15% headroom so we never flirt with the hard cap.
const CHARS_PER_TOKEN = 3.5;
const MAX_CHARS_PER_INPUT = Math.floor(8191 * CHARS_PER_TOKEN * 0.9);       // ~25800
const MAX_CHARS_PER_REQUEST = Math.floor(300_000 * CHARS_PER_TOKEN * 0.85); // ~892500

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
    // 1. Truncate any oversized input first. Loses information, but better than
    //    the entire batch failing — and this is the last line of defence; the
    //    caller's chunker should already keep items well under this cap.
    const prepared = texts.map((t, idx) => {
        const str = t ?? '';
        if (str.length > MAX_CHARS_PER_INPUT) {
            console.warn(`  ⚠  embedBatch: truncating input #${idx} from ${str.length} to ${MAX_CHARS_PER_INPUT} chars`);
            return str.slice(0, MAX_CHARS_PER_INPUT);
        }
        return str;
    });

    const out: (number[] | null)[] = new Array(prepared.length);
    let i = 0;

    // 2. Build batches respecting BOTH batchSize AND total-chars-per-request.
    //    Without the char cap, a batch of 100 normal chunks is fine, but a batch
    //    containing one or two very long chunks can silently blow the 300K
    //    token-per-request limit and fail the entire batch.
    while (i < prepared.length) {
        const batchIndices: number[] = [];
        const batchInputs: string[] = [];
        let batchChars = 0;

        while (i < prepared.length && batchIndices.length < batchSize) {
            const next = prepared[i];
            if (batchChars + next.length > MAX_CHARS_PER_REQUEST && batchIndices.length > 0) {
                break; // flush this batch, the next chunk goes into a new batch
            }
            batchIndices.push(i);
            batchInputs.push(next);
            batchChars += next.length;
            i++;
        }

        const results = await callOpenAiEmbeddings(batchInputs);
        if (!results) {
            for (const idx of batchIndices) out[idx] = null;
        } else {
            results.forEach((e, k) => { out[batchIndices[k]] = e; });
        }
    }
    return out;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMS };
