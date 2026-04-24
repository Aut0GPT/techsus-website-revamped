import crypto from 'crypto';

// In-memory cache: sha256 of file bytes → OpenAI file_id.
// Scoped per Vercel invocation; a conversation's repeated turns resend the same
// file bytes in history, so even short-lived caching saves roundtrips.
const cache = new Map<string, string>();
const CACHE_MAX = 64;

function hashBytes(bytes: Uint8Array): string {
    return crypto.createHash('sha256').update(bytes).digest('hex');
}

/**
 * Upload a file to OpenAI's Files API with purpose='user_data' and return the
 * resulting file_id. Used for file types that the Responses API does not accept
 * as inline bytes (DOCX, PPTX, XLSX, etc.) — by contrast, PDFs and images can
 * be sent inline.
 *
 * Returns null on failure so the caller can gracefully fall back.
 */
export async function ensureOpenAIFile(
    bytes: Uint8Array,
    filename: string,
    mimeType: string,
): Promise<string | null> {
    if (!process.env.OPENAI_API_KEY) {
        console.error('  ❌ ensureOpenAIFile: OPENAI_API_KEY not set');
        return null;
    }

    const key = hashBytes(bytes);
    const cached = cache.get(key);
    if (cached) {
        console.log(`  ⚡ OpenAI Files cache HIT (${filename})`);
        return cached;
    }

    const t0 = Date.now();
    try {
        const fd = new FormData();
        fd.append('purpose', 'user_data');
        fd.append(
            'file',
            new Blob([bytes as any], { type: mimeType || 'application/octet-stream' }),
            filename || 'file',
        );

        const res = await fetch('https://api.openai.com/v1/files', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: fd,
            signal: AbortSignal.timeout(60000),
        });

        if (!res.ok) {
            console.error('  ❌ OpenAI files upload error:', res.status, (await res.text()).slice(0, 200));
            return null;
        }

        const data = await res.json();
        const fileId: string | undefined = data?.id;
        if (!fileId) {
            console.error('  ❌ OpenAI files upload: no id in response');
            return null;
        }

        if (cache.size >= CACHE_MAX) {
            const oldest = cache.keys().next().value;
            if (oldest) cache.delete(oldest);
        }
        cache.set(key, fileId);

        console.log(`  ⏱  OpenAI Files uploaded ${filename} → ${fileId} in ${Date.now() - t0}ms`);
        return fileId;
    } catch (err: any) {
        console.error('  ❌ ensureOpenAIFile exception:', err?.message ?? err);
        return null;
    }
}
