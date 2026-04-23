import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { embedBatch } from '@/lib/embeddings';
import { requireUser } from '@/lib/supabase/server';
import { ingestImages, type IngestInput, type ImageSource } from '@/lib/imageIngest';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
// eslint-disable-next-line
const pdfParse = require('pdf-parse');

export const maxDuration = 300;

const IMAGE_BUCKET = 'imagensrag';
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;
const IMAGE_MIME_RE = /^image\/(png|jpeg|jpg|webp|gif)$/i;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?。])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            const words = currentChunk.split(' ');
            const overlapWords = words.slice(-Math.ceil(overlap / 5));
            currentChunk = overlapWords.join(' ') + ' ' + sentence;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

function stripXml(xml: string): string {
    return xml
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

async function extractPptxText(zip: JSZip): Promise<string> {
    const slides: string[] = [];
    const slideFiles = Object.keys(zip.files)
        .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
            const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
            return numA - numB;
        });

    for (const slideFile of slideFiles) {
        const content = await zip.files[slideFile].async('text');
        const text = stripXml(content);
        if (text.trim()) slides.push(text.trim());
    }

    const noteFiles = Object.keys(zip.files)
        .filter(name => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));

    for (const noteFile of noteFiles) {
        const content = await zip.files[noteFile].async('text');
        const text = stripXml(content);
        if (text.trim()) slides.push('[Nota] ' + text.trim());
    }

    return slides.join('\n\n');
}

async function extractDocxText(zip: JSZip): Promise<string> {
    const docFile = zip.files['word/document.xml'];
    if (!docFile) return '';
    const content = await docFile.async('text');
    return stripXml(content);
}

