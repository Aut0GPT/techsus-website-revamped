/**
 * One-off: backfill document_embeddings.embedding with OpenAI text-embedding-3-large (3072 dims).
 *
 * Run after applying supabase/migrations/openai_embeddings_3072.sql.
 * Idempotent: only processes rows where embedding IS NULL.
 *
 * Usage:
 *   npx tsx scripts/reembed.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { embedBatch } from '../src/lib/embeddings';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !OPENAI_KEY) {
    console.error('Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const PAGE = 100;

async function main() {
    const { count, error: countErr } = await supabase
        .from('document_embeddings')
        .select('id', { count: 'exact', head: true })
        .is('embedding', null);

    if (countErr) {
        console.error('Count failed:', countErr.message);
        process.exit(1);
    }

    const total = count ?? 0;
    console.log(`Rows needing embedding: ${total}`);
    if (total === 0) {
        console.log('Nothing to do.');
        return;
    }

    let processed = 0;
    let failed = 0;

    while (true) {
        const { data: rows, error } = await supabase
            .from('document_embeddings')
            .select('id, content')
            .is('embedding', null)
            .limit(PAGE);

        if (error) {
            console.error('Fetch batch failed:', error.message);
            break;
        }
        if (!rows || rows.length === 0) break;

        const texts = rows.map(r => r.content ?? '');
        const embeddings = await embedBatch(texts, PAGE);

        for (let i = 0; i < rows.length; i++) {
            const emb = embeddings[i];
            if (!emb) {
                failed++;
                continue;
            }
            const { error: updErr } = await supabase
                .from('document_embeddings')
                .update({ embedding: emb })
                .eq('id', rows[i].id);
            if (updErr) {
                console.error(`  ⚠ row ${rows[i].id}:`, updErr.message);
                failed++;
            } else {
                processed++;
            }
        }

        console.log(`  progress: ${processed}/${total} (${failed} failed)`);
    }

    console.log(`Done. ${processed} embedded, ${failed} failed.`);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
