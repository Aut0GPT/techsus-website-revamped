import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export const maxDuration = 120;

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

// Strip XML tags and return plain text
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

// Extract text from PPTX (PowerPoint) files
async function extractPptxText(buffer: Buffer): Promise<string> {
    const zip = await JSZip.loadAsync(buffer);
    const slides: string[] = [];

    // PPTX slides are in ppt/slides/slide1.xml, slide2.xml, etc.
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
        if (text.trim()) {
            slides.push(text.trim());
        }
    }

    // Also check notes
    const noteFiles = Object.keys(zip.files)
        .filter(name => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));

    for (const noteFile of noteFiles) {
        const content = await zip.files[noteFile].async('text');
        const text = stripXml(content);
        if (text.trim()) {
            slides.push('[Nota] ' + text.trim());
        }
    }

    return slides.join('\n\n');
}

// Extract text from DOCX (Word) files
async function extractDocxText(buffer: Buffer): Promise<string> {
    const zip = await JSZip.loadAsync(buffer);
    const docFile = zip.files['word/document.xml'];
    if (!docFile) return '';

    const content = await docFile.async('text');
    return stripXml(content);
}

// Extract text from XLSX (Excel) files
async function extractXlsxText(buffer: Buffer): Promise<string> {
    const zip = await JSZip.loadAsync(buffer);

    // Get shared strings first (XLSX stores text in a shared strings table)
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

    // Get sheet data
    const sheets: string[] = [];
    const sheetFiles = Object.keys(zip.files)
        .filter(name => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
        .sort();

    for (const sheetFile of sheetFiles) {
        const content = await sheetFile ? await zip.files[sheetFile].async('text') : '';
        const text = stripXml(content);
        if (text.trim()) {
            sheets.push(text.trim());
        }
    }

    // Combine shared strings and sheet content
    const allText = [...sharedStrings, ...sheets].filter(Boolean).join(' ');
    return allText;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text }] },
                    taskType: 'RETRIEVAL_DOCUMENT',
                    outputDimensionality: 768,
                }),
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.embedding?.values || null;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string | null;
        const authCode = formData.get('authCode') as string | null;

        // Simple auth check
        if (authCode !== process.env.ZENINHO_AUTH_CODE) {
            return new Response(
                JSON.stringify({ error: 'Acesso não autorizado.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'Nenhum arquivo enviado.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Extract text from file
        let text = '';
        const fileName = file.name.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());

        if (fileName.endsWith('.pdf')) {
            try {
                const pdfData = await pdfParse(buffer);
                text = pdfData.text;
            } catch {
                return new Response(
                    JSON.stringify({ error: 'Erro ao processar o PDF. Verifique se o arquivo não está corrompido.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else if (fileName.endsWith('.pptx')) {
            try {
                text = await extractPptxText(buffer);
            } catch {
                return new Response(
                    JSON.stringify({ error: 'Erro ao processar o PowerPoint. Verifique se o arquivo não está corrompido.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else if (fileName.endsWith('.docx')) {
            try {
                text = await extractDocxText(buffer);
            } catch {
                return new Response(
                    JSON.stringify({ error: 'Erro ao processar o Word. Verifique se o arquivo não está corrompido.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else if (fileName.endsWith('.xlsx')) {
            try {
                text = await extractXlsxText(buffer);
            } catch {
                return new Response(
                    JSON.stringify({ error: 'Erro ao processar o Excel. Verifique se o arquivo não está corrompido.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
            text = await file.text();
        } else if (fileName.endsWith('.json')) {
            const jsonContent = await file.text();
            text = JSON.stringify(JSON.parse(jsonContent), null, 2);
        } else {
            return new Response(
                JSON.stringify({ error: 'Formato não suportado. Use .pdf, .pptx, .docx, .xlsx, .txt, .md, .csv ou .json.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!text.trim()) {
            return new Response(
                JSON.stringify({ error: 'O arquivo está vazio ou não contém texto extraível.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create document record
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .insert({
                title: title || file.name,
                file_url: null,
                uploaded_by: 'zeninho-user',
            })
            .select()
            .single();

        if (docError || !doc) {
            return new Response(
                JSON.stringify({ error: 'Erro ao salvar documento.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Chunk the text
        const chunks = chunkText(text);

        // Generate embeddings and store
        let successCount = 0;
        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);
            if (embedding) {
                const { error } = await supabase.from('document_embeddings').insert({
                    document_id: doc.id,
                    content: chunk,
                    embedding: embedding,
                });
                if (!error) successCount++;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Documento "${doc.title}" processado com sucesso! ${successCount}/${chunks.length} trechos indexados.`,
                documentId: doc.id,
                chunksProcessed: successCount,
                totalChunks: chunks.length,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(
            JSON.stringify({ error: 'Erro ao processar o documento.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
