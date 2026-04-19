import { createClient } from '@supabase/supabase-js';
import { describeImage } from './imageDescribe';
import { embedQuery } from './embeddings';

export type ImageSource = 'static' | 'direct' | 'docx' | 'pptx' | 'pdf';

export type IngestInput = {
    buffer: Buffer;
    mimeType: string;
    source: ImageSource;
    filename: string;
    documentId?: string | null;
    imageUrl: string;
    storagePath?: string | null;
};

export type IngestResult = { ok: boolean; reason?: string; id?: string };

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
}

export async function ingestImage(input: IngestInput): Promise<IngestResult> {
    const base64 = input.buffer.toString('base64');

    const description = await describeImage(base64, input.mimeType);
    if (!description) return { ok: false, reason: 'describe_failed' };

    const embedding = await embedQuery(description);
    if (!embedding) return { ok: false, reason: 'embed_failed' };

    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('document_images')
        .insert({
            document_id: input.documentId ?? null,
            source: input.source,
            image_url: input.imageUrl,
            storage_path: input.storagePath ?? null,
            filename: input.filename,
            description,
            embedding,
        })
        .select('id')
        .single();

    if (error) {
        console.error(`  ❌ ingestImage insert error for ${input.filename}:`, error.message);
        return { ok: false, reason: error.message };
    }
    return { ok: true, id: data?.id };
}

/**
 * Run `ingestImage` over a list of inputs with a concurrency cap.
 * Safe on partial failures — returns per-input results.
 */
export async function ingestImages(
    inputs: IngestInput[],
    concurrency = 4,
): Promise<IngestResult[]> {
    const results: IngestResult[] = new Array(inputs.length);
    let next = 0;

    async function worker() {
        while (true) {
            const i = next++;
            if (i >= inputs.length) return;
            try {
                results[i] = await ingestImage(inputs[i]);
            } catch (err: any) {
                results[i] = { ok: false, reason: err?.message ?? 'exception' };
            }
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, inputs.length) }, worker);
    await Promise.all(workers);
    return results;
}
