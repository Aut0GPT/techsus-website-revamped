'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, MicOff, Square, Download, Plus, Users } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Speaker = {
    id: number;
    label: string;
    color: string;
    borderColor: string;
    bgColor: string;
};

type Segment = {
    id: string;
    speaker: Speaker;
    interimText: string;
    finalText: string;
    timestamp: Date;
    isFinal: boolean;
    whisperDone: boolean;
};

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SPEAKERS: Speaker[] = [
    { id: 1, label: 'Pessoa 1', color: 'text-orange-400', borderColor: 'border-orange-500', bgColor: 'bg-orange-500/10' },
    { id: 2, label: 'Pessoa 2', color: 'text-blue-400',   borderColor: 'border-blue-500',   bgColor: 'bg-blue-500/10'   },
    { id: 3, label: 'Pessoa 3', color: 'text-green-400',  borderColor: 'border-green-500',  bgColor: 'bg-green-500/10'  },
    { id: 4, label: 'Pessoa 4', color: 'text-violet-400', borderColor: 'border-violet-500', bgColor: 'bg-violet-500/10' },
    { id: 5, label: 'Pessoa 5', color: 'text-pink-400',   borderColor: 'border-pink-500',   bgColor: 'bg-pink-500/10'   },
];

const WHISPER_INTERVAL_MS = 30_000;
const SPEAKER_GAP_MS      = 1_500;

