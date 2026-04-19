/**
 * One-off: index every image in public/images/imagenscomdescricao/ into
 * document_images. Each file is described by gpt-5.4, its description is
 * embedded, and a row is inserted with source='static'. Idempotent — the
 * unique index on (filename) WHERE source='static' skips previously processed
 * files on re-run.
 *
 * Usage:
 *   npx tsx scripts/indexStaticImages.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

config({ path: '.env.local' });
config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !OPENAI_KEY) {
    console.error('Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.');
    process.exit(1);
}

import { ingestImage } from '../src/lib/imageIngest';

const FOLDER_ABS = path.join(process.cwd(), 'public', 'images', 'imagenscomdescricao');
const URL_PREFIX = '/images/imagenscomdescricao/';
const EXT_RE = /\.(png|jpe?g|webp|gif)$/i;

function mimeFromExt(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    return 'application/octet-stream';
}

async function main() {
    const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

    const files = (await readdir(FOLDER_ABS)).filter(f => EXT_RE.test(f));
    console.log(`Found ${files.length} image files in ${FOLDER_ABS}`);

    const { data: existing, error: listErr } = await supabase
        .from('document_images')
        .select('filename')
        .eq('source', 'static');

    if (listErr) {
        console.error('Failed to list existing static rows:', listErr.message);
        process.exit(1);
    }
    const already = new Set((existing ?? []).map(r => r.filename));
    const todo = files.filter(f => !already.has(f));
    console.log(`Already indexed: ${already.size}. To process: ${todo.length}.`);

    let ok = 0;
    let failed = 0;

    for (let i = 0; i < todo.length; i++) {
        const name = todo[i];
        process.stdout.write(`  [${i + 1}/${todo.length}] ${name} ... `);
        try {
            const buffer = await readFile(path.join(FOLDER_ABS, name));
            const result = await ingestImage({
                buffer,
                mimeType: mimeFromExt(name),
                source: 'static',
                filename: name,
                documentId: null,
                imageUrl: URL_PREFIX + encodeURIComponent(name),
                storagePath: null,
            });
            if (result.ok) {
                ok++;
                console.log('✓');
            } else {
                failed++;
                console.log(`✗ (${result.reason})`);
            }
        } catch (err: any) {
            failed++;
            console.log(`✗ (${err?.message ?? err})`);
        }
    }

    console.log(`\nDone. ${ok} indexed, ${failed} failed, ${already.size} skipped.`);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
