import { requireUser } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 60;

export async function POST(req: Request) {
    const { user, response: authErr } = await requireUser();
    if (authErr) return authErr;

    const limit = await checkRateLimit(user.id, 'transcribe', 60, 3600);
    if (!limit.allowed) return rateLimitResponse(limit, 'transcrições');

    try {
        const formData = await req.formData();
        const audio = formData.get('audio') as File;

        if (!audio) {
            return Response.json({ error: 'no audio file provided' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Detect format (Chrome records webm, Safari records mp4)
        const ext = audio.type.includes('mp4') ? 'mp4' : 'webm';

        const oaiForm = new FormData();
        oaiForm.append('file', audio, `audio.${ext}`);
        oaiForm.append('model', 'whisper-1');
        oaiForm.append('language', 'pt');
        oaiForm.append('response_format', 'verbose_json');
        oaiForm.append('timestamp_granularities[]', 'segment');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: oaiForm,
            signal: AbortSignal.timeout(55000),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('  ❌ Whisper error:', res.status, err.slice(0, 200));
            return Response.json({ error: `Whisper API error: ${res.status}` }, { status: 500 });
        }

        const data = await res.json();
        return Response.json({
            text: data.text?.trim() ?? '',
            segments: data.segments ?? [],
        });
    } catch (err: any) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return Response.json({ error: 'Whisper timeout' }, { status: 504 });
        }
        console.error('  ❌ /api/transcribe error:', err);
        return Response.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
    }
}