function formatElapsed(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TranscricaoReuniao() {
    const router = useRouter();

    // ── Recording state ──
    const [isRecording, setIsRecording]   = useState(false);
    const [isPaused, setIsPaused]         = useState(false);
    const [elapsedMs, setElapsedMs]       = useState(0);

    // ── Transcription state ──
    const [segments, setSegments]         = useState<Segment[]>([]);
    const [currentInterim, setCurrentInterim] = useState('');
    const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0);

    // ── Speaker management ──
    const [speakers, setSpeakers]         = useState<Speaker[]>(DEFAULT_SPEAKERS.slice(0, 2));
    const [editingId, setEditingId]       = useState<number | null>(null);
    const [editLabel, setEditLabel]       = useState('');
    const [manualSpeakerIdx, setManualSpeakerIdx] = useState<number | null>(null); // override

    // ── Refs ──
    const recognitionRef     = useRef<any>(null);
    const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
    const streamRef          = useRef<MediaStream | null>(null);
    const audioChunksRef     = useRef<Blob[]>([]);
    const mimeTypeRef        = useRef('audio/webm;codecs=opus');
    const lastSegmentTimeRef = useRef<number>(0);
    const speakerCursorRef   = useRef(0);
    const chunkTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef       = useRef<number>(0);
    const pausedAtRef        = useRef<number>(0);
    const scrollRef          = useRef<HTMLDivElement>(null);
    const pendingSegmentIds  = useRef<string[]>([]); // segments waiting for Whisper correction

    // ── Auto-scroll ──
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments, currentInterim]);

    // ── Speaker helpers ──
    const currentSpeaker = useCallback((): Speaker => {
        const idx = manualSpeakerIdx !== null ? manualSpeakerIdx : speakerCursorRef.current;
        return speakers[idx % speakers.length];
    }, [speakers, manualSpeakerIdx]);

    // ── Add segment ──
    const addFinalSegment = useCallback((text: string) => {
        if (!text.trim()) return;

        const now = Date.now();
        const gap = now - lastSegmentTimeRef.current;

        // Gap-based speaker change (only when no manual override)
        if (manualSpeakerIdx === null && lastSegmentTimeRef.current > 0 && gap > SPEAKER_GAP_MS) {
            speakerCursorRef.current = (speakerCursorRef.current + 1) % speakers.length;
        }
        lastSegmentTimeRef.current = now;

        const speaker = manualSpeakerIdx !== null
            ? speakers[manualSpeakerIdx % speakers.length]
            : speakers[speakerCursorRef.current % speakers.length];

        const id = `seg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        pendingSegmentIds.current.push(id);

        setSegments(prev => [...prev, {
            id,
            speaker,
            interimText: text,
            finalText: '',
            timestamp: new Date(),
            isFinal: true,
            whisperDone: false,
        }]);
        setCurrentInterim('');
    }, [speakers, manualSpeakerIdx]);

    // ── Whisper flush ──
    const flushToWhisper = useCallback(async () => {
        if (audioChunksRef.current.length === 0) return;

        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        const blob = new Blob(chunks, { type: mimeTypeRef.current });
        if (blob.size < 1000) return; // skip tiny blobs

        const segIds = [...pendingSegmentIds.current];
        pendingSegmentIds.current = [];

        try {
            const form = new FormData();
            form.append('audio', blob, `chunk.${mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'}`);
            const res = await fetch('/api/transcribe', { method: 'POST', body: form });
            if (!res.ok) return;

            const data = await res.json();
            const whisperText: string = data.text?.trim() ?? '';
            if (!whisperText) return;

            // Replace interim text of pending segments with Whisper-corrected version
            setSegments(prev => {
                const updated = [...prev];
                // Merge whisper text across the pending segment ids
                const indices = updated.map((s, i) => segIds.includes(s.id) ? i : -1).filter(i => i >= 0);
                if (indices.length === 0) return prev;

                // Distribute whisper text: put all in the last segment, clear others
                // This is the simplest approach — Whisper gives us one text for the whole chunk
                const lastIdx = indices[indices.length - 1];
                indices.forEach((i, pos) => {
                    updated[i] = {
                        ...updated[i],
                        finalText: pos === indices.length - 1 ? whisperText : '',
                        whisperDone: true,
                    };
                });
                // If only one segment, just set it
                if (indices.length === 1) {
                    updated[lastIdx] = { ...updated[lastIdx], finalText: whisperText, whisperDone: true };
                }
                return updated;
            });
        } catch {
            // Silently ignore Whisper errors — interim text remains
        }
    }, []);

    // ── Start recording ──
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Detect best MIME type
            const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';
            mimeTypeRef.current = preferredMime;

            const mr = new MediaRecorder(stream, { mimeType: preferredMime });
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            mr.start(1000); // collect data every 1s

            // Web Speech API
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SR) {
                console.warn('Web Speech API not available');
            } else {
                const recognition = new SR();
                recognitionRef.current = recognition;
                recognition.continuous     = true;
                recognition.interimResults = true;
                recognition.lang           = 'pt-BR';
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
                    if (e.error === 'no-speech') return; // normal
                    console.warn('Speech recognition error:', e.error);
                };

                recognition.onend = () => {
                    // Auto-restart unless we've stopped intentionally
                    if (mediaRecorderRef.current?.state === 'recording') {
                        try { recognition.start(); } catch {}
                    }
                };

                recognition.start();
            }

            // Whisper flush timer
            chunkTimerRef.current = setInterval(flushToWhisper, WHISPER_INTERVAL_MS);

            // Elapsed timer
            startTimeRef.current = Date.now();
            elapsedTimerRef.current = setInterval(() => {
                setElapsedMs(Date.now() - startTimeRef.current);
            }, 1000);

            speakerCursorRef.current = 0;
            lastSegmentTimeRef.current = 0;
            setIsRecording(true);
            setIsPaused(false);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    }, [addFinalSegment, flushToWhisper]);

    // ── Pause / Resume ──
    const togglePause = useCallback(() => {
        if (!isRecording) return;

        if (!isPaused) {
            // Pause
            mediaRecorderRef.current?.pause();
            recognitionRef.current?.stop();
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            pausedAtRef.current = Date.now();
            setIsPaused(true);
        } else {
            // Resume
            mediaRecorderRef.current?.resume();
            try { recognitionRef.current?.start(); } catch {}
            const pausedDuration = Date.now() - pausedAtRef.current;
            startTimeRef.current += pausedDuration;
            elapsedTimerRef.current = setInterval(() => {
                setElapsedMs(Date.now() - startTimeRef.current);
            }, 1000);
            setIsPaused(false);
        }
    }, [isRecording, isPaused]);

    // ── Stop recording ──
    const stopRecording = useCallback(async () => {
        // Clear timers
        if (chunkTimerRef.current)  clearInterval(chunkTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

        // Stop Web Speech
        try { recognitionRef.current?.stop(); } catch {}
        recognitionRef.current = null;

        // Stop MediaRecorder and flush final chunk
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => {
                await flushToWhisper();
            };
            if (mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        }

        // Stop stream tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        setIsRecording(false);
        setIsPaused(false);
        setCurrentInterim('');
    }, [flushToWhisper]);

    // ── Add speaker ──
    const addSpeaker = useCallback(() => {
        if (speakers.length >= DEFAULT_SPEAKERS.length) return;
        setSpeakers(prev => [...prev, DEFAULT_SPEAKERS[prev.length]]);
    }, [speakers.length]);

    // ── Rename speaker ──
    const startEdit = (speaker: Speaker) => {
        setEditingId(speaker.id);
        setEditLabel(speaker.label);
    };

    const commitEdit = () => {
        if (editingId === null) return;
        setSpeakers(prev => prev.map(s => s.id === editingId ? { ...s, label: editLabel || s.label } : s));
        setSegments(prev => prev.map(seg =>
            seg.speaker.id === editingId
                ? { ...seg, speaker: { ...seg.speaker, label: editLabel || seg.speaker.label } }
                : seg
        ));
        setEditingId(null);
    };

    // ── Export ──
    const exportTxt = useCallback(() => {
        const lines = segments
            .filter(s => s.finalText || s.interimText)
            .map(s => {
                const time = s.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const text = s.finalText || s.interimText;
                return `[${time}] ${s.speaker.label}: ${text}`;
            });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `reuniao-${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [segments]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            if (chunkTimerRef.current)   clearInterval(chunkTimerRef.current);
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
                    <Users size={16} className="text-orange-400" />
                    <span className="font-semibold text-sm">Transcrição de Reunião</span>
                </div>

                <div className="flex items-center gap-2 text-sm tabular-nums font-mono text-stone-400">
                    {isRecording && (
                        <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-stone-500' : 'bg-red-500 animate-pulse'}`} />
                    )}
                    <span>{formatElapsed(elapsedMs)}</span>
                </div>
            </header>

            {/* ── Controls ── */}
            <div className="flex flex-col gap-3 px-4 py-3 border-b border-stone-800 shrink-0">
                {/* Recording buttons */}
                <div className="flex items-center gap-2 flex-wrap">
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

                {/* Speaker chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-stone-500 shrink-0">Participantes:</span>
                    {speakers.map((speaker, idx) => (
                        <button
                            key={speaker.id}
                            onClick={() => setManualSpeakerIdx(manualSpeakerIdx === idx ? null : idx)}
                            onDoubleClick={() => startEdit(speaker)}
                            title="Clique para selecionar • Duplo clique para renomear"
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                                manualSpeakerIdx === idx
                                    ? `${speaker.color} ${speaker.borderColor} ${speaker.bgColor}`
                                    : 'text-stone-400 border-stone-700 bg-stone-800/50 hover:border-stone-500'
                            }`}
                        >
                            {editingId === speaker.id ? (
                                <input
                                    autoFocus
                                    value={editLabel}
                                    onChange={e => setEditLabel(e.target.value)}
                                    onBlur={commitEdit}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                                    className="bg-transparent outline-none w-20 text-xs"
                                    onClick={e => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <span className={`w-1.5 h-1.5 rounded-full ${speaker.color.replace('text-','bg-')}`} />
                                    {speaker.label}
                                </>
                            )}
                        </button>
                    ))}
                    {speakers.length < DEFAULT_SPEAKERS.length && (
                        <button
                            onClick={addSpeaker}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-stone-500 hover:text-stone-300 border border-dashed border-stone-700 hover:border-stone-500 transition-colors"
                        >
                            <Plus size={11} />
                            Adicionar
                        </button>
                    )}
                    {manualSpeakerIdx !== null && (
                        <span className="text-xs text-stone-500 ml-1 italic">
                            Próxima fala: {speakers[manualSpeakerIdx % speakers.length]?.label}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Transcript area ── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
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
                        <div
                            key={seg.id}
                            className={`border-l-2 pl-3 py-0.5 ${seg.speaker.borderColor}`}
                        >
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-semibold ${seg.speaker.color}`}>
                                    {seg.speaker.label}
                                </span>
                                <span className="text-xs text-stone-600">
                                    {seg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                {seg.whisperDone && (
                                    <span className="text-[10px] text-stone-600 italic">✓ corrigido</span>
                                )}
                            </div>
                            <p className="text-sm text-stone-200 leading-relaxed">
                                {displayText}
                            </p>
                        </div>
                    );
                })}

                {/* Interim (live) */}
                {currentInterim && (
                    <div className={`border-l-2 pl-3 py-0.5 ${currentSpeaker().borderColor} opacity-60`}>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-semibold ${currentSpeaker().color}`}>
                                {currentSpeaker().label}
                            </span>
                            <span className="text-xs text-stone-600 italic animate-pulse">ao vivo…</span>
                        </div>
                        <p className="text-sm text-stone-400 italic leading-relaxed">
                            {currentInterim}
                        </p>
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