async function extractXlsxText(zip: JSZip): Promise<string> {
    const sharedStringsFile = zip.files['xl/sharedStrings.xml'];
    const sharedStrings: string[] = [];

    if (sharedStringsFile) {
        const ssContent = await sharedStringsFile.async('text');
        const matches = ssContent.match(/<t[^>]*>([^<]+)<\/t>/g);
        if (matches) {
            for (const match of matches) {
                const text = match.replace(/<[^>]+>/g, '');
                sharedStrings.push(text);
            }
        }
    }

    const sheets: string[] = [];
    const sheetFiles = Object.keys(zip.files)
        .filter(name => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
        .sort();

    for (const sheetFile of sheetFiles) {
        const content = await zip.files[sheetFile].async('text');
        const text = stripXml(content);
        if (text.trim()) sheets.push(text.trim());
    }

    return [...sharedStrings, ...sheets].filter(Boolean).join(' ');
}

function mimeFromName(name: string): string {
    const ext = name.toLowerCase().split('.').pop() || '';
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    return 'application/octet-stream';
}

async function uploadAndSign(buffer: Buffer, storagePath: string, contentType: string): Promise<string | null> {
    const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(storagePath, buffer, { contentType, upsert: false });
    if (upErr) {
        console.error(`  ❌ storage upload failed (${storagePath}):`, upErr.message);
        return null;
    }
    const { data, error: urlErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
    if (urlErr || !data?.signedUrl) {
        console.error(`  ❌ signed-url failed (${storagePath}):`, urlErr?.message);
        return null;
    }
    return data.signedUrl;
}

/**
 * Extract images from an Office zip (DOCX/PPTX), upload each to storage,
 * and prepare IngestInput entries.
 */
async function collectOfficeImages(
    zip: JSZip,
    source: Extract<ImageSource, 'docx' | 'pptx'>,
    documentId: string,
    originalFilename: string,
): Promise<IngestInput[]> {
    const prefix = source === 'docx' ? 'word/media/' : 'ppt/media/';
    const mediaKeys = Object.keys(zip.files).filter(k =>
        k.startsWith(prefix) && IMAGE_EXT_RE.test(k)
    );

    const inputs: IngestInput[] = [];
    for (const key of mediaKeys) {
        try {
            const buf = await zip.files[key].async('nodebuffer');
            if (buf.length < 2048) continue; // skip likely-blank/tiny decorations
            const basename = key.split('/').pop() || 'image';
            const storagePath = `${source}/${documentId}/${basename}`;
            const mime = mimeFromName(basename);
            const signedUrl = await uploadAndSign(buf, storagePath, mime);
            if (!signedUrl) continue;
            inputs.push({
                buffer: buf,
                mimeType: mime,
                source,
                filename: `${originalFilename}::${basename}`,
                documentId,
                imageUrl: signedUrl,
                storagePath,
            });
        } catch (err: any) {
            console.error(`  ⚠ failed to read ${key}:`, err?.message ?? err);
        }
    }
    return inputs;
}

async function indexTextChunks(documentId: string, text: string): Promise<{ successCount: number; total: number }> {
    const chunks = chunkText(text);
    if (chunks.length === 0) return { successCount: 0, total: 0 };

    const embeddings = await embedBatch(chunks);
    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
        const embedding = embeddings[i];
        if (!embedding) continue;
        const { error } = await supabase.from('document_embeddings').insert({
            document_id: documentId,
            content: chunks[i],
            embedding,
        });
        if (!error) successCount++;
    }
    return { successCount, total: chunks.length };
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req: Request) {
    const { user, response: authErr } = await requireUser();
    if (authErr) return authErr;

    const limit = await checkRateLimit(user.id, 'upload', 20, 3600);
    if (!limit.allowed) return rateLimitResponse(limit, 'uploads');

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string | null;

        if (!file) return json({ error: 'Nenhum arquivo enviado.' }, 400);

        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());
        const isImage = IMAGE_MIME_RE.test(file.type) || IMAGE_EXT_RE.test(fileName);

        // ───── Direct image upload ────────────────────────────────────────
        if (isImage) {
            const { data: doc, error: docError } = await supabase
                .from('documents')
                .insert({
                    title: title || file.name,
                    file_url: null,
                    uploaded_by: user.email ?? user.id,
                })
                .select()
                .single();
            if (docError || !doc) return json({ error: 'Erro ao salvar documento.' }, 500);

            const mime = file.type && IMAGE_MIME_RE.test(file.type) ? file.type : mimeFromName(file.name);
            const storagePath = `direct/${doc.id}/${file.name}`;
            const signedUrl = await uploadAndSign(buffer, storagePath, mime);
            if (!signedUrl) return json({ error: 'Falha ao armazenar a imagem.' }, 500);

            const [result] = await ingestImages([{
                buffer,
                mimeType: mime,
                source: 'direct',
                filename: file.name,
                documentId: doc.id,
                imageUrl: signedUrl,
                storagePath,
            }], 1);

            if (!result?.ok) {
                return json({
                    success: false,
                    message: `Imagem armazenada, mas a descrição falhou (${result?.reason ?? 'desconhecido'}).`,
                    documentId: doc.id,
                });
            }
            return json({
                success: true,
                message: `Imagem "${file.name}" indexada com sucesso.`,
                documentId: doc.id,
                imagesIndexed: 1,
            });
        }

        // ───── Text-bearing document ──────────────────────────────────────
        let text = '';
        let officeZip: JSZip | null = null;
        let kind: 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'text' | null = null;

        try {
            if (fileName.endsWith('.pdf')) {
                kind = 'pdf';
                const pdfData = await pdfParse(buffer);
                text = pdfData.text ?? '';
            } else if (fileName.endsWith('.pptx')) {
                kind = 'pptx';
                officeZip = await JSZip.loadAsync(buffer);
                text = await extractPptxText(officeZip);
            } else if (fileName.endsWith('.docx')) {
                kind = 'docx';
                officeZip = await JSZip.loadAsync(buffer);
                text = await extractDocxText(officeZip);
            } else if (fileName.endsWith('.xlsx')) {
                kind = 'xlsx';
                const z = await JSZip.loadAsync(buffer);
                text = await extractXlsxText(z);
            } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
                kind = 'text';
                text = await file.text();
            } else if (fileName.endsWith('.json')) {
                kind = 'text';
                text = JSON.stringify(JSON.parse(await file.text()), null, 2);
            } else {
                return json({ error: 'Formato não suportado. Use .pdf, .pptx, .docx, .xlsx, .txt, .md, .csv, .json ou imagens (.png, .jpg, .webp, .gif).' }, 400);
            }
        } catch {
            return json({ error: 'Erro ao processar o arquivo. Verifique se não está corrompido.' }, 400);
        }

        if (!text.trim() && kind !== 'docx' && kind !== 'pptx') {
            return json({ error: 'O arquivo está vazio ou não contém texto extraível.' }, 400);
        }

        const { data: doc, error: docError } = await supabase
            .from('documents')
            .insert({
                title: title || file.name,
                file_url: null,
                uploaded_by: user.email ?? user.id,
            })
            .select()
            .single();

        if (docError || !doc) return json({ error: 'Erro ao salvar documento.' }, 500);

        const textResult = text.trim() ? await indexTextChunks(doc.id, text) : { successCount: 0, total: 0 };

        // Image extraction — best-effort, never blocks the response
        let imagesIndexed = 0;
        let imagesFailed = 0;
        try {
            let inputs: IngestInput[] = [];
            if (kind === 'docx' && officeZip) {
                inputs = await collectOfficeImages(officeZip, 'docx', doc.id, file.name);
            } else if (kind === 'pptx' && officeZip) {
                inputs = await collectOfficeImages(officeZip, 'pptx', doc.id, file.name);
            }

            if (inputs.length > 0) {
                console.log(`  🖼  Ingesting ${inputs.length} image(s) for ${doc.id}`);
                const results = await ingestImages(inputs, 4);
                for (const r of results) {
                    if (r.ok) imagesIndexed++;
                    else imagesFailed++;
                }
            }
        } catch (err: any) {
            console.error('  ⚠ image extraction failed (continuing):', err?.message ?? err);
        }

        return json({
            success: true,
            message: `Documento "${doc.title}" processado. ${textResult.successCount}/${textResult.total} trechos indexados. ${imagesIndexed} imagem(ns) indexada(s)${imagesFailed ? ` (${imagesFailed} falha(s))` : ''}.`,
            documentId: doc.id,
            chunksProcessed: textResult.successCount,
            totalChunks: textResult.total,
            imagesIndexed,
            imagesFailed,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return json({ error: 'Erro ao processar o documento.' }, 500);
    }
}
