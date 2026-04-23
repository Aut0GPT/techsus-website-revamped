'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, MicOff, Square, Download } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Segment = {
    id: string;
    interimText: string;
    finalText: string;
    /** Absolute wall-clock time the segment was captured */
    timestamp: Date;
    /** Elapsed recording time in ms when segment was captured */
    elapsedMs: number;
    isFinal: boolean;
    whisperDone: boolean;
};

// ── Constants ────────────────────────────────────────────────────────────────

const WHISPER_INTERVAL_MS = 30_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(ms: number): string {
    const s   = Math.floor(ms / 1000);
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
    return `${pad(m)}:${pad(sec)}`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TranscricaoReuniao() {
    const router = useRouter();

    // ── Recording state ──
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused]       = useState(false);
    const [elapsedMs, setElapsedMs]     = useState(0);

    // ── Transcription state ──
    const [segments, setSegments]           = useState<Segment[]>([]);
    const [currentInterim, setCurrentInterim] = useState('');

    // ── Refs ──
    const recognitionRef   = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef        = useRef<MediaStream | null>(null);
    const audioChunksRef   = useRef<Blob[]>([]);
    const mimeTypeRef      = useRef('audio/webm;codecs=opus');
    const chunkTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef     = useRef<number>(0);
    const pausedAtRef      = useRef<number>(0);
    const pausedTotalRef   = useRef<number>(0); // cumulative paused duration
    const scrollRef        = useRef<HTMLDivElement>(null);
    const pendingSegIds    = useRef<string[]>([]);

    // ── Auto-scroll ──
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments, currentInterim]);

    // ── Elapsed getter (accounts for pauses) ──
    const getElapsed = useCallback(() =>
        Date.now() - startTimeRef.current - pausedTotalRef.current,
    []);

    // ── Add segment ──
    const addFinalSegment = useCallback((text: string) => {
        if (!text.trim()) return;
        const id = `seg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        pendingSegIds.current.push(id);
        setSegments(prev => [...prev, {
            id,
            interimText: text,
            finalText: '',
            timestamp: new Date(),
            elapsedMs: getElapsed(),
            isFinal: true,
            whisperDone: false,
        }]);
        setCurrentInterim('');
    }, [getElapsed]);

    // ── Whisper flush ──
    const flushToWhisper = useCallback(async () => {
        if (audioChunksRef.current.length === 0) return;

        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        const blob = new Blob(chunks, { type: mimeTypeRef.current });
        if (blob.size < 1000) return;

        const segIds = [...pendingSegIds.current];
        pendingSegIds.current = [];

        try {
            const form = new FormData();
            form.append('audio', blob, `chunk.${mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'}`);
            const res = await fetch('/api/transcribe', { method: 'POST', body: form });
            if (!res.ok) return;

            const data = await res.json();
            const whisperText: string = data.text?.trim() ?? '';
            if (!whisperText) return;

            setSegments(prev => {
                const updated = [...prev];
                const indices = updated.map((s, i) => segIds.includes(s.id) ? i : -1).filter(i => i >= 0);
                if (indices.length === 0) return prev;

                // Put the full whisper text on the last segment, clear earlier ones in the batch
                indices.forEach((i, pos) => {
                    updated[i] = {
                        ...updated[i],
                        finalText: pos === indices.length - 1 ? whisperText : '',
                        whisperDone: true,
                    };
                });
                if (indices.length === 1) {
                    updated[indices[0]] = { ...updated[indices[0]], finalText: whisperText, whisperDone: true };
                }
                return updated;
            });
        } catch {
            // Silently ignore — interim text remains visible
        }
    }, []);

    // ── Start recording ──
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';
            mimeTypeRef.current = preferredMime;

            const mr = new MediaRecorder(stream, { mimeType: preferredMime });
            mediaRecorderRef.current = mr;
            audioChunksRef.current   = [];

            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mr.start(1000);

            // Web Speech API — live captions
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SR) {
                const recognition = new SR();
                recognitionRef.current = recognition;
                recognition.continuous      = true;
                recognition.interimResults  = true;
                recognition.lang            = 'pt-BR';
                recognition.maxAlternatives = 1;

                recognition.onresult = (event: any) => {
                    let interim = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            addFinalSegment(result[0].transcript);
                        } else {
                            interim += result[0].transcript;
                        }
                    }
                    setCurrentInterim(interim);
                };

                recognition.onerror = (e: any) => {
                    if (e.error === 'no-speech') return;
                    console.warn('Speech recognition error:', e.error);
                };

                recognition.onend = () => {
                    if (mediaRecorderRef.current?.state === 'recording') {
                        try { recognition.start(); } catch {}
                    }
                };

                recognition.start();
            } else {
                console.warn('Web Speech API not available in this browser');
            }

            // Whisper flush timer
            chunkTimerRef.current = setInterval(flushToWhisper, WHISPER_INTERVAL_MS);

            // Elapsed timer
            startTimeRef.current   = Date.now();
            pausedTotalRef.current = 0;
            elapsedTimerRef.current = setInterval(() => {
                setElapsedMs(Date.now() - startTimeRef.current - pausedTotalRef.current);
            }, 500);

            setIsRecording(true);
            setIsPaused(false);
            setSegments([]);
            setCurrentInterim('');
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    }, [addFinalSegment, flushToWhisper]);

    // ── Pause / Resume ──
    const togglePause = useCallback(() => {
        if (!isRecording) return;

        if (!isPaused) {
            mediaRecorderRef.current?.pause();
            recognitionRef.current?.stop();
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            pausedAtRef.current = Date.now();
            setIsPaused(true);
        } else {
            mediaRecorderRef.current?.resume();
            try { recognitionRef.current?.start(); } catch {}
            pausedTotalRef.current += Date.now() - pausedAtRef.current;
            elapsedTimerRef.current = setInterval(() => {
                setElapsedMs(Date.now() - startTimeRef.current - pausedTotalRef.current);
            }, 500);
            setIsPaused(false);
        }
    }, [isRecording, isPaused]);

    // ── Stop recording ──
    const stopRecording = useCallback(async () => {
        if (chunkTimerRef.current)  clearInterval(chunkTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

        try { recognitionRef.current?.stop(); } catch {}
        recognitionRef.current = null;

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => { await flushToWhisper(); };
            if (mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        }

        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        setIsRecording(false);
        setIsPaused(false);
        setCurrentInterim('');
    }, [flushToWhisper]);

    // ── Export ──
    const exportTxt = useCallback(() => {
        const lines = segments
            .filter(s => s.finalText || s.interimText)
            .map(s => {
                const clock   = formatTimestamp(s.timestamp);
                const elapsed = formatElapsed(s.elapsedMs);
                const text    = s.finalText || s.interimText;
                return `[${clock} | +${elapsed}] ${text}`;
            });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `reuniao-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [segments]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            if (chunkTimerRef.current)  clearInterval(chunkTimerRef.current);
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            try { recognitionRef.current?.stop(); } catch {}
            mediaRecorderRef.current?.stop();
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-stone-950 text-stone-100">

            {/* ── Header ── */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-stone-800 shrink-0">
                <button
                    onClick={() => router.push('/zeninho')}
                    className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                </button>

                <div className="flex items-center gap-2">
                    <Mic size={16} className="text-orange-400" />
                    <span className="font-semibold text-sm">Transcrição de Reunião</span>
                </div>

                {/* Elapsed clock */}
                <div className="flex items-center gap-2 text-sm tabular-nums font-mono text-stone-400">
                    {isRecording && (
                        <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-stone-500' : 'bg-red-500 animate-pulse'}`} />
                    )}
                    <span>{formatElapsed(elapsedMs)}</span>
                </div>
            </header>

            {/* ── Controls ── */}
            <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-stone-800 shrink-0">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-sm transition-colors"
                    >
                        <Mic size={15} />
                        Iniciar Gravação
                    </button>
                ) : (
                    <>
                        <button
                            onClick={togglePause}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-medium text-sm transition-colors"
                        >
                            {isPaused ? <Mic size={15} /> : <MicOff size={15} />}
                            {isPaused ? 'Retomar' : 'Pausar'}
                        </button>
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-300 font-medium text-sm transition-colors border border-red-800/50"
                        >
                            <Square size={13} fill="currentColor" />
                            Parar
                        </button>
                    </>
                )}

                {segments.length > 0 && (
                    <button
                        onClick={exportTxt}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-sm transition-colors border border-stone-700 ml-auto"
                    >
                        <Download size={14} />
                        Exportar .txt
                    </button>
                )}
            </div>

            {/* ── Transcript area ── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            >
                {segments.length === 0 && !isRecording && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-600">
                        <Mic size={32} />
                        <p className="text-sm">Clique em &quot;Iniciar Gravação&quot; para começar</p>
                    </div>
                )}

                {segments.map(seg => {
                    const displayText = seg.finalText || seg.interimText;
                    if (!displayText) return null;
                    return (
                        <div key={seg.id} className="flex gap-3 py-1.5 group">
                            {/* Timestamp column */}
                            <div className="shrink-0 pt-0.5 text-right" style={{ minWidth: '7rem' }}>
                                <span className="text-xs font-mono text-stone-500 group-hover:text-stone-400 transition-colors">
                                    {formatTimestamp(seg.timestamp)}
                                </span>
                                <div className="text-[10px] font-mono text-stone-700 group-hover:text-stone-600 transition-colors">
                                    +{formatElapsed(seg.elapsedMs)}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="shrink-0 w-px bg-stone-800 group-hover:bg-stone-700 transition-colors mt-1" />

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-stone-200 leading-relaxed">
                                    {displayText}
                                </p>
                                {seg.whisperDone && (
                                    <span className="text-[10px] text-stone-600 italic">✓ corrigido</span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Live interim */}
                {currentInterim && (
                    <div className="flex gap-3 py-1.5 opacity-50">
                        <div className="shrink-0 pt-0.5 text-right" style={{ minWidth: '7rem' }}>
                            <span className="text-xs font-mono text-stone-500 animate-pulse">ao vivo…</span>
                        </div>
                        <div className="shrink-0 w-px bg-stone-800 mt-1" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-400 italic leading-relaxed">
                                {currentInterim}
                            </p>
                        </div>
                    </div>
                )}

                {isRecording && !currentInterim && segments.length === 0 && (
                    <div className="flex items-center gap-2 text-stone-600 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Aguardando fala…
                    </div>
                )}
            </div>
        </div>
    );
}
