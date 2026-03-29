'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Upload, Loader2, Menu, Sparkles, ImagePlus, BarChart3, Presentation,
    Paperclip, Mic, MicOff, X, Volume2, Cpu, Settings, Moon, Sun, Type,
    Check, MessageSquarePlus, Search, Globe, Clock, FolderOpen, Ruler, Zap,
    LogOut, Trash2,
} from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

/* eslint-disable */
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ConversationSummary {
    id: string;
    title: string;
    model: string;
    updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = diffMs / 60000;
    const diffHours = diffMin / 60;
    const diffDays = diffHours / 24;

    if (diffMin < 2) return 'agora';
    if (diffMin < 60) return `${Math.floor(diffMin)}min atrás`;
    if (diffHours < 24) return `${Math.floor(diffHours)}h atrás`;
    if (diffDays < 2) return 'ontem';
    if (diffDays < 7) return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function generateTitle(messages: any[]): string {
    const firstUser = messages.find((m) => m.role === 'user');
    if (!firstUser) return 'Nova conversa';
    const text =
        firstUser.parts?.find((p: any) => p.type === 'text')?.text ||
        (typeof firstUser.content === 'string' ? firstUser.content : '') ||
        'Nova conversa';
    return text.length > 52 ? text.slice(0, 50) + '…' : text;
}

// Strip base64 blobs before storing — keep only text + tool parts
function sanitizeForStorage(messages: any[]): any[] {
    return messages.map((msg) => ({
        ...msg,
        experimental_attachments: undefined,
        parts: (msg.parts ?? [])
            .filter((p: any) => p.type !== 'file')
            .map((p: any) => {
                // Don't store inline base64 images from tool results
                if (
                    p.type === 'tool-invocation' &&
                    p.toolInvocation?.result?.imageUrl?.startsWith('data:')
                ) {
                    return {
                        ...p,
                        toolInvocation: {
                            ...p.toolInvocation,
                            result: {
                                ...p.toolInvocation.result,
                                imageUrl: null,
                                message: 'Imagem não persistida (base64)',
                            },
                        },
                    };
                }
                return p;
            }),
    }));
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ZeninhoChat() {
    const [aiModel, setAiModel] = useState<'gemini' | 'chatgpt'>('gemini');

    const { messages, sendMessage, status, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: `/api/chat?model=${aiModel}`,
        }),
    });

    // ── Auth & user ────────────────────────────────────────────────────────
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [userInitial, setUserInitial] = useState<string>('?');

    // ── Conversations ──────────────────────────────────────────────────────
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── UI state ───────────────────────────────────────────────────────────
    const [input, setInput] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'geral' | 'aparencia' | 'ia' | 'som'>('geral');
    const [darkMode, setDarkMode] = useState(true);
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [zeninhoMood, setZeninhoMood] = useState<'idle' | 'thinking' | 'done'>('idle');
    const [chatFiles, setChatFiles] = useState<FileList | undefined>(undefined);
    const [filePreviews, setFilePreviews] = useState<{ name: string; url: string; type: string }[]>([]);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatFileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const lastStatusRef = useRef(status);
    const savingRef = useRef(false);
    // Tool invocation cache — persists tool parts even after the SDK drops them from message.parts
    // Key: message.id  Value: array of tool-invocation parts seen for that message
    const toolCacheRef = useRef<Record<string, any[]>>({});

    const isLoading = status === 'streaming' || status === 'submitted';

    // ── Get user on mount ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = createBrowserSupabaseClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email ?? '');
                const initial = (user.email ?? 'U')[0].toUpperCase();
                setUserInitial(initial);
            }
        });
    }, []);

    // ── Load conversations when user is ready ─────────────────────────────
    useEffect(() => {
        if (userId) loadConversations();
    }, [userId]);

    // ── Auto-save when response finishes ──────────────────────────────────
    useEffect(() => {
        if (
            status === 'ready' &&
            lastStatusRef.current === 'streaming' &&
            messages.length > 0 &&
            userId
        ) {
            saveConversation();
            setZeninhoMood('done');
            const t = setTimeout(() => setZeninhoMood('idle'), 3000);
            return () => clearTimeout(t);
        }
        if (status === 'streaming' || status === 'submitted') {
            setZeninhoMood('thinking');
        }
        lastStatusRef.current = status;
    }, [status]);

    // ── Cache tool invocations as they stream in ──────────────────────────
    // The AI SDK can drop tool-invocation parts from message.parts once the
    // multi-step stream finalises. We save every tool part we ever see so
    // they keep rendering in the chat after the SDK clears them.
    useEffect(() => {
        messages.forEach((msg) => {
            if (msg.role !== 'assistant') return;
            const toolParts = (msg.parts ?? []).filter((p: any) => {
                const t: string = p?.type ?? '';
                return t === 'tool-invocation' || t === 'tool-call' || t === 'tool-result' || t.includes('tool');
            });
            if (toolParts.length === 0) return;

            const existing: any[] = toolCacheRef.current[msg.id] ?? [];
            let changed = false;
            const merged = [...existing];

            toolParts.forEach((tp: any) => {
                const inv = tp.toolInvocation ?? tp;
                const idx = merged.findIndex((e: any) => (e.toolInvocation ?? e).toolCallId === inv.toolCallId);
                if (idx === -1) {
                    merged.push(tp);
                    changed = true;
                } else {
                    // Upgrade: if we now have a result that we didn't have before, keep it.
                    // Preserve toolName from the call part — some SDK versions omit it in the result part.
                    const existingInv = merged[idx].toolInvocation ?? merged[idx];
                    if (!existingInv.result && inv.result) {
                        if (!inv.toolName && existingInv.toolName) {
                            const upgraded = { ...tp };
                            if (upgraded.toolInvocation) {
                                upgraded.toolInvocation = { ...upgraded.toolInvocation, toolName: existingInv.toolName };
                            } else {
                                upgraded.toolName = existingInv.toolName;
                            }
                            merged[idx] = upgraded;
                        } else {
                            merged[idx] = tp;
                        }
                        changed = true;
                    }
                }
            });

            if (changed) toolCacheRef.current[msg.id] = merged;
        });
    }, [messages]);

    // ── Scroll to bottom ──────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Auto-resize textarea ──────────────────────────────────────────────
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    // ── Conversation CRUD ─────────────────────────────────────────────────

    const loadConversations = async () => {
        if (!userId) return;
        setLoadingConversations(true);
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
            .from('conversations')
            .select('id, title, model, updated_at')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(60);
        setConversations(data ?? []);
        setLoadingConversations(false);
    };

    const saveConversation = async () => {
        if (!userId || messages.length === 0 || savingRef.current) return;
        savingRef.current = true;
        try {
            const supabase = createBrowserSupabaseClient();
            // Merge cached tool parts back in before saving — the SDK drops them from
            // message.parts after multi-step streaming, but we need them persisted.
            const messagesWithTools = messages.map((msg) => {
                if (msg.role !== 'assistant') return msg;
                const cached: any[] = toolCacheRef.current[msg.id] ?? [];
                if (cached.length === 0) return msg;
                const parts: any[] = [...(msg.parts ?? [])];
                cached.forEach((cachedPart: any) => {
                    const cachedInv = cachedPart.toolInvocation ?? cachedPart;
                    const alreadyThere = parts.some((pp: any) => {
                        const t: string = pp?.type ?? '';
                        if (!(t === 'tool-invocation' || t.includes('tool'))) return false;
                        return (pp.toolInvocation ?? pp).toolCallId === cachedInv.toolCallId;
                    });
                    if (!alreadyThere) {
                        const firstText = parts.findIndex((pp: any) => pp?.type === 'text');
                        if (firstText === -1) parts.push(cachedPart);
                        else parts.splice(firstText, 0, cachedPart);
                    }
                });
                return { ...msg, parts };
            });
            const stored = sanitizeForStorage(messagesWithTools);
            const title = generateTitle(messages);

            if (currentConversationId) {
                await supabase
                    .from('conversations')
                    .update({ messages: stored, title, updated_at: new Date().toISOString() })
                    .eq('id', currentConversationId)
                    .eq('user_id', userId);
            } else {
                const { data } = await supabase
                    .from('conversations')
                    .insert({ user_id: userId, title, model: aiModel, messages: stored })
                    .select('id')
                    .single();
                if (data?.id) setCurrentConversationId(data.id);
            }
            await loadConversations();
        } finally {
            savingRef.current = false;
        }
    };

    const openConversation = async (conv: ConversationSummary) => {
        if (conv.id === currentConversationId) return;
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
            .from('conversations')
            .select('messages, model')
            .eq('id', conv.id)
            .single();
        if (data) {
            setCurrentConversationId(conv.id);
            setAiModel((data.model as 'gemini' | 'chatgpt') ?? 'gemini');
            toolCacheRef.current = {};
            setMessages(data.messages ?? []);
        }
        setShowSidebar(false);
    };

    const startNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
        toolCacheRef.current = {};
        setInput('');
        setChatFiles(undefined);
        setFilePreviews([]);
        setShowSidebar(false);
    };

    const deleteConversation = async (e: React.MouseEvent, convId: string) => {
        e.stopPropagation();
        if (!userId) return;
        setDeletingId(convId);
        const supabase = createBrowserSupabaseClient();
        await supabase.from('conversations').delete().eq('id', convId).eq('user_id', userId);
        if (currentConversationId === convId) startNewConversation();
        await loadConversations();
        setDeletingId(null);
    };

    const handleSignOut = async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        window.location.reload();
    };

    // ── Messaging ─────────────────────────────────────────────────────────

    const handleSend = () => {
        if ((!input.trim() && !chatFiles) || isLoading) return;
        sendMessage({
            text: input || (chatFiles ? 'Analise este arquivo.' : ''),
            files: chatFiles,
        });
        setInput('');
        setChatFiles(undefined);
        setFilePreviews([]);
        if (chatFileInputRef.current) chatFileInputRef.current.value = '';
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setChatFiles(files);
        const previews: { name: string; url: string; type: string }[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                previews.push({ name: file.name, url: URL.createObjectURL(file), type: 'image' });
            } else {
                previews.push({ name: file.name, url: '', type: 'file' });
            }
        });
        setFilePreviews(previews);
    };

    const removeChatFile = (index: number) => {
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
        if (filePreviews.length <= 1) {
            setChatFiles(undefined);
            if (chatFileInputRef.current) chatFileInputRef.current.value = '';
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadMessage('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);
            formData.append('authCode', localStorage.getItem('zeninho-auth') || userEmail);
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await response.json();
            setUploadMessage(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
        } catch {
            setUploadMessage('❌ Erro ao enviar arquivo.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // ── Voice ─────────────────────────────────────────────────────────────

    const toggleVoiceInput = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert('Seu navegador não suporta reconhecimento de voz.'); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
            setInput(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [isListening]);

    const readAloud = (text: string) => {
        if (!soundEnabled) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'pt-BR'; u.rate = 1.0; u.pitch = 1.0;
            window.speechSynthesis.speak(u);
        }
    };

    // ── Theme helpers ─────────────────────────────────────────────────────
    const dm = darkMode;
    const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
    const zeninhoImage =
        zeninhoMood === 'thinking' ? '/images/zezinho/zeninhopensando.png' :
        zeninhoMood === 'done'     ? '/images/zezinho/zeninhojasei.png' :
                                     '/images/zezinho/Zeninhonormal.png';

    // ── Merge cached tool parts into message.parts for rendering ─────────
    // Returns parts array guaranteed to include all tool invocations we've
    // ever seen for this message, even if the SDK later dropped them.
    const partsWithTools = (message: any): any[] => {
        const parts: any[] = [...(message.parts ?? [])];
        const cached: any[] = toolCacheRef.current[message.id] ?? [];

        cached.forEach((cachedPart) => {
            const cachedInv = cachedPart.toolInvocation ?? cachedPart;
            const alreadyThere = parts.some((p) => {
                const t: string = p?.type ?? '';
                if (!(t === 'tool-invocation' || t === 'tool-call' || t === 'tool-result' || t.includes('tool'))) return false;
                return (p.toolInvocation ?? p).toolCallId === cachedInv.toolCallId;
            });
            if (!alreadyThere) {
                // Insert before first text part so tools appear above the response text
                const firstText = parts.findIndex((p) => p?.type === 'text');
                if (firstText === -1) parts.push(cachedPart);
                else parts.splice(firstText, 0, cachedPart);
            }
        });

        return parts;
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <>
            <div className={`flex h-[calc(100vh-0px)] transition-colors duration-300 ${dm ? 'bg-stone-950' : 'bg-gray-100'}`}>

                {/* ── SIDEBAR ──────────────────────────────────────────── */}
                <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-72 h-full flex flex-col transition-all duration-300 ${dm ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'} border-r`}>

                    {/* Logo */}
                    <div className={`p-4 border-b ${dm ? 'border-stone-800' : 'border-gray-200'} flex items-center justify-center shrink-0`}>
                        <Image src="/images/imagenscomdescricao/logo-techsus.png" alt="TECHSUS" width={160} height={48} className="object-contain w-auto h-10" priority />
                    </div>

                    {/* User info */}
                    <div className={`px-4 py-3 border-b ${dm ? 'border-stone-800' : 'border-gray-200'} shrink-0`}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-orange-500/20">
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-medium truncate ${dm ? 'text-stone-200' : 'text-gray-800'}`}>{userEmail || 'Carregando...'}</p>
                                <p className={`text-[10px] ${dm ? 'text-stone-500' : 'text-gray-400'}`}>TECHSUS · Acesso restrito</p>
                            </div>
                        </div>
                    </div>

                    {/* New conversation */}
                    <div className={`px-4 pt-3 pb-2 shrink-0`}>
                        <button
                            onClick={startNewConversation}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${dm
                                ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400 hover:text-orange-300'
                                : 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600'
                            }`}
                        >
                            <MessageSquarePlus size={15} className="shrink-0" />
                            Nova Conversa
                        </button>
                    </div>

                    {/* Conversations list */}
                    <div className={`flex-1 overflow-y-auto px-2 pb-2 min-h-0`}>
                        {loadingConversations && (
                            <div className="flex justify-center py-4">
                                <Loader2 size={14} className="text-stone-500 animate-spin" />
                            </div>
                        )}

                        {!loadingConversations && conversations.length === 0 && (
                            <div className="px-3 py-6 text-center">
                                <p className={`text-xs ${dm ? 'text-stone-600' : 'text-gray-400'}`}>Nenhuma conversa ainda.</p>
                                <p className={`text-[10px] mt-1 ${dm ? 'text-stone-700' : 'text-gray-300'}`}>Comece digitando algo abaixo!</p>
                            </div>
                        )}

                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => openConversation(conv)}
                                className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 mb-0.5 ${conv.id === currentConversationId
                                    ? dm ? 'bg-stone-800 text-white' : 'bg-gray-100 text-gray-900'
                                    : dm ? 'text-stone-400 hover:bg-stone-800/60 hover:text-stone-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex-1 min-w-0 pr-5">
                                    <p className="text-xs font-medium truncate leading-relaxed">{conv.title}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${conv.id === currentConversationId
                                            ? dm ? 'bg-stone-700 text-stone-400' : 'bg-gray-200 text-gray-500'
                                            : dm ? 'bg-stone-800/80 text-stone-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {conv.model === 'gemini' ? 'Gemini' : 'GPT'}
                                        </span>
                                        <span className={`text-[10px] ${dm ? 'text-stone-600' : 'text-gray-400'}`}>
                                            {formatRelativeTime(conv.updated_at)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteConversation(e, conv.id)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${dm ? 'hover:bg-red-500/20 text-stone-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-400'}`}
                                >
                                    {deletingId === conv.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Bottom actions */}
                    <div className={`p-3 border-t ${dm ? 'border-stone-800' : 'border-gray-200'} space-y-1.5 shrink-0`}>
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${showUpload
                                ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                                : dm ? 'bg-stone-800/50 hover:bg-stone-800 text-stone-300 hover:text-white border border-transparent' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            <span className="text-xl shrink-0">🍰</span>
                            <div className="text-left">
                                <span className="block font-medium text-xs">Alimentar o Zeninho</span>
                                <span className={`block text-[10px] ${dm ? 'text-stone-500' : 'text-gray-400'}`}>Ensine algo novo pra ele!</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${showSettings
                                ? dm ? 'bg-stone-700/60 border border-stone-600/50 text-stone-200' : 'bg-gray-200 border border-gray-300 text-gray-800'
                                : dm ? 'bg-stone-800/50 hover:bg-stone-800 text-stone-300 hover:text-white border border-transparent' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            <Settings size={16} className="shrink-0" />
                            <div className="text-left">
                                <span className="block font-medium text-xs">Configurações</span>
                                <span className={`block text-[10px] ${dm ? 'text-stone-500' : 'text-gray-400'}`}>Modelo: {aiModel === 'gemini' ? 'Gemini' : 'ChatGPT'}</span>
                            </div>
                        </button>
                    </div>

                    {/* Reactive Zeninho Character */}
                    <div className="flex flex-col items-center justify-end p-4 pb-2 shrink-0">
                        <div className={`px-3 py-1.5 rounded-full mb-2 text-[11px] font-medium transition-all duration-500 ${zeninhoMood === 'thinking'
                            ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                            : zeninhoMood === 'done'
                                ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                                : 'text-stone-500 bg-stone-800/50 border border-stone-700/30'
                        }`}>
                            {zeninhoMood === 'thinking' ? '🧠 Pensando...' : zeninhoMood === 'done' ? '✅ Pronto!' : '💤 Aguardando...'}
                        </div>
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${zeninhoMood === 'thinking' ? 'bg-orange-500/20 scale-110 animate-pulse' : zeninhoMood === 'done' ? 'bg-green-500/15 scale-105' : 'bg-orange-500/5 scale-100'}`} />
                            <Image src={zeninhoImage} alt="Zeninho" width={200} height={200} className={`relative z-10 drop-shadow-2xl transition-all duration-500 ${zeninhoMood === 'thinking' ? 'animate-bounce-slow' : ''}`} style={{ width: 'auto', height: 'auto', maxWidth: '200px' }} priority />
                        </div>
                    </div>
                </div>

                {/* Upload modal */}
                {showUpload && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative z-10 w-full max-w-md bg-stone-900 border border-stone-700/60 rounded-2xl shadow-2xl shadow-black/60 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowUpload(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"><X size={18} /></button>
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-lg shadow-orange-500/20">
                                    <Image src={uploading ? '/images/zezinho/zeninhopensando.png' : '/images/zezinho/zeninhocomendo.png'} alt="Zeninho" width={48} height={48} className={`w-full h-full object-cover ${uploading ? 'animate-pulse' : ''}`} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Alimentar o Zeninho 📚</h3>
                                    <p className="text-sm text-stone-300 leading-relaxed">
                                        {uploading ? '🤔 Deixa eu ler aqui... Tô estudando!' : '🍰 Manda um documento aí! Eu leio e guardo na memória!'}
                                    </p>
                                </div>
                            </div>
                            <label className={`flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${uploading ? 'border-orange-500/50 bg-orange-500/5' : 'border-stone-600 hover:border-orange-500 hover:bg-orange-500/5'}`}>
                                {uploading ? (<><Loader2 size={28} className="text-orange-400 animate-spin" /><span className="text-sm text-orange-300 font-medium">Estudando o documento...</span></>) : (<><Upload size={28} className="text-stone-400" /><span className="text-sm text-stone-400">Clique para escolher o arquivo</span></>)}
                                <input type="file" accept=".pdf,.pptx,.docx,.xlsx,.txt,.md,.csv,.json" onChange={handleUpload} className="hidden" disabled={uploading} />
                            </label>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {['PDF', 'PPTX', 'DOCX', 'XLSX', 'TXT', 'MD', 'CSV', 'JSON'].map((fmt) => (
                                    <span key={fmt} className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-mono border border-stone-700/50">.{fmt.toLowerCase()}</span>
                                ))}
                            </div>
                            {uploadMessage && (
                                <div className={`text-sm p-3 rounded-xl flex items-start gap-2 ${uploadMessage.startsWith('✅') ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                                    <span>{uploadMessage}</span>
                                </div>
                            )}
                            <p className="text-xs text-stone-500 text-center">📖 Todos com acesso ao Zeninho podem consultar os documentos</p>
                        </div>
                    </div>
                )}

                {/* Sidebar overlay on mobile */}
                {showSidebar && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowSidebar(false)} />}

                {/* ── MAIN CHAT AREA ────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Chat header */}
                    <div className={`h-14 border-b ${dm ? 'border-stone-800 bg-stone-900/80' : 'border-gray-200 bg-white/90'} backdrop-blur-sm flex items-center px-4 gap-3 shrink-0`}>
                        <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden text-stone-400 hover:text-white">
                            <Menu size={20} />
                        </button>
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shrink-0 shadow-lg shadow-orange-500/20">
                            <Image src={isLoading ? '/images/zezinho/zeninhopensando.png' : '/images/zezinho/Zeninhonormal.png'} alt="Zeninho" width={36} height={36} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className={`font-semibold text-sm ${dm ? 'text-white' : 'text-gray-900'}`}>Zeninho</h1>
                            <p className={`text-xs ${dm ? 'text-stone-500' : 'text-gray-400'}`}>{isLoading ? '✍️ Pensando...' : '🟢 Online'}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-6 ${dm ? '' : 'bg-gray-50'}`}>

                        {/* Empty state */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-lg mx-auto">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/20 to-orange-600/20 p-1 shadow-2xl shadow-orange-500/20">
                                    <Image src="/images/zezinho/Zeninhonormal.png" alt="Zeninho" width={128} height={128} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold mb-2 ${dm ? 'text-white' : 'text-gray-900'}`}>Olá! Eu sou o Zeninho! 👋</h2>
                                    <p className={`leading-relaxed ${dm ? 'text-stone-400' : 'text-gray-500'}`}>
                                        Assistente inteligente da TECHSUS. Posso buscar documentos, pesquisar na web, gerar imagens e muito mais! 🍰
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                    {[
                                        'Como funciona o sistema de painéis?',
                                        'Quais são as patentes da TECHSUS?',
                                        'Me explique o processo de montagem',
                                        'Quais documentos estão disponíveis?',
                                    ].map((s) => (
                                        <button key={s} onClick={() => sendMessage({ text: s })} className="text-left px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-orange-500/30 text-stone-300 hover:text-white text-sm transition-all duration-200">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message list */}
                        {messages.map((message) => (
                            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.role !== 'user' && (
                                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-1 shadow-lg shadow-orange-500/10">
                                        <Image src="/images/zezinho/zeninhojasei.png" alt="Zeninho" width={36} height={36} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] lg:max-w-[65%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-orange-600 text-white rounded-br-md'
                                    : dm
                                        ? 'bg-stone-800/80 text-stone-100 rounded-bl-md border border-stone-700/50'
                                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                                } ${fontSizeClass}`}>

                                    {partsWithTools(message).map((part, index) => {
                                        // ── Text part ───────────────────────────────────────
                                        if (part.type === 'text') {
                                            const segments = part.text.split(/(!\[.*?\]\(.*?\))/g);
                                            const hasImages = segments.length > 1;

                                            if (hasImages) {
                                                return (
                                                    <div key={index} className="text-sm leading-relaxed">
                                                        {segments.map((seg: string, i: number) => {
                                                            const m = seg.match(/^!\[(.*?)\]\((.*?)\)$/);
                                                            if (m) {
                                                                const [, alt, url] = m;
                                                                return (
                                                                    <div key={i} className="mt-3 mb-2">
                                                                        <img src={url} alt={alt || 'Imagem'} className="rounded-xl max-w-full shadow-lg border border-stone-700/30" />
                                                                        <DownloadImageButton url={url} />
                                                                    </div>
                                                                );
                                                            }
                                                            if (!seg.trim()) return null;
                                                            return <span key={i} className="whitespace-pre-wrap">{seg}</span>;
                                                        })}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={index} className={`prose prose-sm max-w-none leading-relaxed ${dm ? 'prose-invert prose-p:text-stone-100 prose-strong:text-white prose-headings:text-white prose-li:text-stone-200 prose-a:text-orange-400 hover:prose-a:text-orange-300 prose-code:text-orange-300 prose-code:bg-stone-700/50 prose-pre:bg-stone-900 prose-blockquote:border-orange-500/50 prose-blockquote:text-stone-300' : 'prose-p:text-gray-800 prose-strong:text-gray-900 prose-headings:text-gray-900 prose-li:text-gray-700 prose-a:text-orange-600 prose-code:text-orange-600 prose-code:bg-gray-100 prose-pre:bg-gray-50'}`}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                        img: ({ src, alt }) => {
                                                            if (!src) return null;
                                                            return (
                                                                <div className="mt-3 mb-2">
                                                                    <img src={src} alt={alt || 'Imagem'} className="rounded-xl max-w-full shadow-lg border border-stone-700/30" />
                                                                    <DownloadImageButton url={src} />
                                                                </div>
                                                            );
                                                        },
                                                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{children}</a>,
                                                        code: ({ children, className }) => {
                                                            const isBlock = className?.includes('language-');
                                                            if (isBlock) return <code className={`${className} block rounded-lg p-3 text-xs overflow-x-auto`}>{children}</code>;
                                                            return <code className="px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
                                                        },
                                                    }}>
                                                        {part.text}
                                                    </ReactMarkdown>
                                                </div>
                                            );
                                        }

                                        // ── File part ───────────────────────────────────────
                                        if (part.type === 'file') {
                                            if (part.mediaType?.startsWith('image/')) {
                                                return <img key={index} src={part.url} alt={('filename' in part ? (part as any).filename : 'Imagem') || 'Imagem'} className="rounded-lg mt-2 max-w-full border border-stone-700/30" />;
                                            }
                                            return (
                                                <div key={index} className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700/30 border border-stone-600/30">
                                                    <Paperclip size={14} className="text-stone-400 shrink-0" />
                                                    <span className="text-xs text-stone-300 truncate">{'filename' in part ? (part as any).filename : 'Arquivo'}</span>
                                                </div>
                                            );
                                        }

                                        // ── Tool invocation part ────────────────────────────
                                        if (
                                            part.type === 'tool-invocation' ||
                                            part.type === 'tool-call' ||
                                            part.type === 'tool-result' ||
                                            (typeof part.type === 'string' && part.type.includes('tool'))
                                        ) {
                                            const p = part as any;
                                            const inv = p.toolInvocation ?? p;
                                            // toolName may live on p directly (flat SDK parts) or inside toolInvocation
                                            const toolName: string = p.toolName || p.toolInvocation?.toolName || inv.toolName || '';
                                            const toolState: string = p.state || p.toolInvocation?.state || inv.state || '';
                                            const toolArgs = p.args || p.toolInvocation?.args || inv.args || {};
                                            const toolResult = p.result ?? p.toolInvocation?.result ?? inv.result ?? null;

                                            // Show generated image inline from tool result
                                            if (toolName === 'generateImage' && toolState === 'result' && toolResult?.imageUrl) {
                                                return (
                                                    <div key={index} className="mt-3">
                                                        <img src={toolResult.imageUrl} alt="Imagem gerada pelo Zeninho" className="rounded-xl max-w-full shadow-lg border border-stone-700/30" />
                                                        <DownloadImageButton url={toolResult.imageUrl} />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <ToolCallCard
                                                    key={index}
                                                    toolName={toolName}
                                                    args={toolArgs}
                                                    state={toolState}
                                                    result={toolResult}
                                                    isStreaming={isLoading}
                                                />
                                            );
                                        }

                                        return null;
                                    })}

                                    {/* Web search sources */}
                                    {message.parts.filter((p): p is Extract<typeof p, { type: 'source-url' }> => p.type === 'source-url').length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-stone-700/50">
                                            <p className="text-xs text-stone-400 mb-1">📎 Fontes:</p>
                                            {message.parts
                                                .filter((p): p is Extract<typeof p, { type: 'source-url' }> => p.type === 'source-url')
                                                .map((source) => (
                                                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:text-orange-300 block truncate">
                                                        {source.title || new URL(source.url).hostname}
                                                    </a>
                                                ))}
                                        </div>
                                    )}

                                    {/* Read aloud button */}
                                    {message.role !== 'user' && (
                                        <div className="mt-2 pt-2 border-t border-stone-700/30 flex justify-end">
                                            <button onClick={() => readAloud(message.parts.filter(p => p.type === 'text').map((p: any) => p.text).join(' '))} className="text-stone-400 hover:text-orange-300 flex items-center gap-1.5 text-xs transition-colors" title="Ouvir resposta">
                                                <Volume2 size={14} /> Ouvir
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* User avatar */}
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 shadow-lg shadow-orange-500/20">
                                        {userInitial}
                                    </div>
                                )}
                            </div>
                        ))}


                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── INPUT AREA ──────────────────────────────────────── */}
                    <div className={`border-t ${dm ? 'border-stone-800 bg-stone-900/80' : 'border-gray-200 bg-white/90'} backdrop-blur-sm p-4`}>
                        <div className="max-w-4xl mx-auto">

                            {/* Quick action chips */}
                            {showActions && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                        { label: 'Criar Imagem', icon: <ImagePlus size={14} />, prompt: 'Crie uma imagem de ' },
                                        { label: 'Criar PowerPoint', icon: <Presentation size={14} />, prompt: 'Crie uma apresentação de PowerPoint com slides sobre ' },
                                        { label: 'Criar Gráfico', icon: <BarChart3 size={14} />, prompt: 'Crie um gráfico mostrando ' },
                                    ].map((action) => (
                                        <button key={action.label} onClick={() => { setInput(action.prompt); setShowActions(false); textareaRef.current?.focus(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700/50 hover:border-orange-500/40 text-stone-300 hover:text-white text-xs font-medium transition-all duration-200">
                                            {action.icon}{action.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <input type="file" ref={chatFileInputRef} onChange={handleChatFileChange} accept="image/*,.pdf,.doc,.docx,.pptx,.xlsx,.txt" multiple className="hidden" />

                            {/* File previews */}
                            {filePreviews.length > 0 && (
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    {filePreviews.map((preview, i) => (
                                        <div key={i} className="relative group">
                                            {preview.type === 'image' ? (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-700 bg-stone-800">
                                                    <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-16 px-3 rounded-lg border border-stone-700 bg-stone-800 flex items-center gap-2">
                                                    <Paperclip size={14} className="text-stone-400 shrink-0" />
                                                    <span className="text-xs text-stone-300 max-w-[100px] truncate">{preview.name}</span>
                                                </div>
                                            )}
                                            <button onClick={() => removeChatFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-2">
                                <button type="button" onClick={() => setShowActions(!showActions)} className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${showActions ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : dm ? 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-orange-500/30' : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-300'}`} title="Criar conteúdo visual">
                                    <ImagePlus size={18} />
                                </button>
                                <button type="button" onClick={() => chatFileInputRef.current?.click()} className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${chatFiles ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : dm ? 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-blue-500/30' : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-300'}`} title="Anexar arquivo">
                                    <Paperclip size={18} />
                                </button>
                                <div className="flex-1 relative">
                                    <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} disabled={isLoading} placeholder={chatFiles ? 'Descreva o que quer saber...' : 'Escreva sua mensagem aqui...'} rows={1} className={`w-full resize-none overflow-hidden rounded-xl border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 px-4 py-3 text-base outline-none transition-colors shadow-inner ${dm ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`} />
                                </div>
                                <button type="button" onClick={toggleVoiceInput} className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : dm ? 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-orange-500/30' : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-300'}`} title={isListening ? 'Parar' : 'Falar'}>
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                                <button type="submit" disabled={(!input.trim() && !chatFiles) || isLoading} className={`shrink-0 w-11 h-11 rounded-xl text-white flex items-center justify-center transition-colors shadow-lg shadow-orange-500/20 disabled:shadow-none bg-orange-600 hover:bg-orange-500 ${dm ? 'disabled:bg-stone-700 disabled:text-stone-500' : 'disabled:bg-gray-200 disabled:text-gray-400'}`}>
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </form>
                            <p className={`text-center text-xs mt-2 ${dm ? 'text-stone-600' : 'text-gray-400'}`}>Zeninho pode cometer erros. Verifique informações importantes.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SETTINGS MODAL ──────────────────────────────────────── */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6" onClick={() => setShowSettings(false)}>
                    <div className="relative flex w-full max-w-3xl h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a1a]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all">
                            <X size={15} />
                        </button>

                        {/* Left nav */}
                        <nav className="w-52 shrink-0 border-r border-white/8 pt-14 pb-4 px-2 flex flex-col gap-0.5 bg-[#111111]">
                            {([
                                { id: 'geral' as const, label: 'Geral', icon: <Settings size={16} /> },
                                { id: 'aparencia' as const, label: 'Aparência', icon: <Moon size={16} /> },
                                { id: 'ia' as const, label: 'Modelos IA', icon: <Sparkles size={16} /> },
                                { id: 'som' as const, label: 'Som', icon: <Volume2 size={16} /> },
                            ]).map(item => (
                                <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${settingsTab === item.id ? 'bg-white/10 text-white font-medium' : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}>
                                    <span className={settingsTab === item.id ? 'text-white' : 'text-white/35'}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Right panel */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-8 pt-7 pb-5 border-b border-white/8 shrink-0">
                                <h2 className="text-lg font-semibold text-white">
                                    {settingsTab === 'geral' && 'Geral'}
                                    {settingsTab === 'aparencia' && 'Aparência'}
                                    {settingsTab === 'ia' && 'Modelos de IA'}
                                    {settingsTab === 'som' && 'Som'}
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-2">

                                {settingsTab === 'geral' && (
                                    <>
                                        <SRow label="Usuário" value={userEmail || '—'} />
                                        <SRow label="Idioma" value="Português (Brasil)" />
                                        <SRow label="Versão" value="Zeninho v2.1" />
                                        <SRow label="TECHSUS" value="© 2025" />
                                        <div className="pt-5">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/[0.18] border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <LogOut size={15} />
                                                    <span>Sair do Zeninho</span>
                                                </div>
                                                <span className="text-xs opacity-60">Encerrar sessão</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {settingsTab === 'aparencia' && (
                                    <>
                                        <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-3">
                                                {darkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-orange-400" />}
                                                <div>
                                                    <div className="text-sm font-medium text-white">{darkMode ? 'Modo Escuro' : 'Modo Claro'}</div>
                                                    <div className="text-[11px] text-white/40">Tema da interface</div>
                                                </div>
                                            </div>
                                            <AppleToggle on={darkMode} onChange={setDarkMode} color="blue" />
                                        </div>
                                        <div className="py-4 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Type size={18} className="text-purple-400" />
                                                <div>
                                                    <div className="text-sm font-medium text-white">Tamanho do Texto</div>
                                                    <div className="text-[11px] text-white/40">Tamanho da fonte no chat</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['small', 'medium', 'large'] as const).map(s => (
                                                    <button key={s} onClick={() => setFontSize(s)} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${fontSize === s ? 'bg-purple-500/25 text-purple-300 ring-1 ring-purple-500/40' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                                                        {s === 'small' ? 'Aa Pequeno' : s === 'medium' ? 'Aa Médio' : 'Aa Grande'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {settingsTab === 'ia' && (
                                    <>
                                        <p className="text-xs text-white/30 uppercase tracking-widest pb-2">Modelo Ativo</p>
                                        <p className="text-[11px] text-white/25 pb-3 leading-relaxed">O modelo selecionado será usado em novas mensagens desta conversa.</p>
                                        {[
                                            { id: 'gemini' as const, label: 'Gemini Flash', sub: 'Google DeepMind · Busca integrada', grad: 'from-orange-400 to-orange-600', ring: 'bg-orange-500', icon: <Sparkles size={16} className="text-white" /> },
                                            { id: 'chatgpt' as const, label: 'GPT-4o Mini Search', sub: 'OpenAI · Pesquisa na web', grad: 'from-emerald-400 to-emerald-600', ring: 'bg-emerald-500', icon: <Cpu size={16} className="text-white" /> },
                                        ].map(m => (
                                            <button key={m.id} onClick={() => setAiModel(m.id)} className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${aiModel === m.id ? 'bg-white/[0.08] border-white/15' : 'border-transparent hover:bg-white/5'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center shadow-lg`}>{m.icon}</div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-medium text-white">{m.label}</div>
                                                        <div className="text-[11px] text-white/40">{m.sub}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${aiModel === m.id ? m.ring : 'bg-white/10'}`}>
                                                    {aiModel === m.id && <Check size={11} className="text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {settingsTab === 'som' && (
                                    <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <Volume2 size={18} className={soundEnabled ? 'text-green-400' : 'text-white/30'} />
                                            <div>
                                                <div className="text-sm font-medium text-white">Leitura em Voz Alta</div>
                                                <div className="text-[11px] text-white/40">Ouvir respostas do Zeninho</div>
                                            </div>
                                        </div>
                                        <AppleToggle on={soundEnabled} onChange={setSoundEnabled} color="green" />
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Helper: Download image button ─────────────────────────────────────────────

function DownloadImageButton({ url }: { url: string }) {
    return (
        <button
            onClick={async () => {
                try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = `zeninho-image-${Date.now()}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                } catch { alert('Erro ao baixar imagem.'); }
            }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-orange-500/10 hover:from-orange-600/40 hover:to-orange-500/20 border border-orange-500/30 hover:border-orange-400/50 text-orange-300 hover:text-orange-200 text-xs font-medium transition-all duration-300 shadow-sm"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Baixar imagem
        </button>
    );
}

// ── Helper: Rich tool call card ───────────────────────────────────────────────

function ToolCallCard({ toolName, args, state, result, isStreaming }: {
    toolName: string;
    args: any;
    state: string;
    result: any;
    isStreaming: boolean;
}) {
    // A tool call is done when:
    //   1. The SDK explicitly marked it as 'result', OR
    //   2. A result object exists (SDK sometimes skips the state update), OR
    //   3. The entire stream has finished — meaning no tool call can still be pending.
    // Note: use != (loose) so both null and undefined are treated as "no result".
    const isDone = state === 'result' || result != null || !isStreaming;

    type ToolConfig = {
        icon: React.ReactNode;
        color: string;
        label: string;
        loadingText: string;
        doneText: (r: any) => string;
        detail: (a: any) => string | null;
    };

    const configs: Record<string, ToolConfig> = {
        searchDocuments: {
            icon: <Search size={13} />,
            color: 'blue',
            label: 'Base de Conhecimento',
            loadingText: 'Buscando documentos relevantes...',
            doneText: (r) => {
                const n = r?.results?.length ?? 0;
                return `${n} trecho${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
            },
            detail: (a) => a?.query ? `"${String(a.query).slice(0, 70)}"` : null,
        },
        webSearch: {
            icon: <Globe size={13} />,
            color: 'violet',
            label: 'Pesquisa na Web',
            loadingText: 'Pesquisando na internet...',
            doneText: () => 'Pesquisa concluída',
            detail: (a) => a?.query ? `"${String(a.query).slice(0, 70)}"` : null,
        },
        generateImage: {
            icon: <ImagePlus size={13} />,
            color: 'amber',
            label: 'Geração de Imagem',
            loadingText: 'Gerando imagem com IA...',
            doneText: (r) => r?.success ? 'Imagem gerada com sucesso' : 'Falha ao gerar imagem',
            detail: (a) => a?.prompt ? `"${String(a.prompt).slice(0, 70)}…"` : null,
        },
        listDocuments: {
            icon: <FolderOpen size={13} />,
            color: 'emerald',
            label: 'Biblioteca de Documentos',
            loadingText: 'Listando documentos...',
            doneText: (r) => {
                const n = r?.documents?.length ?? 0;
                return `${n} documento${n !== 1 ? 's' : ''} na base`;
            },
            detail: () => null,
        },
        calculateArea: {
            icon: <Ruler size={13} />,
            color: 'cyan',
            label: 'Cálculo de Área',
            loadingText: 'Calculando área...',
            doneText: (r) => r?.area != null ? `${Number(r.area).toFixed(2)} m²` : 'Área calculada',
            detail: (a) => (a?.width != null && a?.length != null) ? `${a.width}m × ${a.length}m` : null,
        },
        getDateTime: {
            icon: <Clock size={13} />,
            color: 'slate',
            label: 'Data & Hora',
            loadingText: 'Consultando data e hora...',
            doneText: (r) => r?.datetime ?? 'Horário obtido',
            detail: () => null,
        },
    };

    const cfg: ToolConfig = configs[toolName] ?? {
        icon: <Zap size={13} />,
        color: 'stone',
        label: toolName,
        loadingText: 'Processando...',
        doneText: () => 'Concluído',
        detail: () => null,
    };

    const colorMap: Record<string, { wrap: string; iconBg: string; iconText: string; label: string; text: string; detail: string }> = {
        blue:    { wrap: isDone ? 'bg-blue-500/8 border-blue-500/25'    : 'bg-blue-500/5 border-blue-500/15',    iconBg: 'bg-blue-500/20',    iconText: 'text-blue-400',    label: 'text-blue-500/60',   text: isDone ? 'text-blue-200' : 'text-blue-400',    detail: 'text-blue-400/55' },
        violet:  { wrap: isDone ? 'bg-violet-500/8 border-violet-500/25' : 'bg-violet-500/5 border-violet-500/15', iconBg: 'bg-violet-500/20',  iconText: 'text-violet-400',  label: 'text-violet-500/60', text: isDone ? 'text-violet-200' : 'text-violet-400',  detail: 'text-violet-400/55' },
        amber:   { wrap: isDone ? 'bg-amber-500/8 border-amber-500/25'   : 'bg-amber-500/5 border-amber-500/15',   iconBg: 'bg-amber-500/20',   iconText: 'text-amber-400',   label: 'text-amber-500/60',  text: isDone ? 'text-amber-200' : 'text-amber-400',   detail: 'text-amber-400/55' },
        emerald: { wrap: isDone ? 'bg-emerald-500/8 border-emerald-500/25': 'bg-emerald-500/5 border-emerald-500/15', iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400', label: 'text-emerald-500/60', text: isDone ? 'text-emerald-200' : 'text-emerald-400', detail: 'text-emerald-400/55' },
        cyan:    { wrap: isDone ? 'bg-cyan-500/8 border-cyan-500/25'     : 'bg-cyan-500/5 border-cyan-500/15',     iconBg: 'bg-cyan-500/20',    iconText: 'text-cyan-400',    label: 'text-cyan-500/60',   text: isDone ? 'text-cyan-200' : 'text-cyan-400',    detail: 'text-cyan-400/55' },
        slate:   { wrap: isDone ? 'bg-slate-500/8 border-slate-500/25'   : 'bg-slate-500/5 border-slate-500/15',   iconBg: 'bg-slate-500/20',   iconText: 'text-slate-400',   label: 'text-slate-500/60',  text: isDone ? 'text-slate-200' : 'text-slate-400',   detail: 'text-slate-400/55' },
        stone:   { wrap: isDone ? 'bg-stone-500/8 border-stone-500/25'   : 'bg-stone-500/5 border-stone-500/15',   iconBg: 'bg-stone-500/20',   iconText: 'text-stone-400',   label: 'text-stone-500/60',  text: isDone ? 'text-stone-200' : 'text-stone-400',   detail: 'text-stone-400/55' },
    };

    const c = colorMap[cfg.color] ?? colorMap.stone;
    const detail = cfg.detail(args);

    return (
        <div className={`my-1.5 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300 ${c.wrap}`}>
            {/* Icon */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconText}`}>
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${c.label}`}>
                    {cfg.label}
                </div>
                <div className={`text-xs font-medium ${c.text}`}>
                    {isDone ? cfg.doneText(result) : cfg.loadingText}
                </div>
                {detail && (
                    <div className={`text-[10px] mt-0.5 truncate ${c.detail}`}>{detail}</div>
                )}
            </div>

            {/* Status indicator */}
            <div className="shrink-0 ml-1">
                {isDone ? (
                    <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 ${c.iconText}`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : (
                    <div className={`w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin ${c.iconText} opacity-80`} />
                )}
            </div>
        </div>
    );
}

// ── Settings helpers ──────────────────────────────────────────────────────────

function AppleToggle({ on, onChange, color }: { on: boolean; onChange: (v: boolean) => void; color: 'blue' | 'green' }) {
    const bg = on ? (color === 'blue' ? 'bg-blue-500' : 'bg-green-500') : 'bg-white/15';
    return (
        <button onClick={() => onChange(!on)} className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${bg}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
}

function SRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-3.5 border-b border-white/6">
            <span className="text-sm text-white">{label}</span>
            <span className="text-sm text-white/40 truncate max-w-[180px] text-right">{value}</span>
        </div>
    );
}
