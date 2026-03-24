'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, Loader2, Menu, Sparkles, ImagePlus, BarChart3, Presentation, Paperclip, Mic, MicOff, X } from 'lucide-react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function ZeninhoChat() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const [input, setInput] = useState('');
    const [showUpload, setShowUpload] = useState(false);
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

    const isLoading = status === 'streaming' || status === 'submitted';

    // Reactive Zeninho mood
    useEffect(() => {
        if (status === 'streaming' || status === 'submitted') {
            setZeninhoMood('thinking');
        } else if (lastStatusRef.current === 'streaming' && status === 'ready') {
            setZeninhoMood('done');
            const timer = setTimeout(() => setZeninhoMood('idle'), 3000);
            return () => clearTimeout(timer);
        }
        lastStatusRef.current = status;
    }, [status]);

    const zeninhoImage = zeninhoMood === 'thinking'
        ? '/images/zezinho/zeninhopensando.png'
        : zeninhoMood === 'done'
            ? '/images/zezinho/zeninhojasei.png'
            : '/images/zezinho/Zeninhonormal.png';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

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
                const url = URL.createObjectURL(file);
                previews.push({ name: file.name, url, type: 'image' });
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

    // Voice input via Web Speech API
    const toggleVoiceInput = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Seu navegador não suporta reconhecimento de voz.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            setInput(transcript);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [isListening]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);
            formData.append('authCode', localStorage.getItem('zeninho-auth') || '');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setUploadMessage(`✅ ${data.message}`);
            } else {
                setUploadMessage(`❌ ${data.error}`);
            }
        } catch {
            setUploadMessage('❌ Erro ao enviar arquivo.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="flex h-[calc(100vh-0px)] bg-stone-950">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-72 h-full bg-stone-900 border-r border-stone-800 transition-transform duration-300 flex flex-col`}>
                <div className="p-4 border-b border-stone-800">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shrink-0 shadow-lg shadow-orange-500/20">
                            <Image
                                src="/images/zezinho/Zeninhonormal.png"
                                alt="Zeninho"
                                width={44}
                                height={44}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Zeninho</h2>
                            <p className="text-stone-400 text-xs">Assistente TECHSUS</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {/* Knowledge Feed Button */}
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm ${showUpload
                            ? 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
                            : 'bg-stone-800/50 hover:bg-stone-800 text-stone-300 hover:text-white border border-transparent'
                            }`}
                    >
                        <span className="text-lg">📚</span>
                        <div className="text-left">
                            <span className="block font-medium">Alimentar o Zeninho</span>
                            <span className="block text-[10px] text-stone-500">Ensine algo novo pra ele!</span>
                        </div>
                    </button>

                    {showUpload && (
                        <div className="bg-gradient-to-b from-stone-800/80 to-stone-800/40 rounded-xl p-4 space-y-3 border border-stone-700/50 animate-in">
                            {/* Fun explanation */}
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                                    <Image
                                        src={uploading ? '/images/zezinho/zeninhopensando.png' : '/images/zezinho/zeninhojasei.png'}
                                        alt="Zeninho"
                                        width={32}
                                        height={32}
                                        className={`w-full h-full object-cover ${uploading ? 'animate-pulse' : ''}`}
                                    />
                                </div>
                                <p className="text-xs text-stone-300 leading-relaxed">
                                    {uploading
                                        ? '🤔 Deixa eu ler aqui... Tô estudando esse documento!'
                                        : '🍰 Manda um documento aí! Eu leio tudinho e guardo na memória pra ajudar toda a equipe!'}
                                </p>
                            </div>

                            {/* Upload area */}
                            <label className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${uploading
                                ? 'border-orange-500/50 bg-orange-500/5'
                                : 'border-stone-600 hover:border-orange-500 hover:bg-orange-500/5'
                                }`}>
                                {uploading ? (
                                    <>
                                        <Loader2 size={20} className="text-orange-400 animate-spin" />
                                        <span className="text-xs text-orange-300 font-medium">Estudando o documento...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-stone-400" />
                                        <span className="text-xs text-stone-400">Clique para escolher o arquivo</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.pptx,.docx,.xlsx,.txt,.md,.csv,.json"
                                    onChange={handleUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>

                            {/* Supported formats */}
                            <div className="flex flex-wrap gap-1">
                                {['PDF', 'PPTX', 'DOCX', 'XLSX', 'TXT', 'MD', 'CSV', 'JSON'].map((fmt) => (
                                    <span key={fmt} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-700/50 text-stone-500 font-mono">
                                        .{fmt.toLowerCase()}
                                    </span>
                                ))}
                            </div>

                            {/* Upload message */}
                            {uploadMessage && (
                                <div className={`text-xs p-2.5 rounded-lg flex items-start gap-2 ${uploadMessage.startsWith('✅')
                                    ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                                    : 'bg-red-500/10 text-red-300 border border-red-500/20'
                                    }`}>
                                    <span>{uploadMessage}</span>
                                </div>
                            )}

                            {/* Info note */}
                            <p className="text-[10px] text-stone-600 text-center leading-relaxed">
                                📖 Todos com acesso ao Zeninho podem consultar os documentos enviados
                            </p>
                        </div>
                    )}
                </div>

                {/* Reactive Zeninho Character */}
                <div className="flex flex-col items-center justify-end p-4 pb-2 flex-shrink-0">
                    {/* Status text — above the character */}
                    <div className={`px-3 py-1.5 rounded-full mb-2 text-[11px] font-medium transition-all duration-500 ${zeninhoMood === 'thinking'
                        ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                        : zeninhoMood === 'done'
                            ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                            : 'text-stone-500 bg-stone-800/50 border border-stone-700/30'
                        }`}>
                        {zeninhoMood === 'thinking'
                            ? '🧠 Pensando...'
                            : zeninhoMood === 'done'
                                ? '✅ Pronto!'
                                : '💤 Aguardando...'}
                    </div>
                    <div className="relative">
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${zeninhoMood === 'thinking'
                            ? 'bg-orange-500/20 scale-110 animate-pulse'
                            : zeninhoMood === 'done'
                                ? 'bg-green-500/15 scale-105'
                                : 'bg-orange-500/5 scale-100'
                            }`} />
                        {/* Character image */}
                        <Image
                            src={zeninhoImage}
                            alt="Zeninho"
                            width={240}
                            height={240}
                            className={`relative z-10 drop-shadow-2xl transition-all duration-500 ${zeninhoMood === 'thinking' ? 'animate-bounce-slow' : ''
                                }`}
                            style={{ width: 'auto', height: 'auto', maxWidth: '240px' }}
                            priority
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-stone-800">
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                        <Sparkles size={12} />
                        <span>Gemini 3 Flash · TECHSUS AI</span>
                    </div>
                </div>
            </div>

            {/* Sidebar overlay on mobile */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowSidebar(false)} />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="h-14 border-b border-stone-800 bg-stone-900/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
                    <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden text-stone-400 hover:text-white">
                        <Menu size={20} />
                    </button>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shrink-0 shadow-lg shadow-orange-500/20">
                        <Image
                            src={isLoading ? '/images/zezinho/zeninhopensando.png' : '/images/zezinho/Zeninhonormal.png'}
                            alt="Zeninho"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-sm">Zeninho</h1>
                        <p className="text-stone-500 text-xs">
                            {isLoading ? '✍️ Pensando...' : '🟢 Online'}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-lg mx-auto">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/20 to-orange-600/20 p-1 shadow-2xl shadow-orange-500/20">
                                <Image
                                    src="/images/zezinho/Zeninhonormal.png"
                                    alt="Zeninho"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Olá! Eu sou o Zeninho! 👋</h2>
                                <p className="text-stone-400 leading-relaxed">
                                    Sou o assistente inteligente da TECHSUS. Posso ajudar com questões técnicas sobre construção industrializada,
                                    buscar informações nos documentos da empresa, e muito mais! 🍰
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                {[
                                    'Como funciona o sistema de painéis?',
                                    'Quais são as patentes da TECHSUS?',
                                    'Me explique o processo de montagem',
                                    'Quais documentos estão disponíveis?',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            sendMessage({ text: suggestion });
                                        }}
                                        className="text-left px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-orange-500/30 text-stone-300 hover:text-white text-sm transition-all duration-200"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role !== 'user' && (
                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-1 shadow-lg shadow-orange-500/10">
                                    <Image
                                        src="/images/zezinho/zeninhojasei.png"
                                        alt="Zeninho"
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] lg:max-w-[65%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-orange-600 text-white rounded-br-md'
                                    : 'bg-stone-800/80 text-stone-100 rounded-bl-md border border-stone-700/50'
                                    }`}
                            >
                                {message.parts.map((part, index) => {
                                    if (part.type === 'text') {
                                        // Parse markdown images: ![alt](url)
                                        const segments = part.text.split(/(!\[.*?\]\(.*?\))/g);
                                        const hasMarkdownImages = segments.length > 1;

                                        if (hasMarkdownImages) {
                                            return (
                                                <div key={index} className="text-sm leading-relaxed">
                                                    {segments.map((seg, i) => {
                                                        const imgMatch = seg.match(/^!\[(.*?)\]\((.*?)\)$/);
                                                        if (imgMatch) {
                                                            const [, alt, url] = imgMatch;
                                                            return (
                                                                <div key={i} className="mt-3 mb-2">
                                                                    <img
                                                                        src={url}
                                                                        alt={alt || 'Imagem gerada pelo Zeninho'}
                                                                        className="rounded-xl max-w-full shadow-lg border border-stone-700/30"
                                                                    />
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
                                                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-orange-500/10 hover:from-orange-600/40 hover:to-orange-500/20 border border-orange-500/30 hover:border-orange-400/50 text-orange-300 hover:text-orange-200 text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-orange-500/10"
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                                        Baixar imagem
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                        if (!seg.trim()) return null;
                                                        return (
                                                            <span key={i} className="whitespace-pre-wrap">
                                                                {seg}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className="whitespace-pre-wrap text-sm leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                                            >
                                                {part.text}
                                            </div>
                                        );
                                    } else if (part.type === 'file') {
                                        if (part.mediaType?.startsWith('image/')) {
                                            return (
                                                <img
                                                    key={index}
                                                    src={part.url}
                                                    alt={('filename' in part ? (part as any).filename : 'Imagem') || 'Imagem'}
                                                    className="rounded-lg mt-2 max-w-full border border-stone-700/30"
                                                />
                                            );
                                        }
                                        // Non-image files (shown as file cards)
                                        return (
                                            <div key={index} className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700/30 border border-stone-600/30">
                                                <Paperclip size={14} className="text-stone-400 shrink-0" />
                                                <span className="text-xs text-stone-300 truncate">{'filename' in part ? (part as any).filename : 'Arquivo'}</span>
                                            </div>
                                        );
                                    } else if (part.type === 'tool-invocation' || part.type === 'tool-call' || part.type === 'tool-result' || (typeof part.type === 'string' && part.type.includes('tool'))) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const p = part as any;
                                        const inv = p.toolInvocation || p;
                                        const toolName = inv.toolName || '';
                                        const toolState = inv.state || '';
                                        const toolResult = inv.result || null;

                                        console.log('[UI] Tool part:', { toolName, toolState, hasResult: !!toolResult, resultKeys: toolResult ? Object.keys(toolResult) : [] });

                                        // Show generated image from tool result
                                        if (toolName === 'generateImage' && toolState === 'result' && toolResult?.imageUrl) {
                                            return (
                                                <div key={index} className="mt-3">
                                                    <img
                                                        src={toolResult.imageUrl}
                                                        alt="Imagem gerada pelo Zeninho"
                                                        className="rounded-xl max-w-full shadow-lg border border-stone-700/30"
                                                    />
                                                    <a
                                                        href={toolResult.imageUrl}
                                                        download="zeninho-image.png"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                                    >
                                                        ⬇️ Baixar imagem
                                                    </a>
                                                </div>
                                            );
                                        }

                                        // Show tool status indicator
                                        const isImageTool = toolName === 'generateImage';
                                        const isDone = toolState === 'result';
                                        return (
                                            <div key={index} className="text-xs text-stone-400 italic mt-1 flex items-center gap-1.5">
                                                <Image
                                                    src="/images/zezinho/zeninhopensando.png"
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                    className={`rounded-full ${!isDone ? 'animate-pulse' : ''}`}
                                                />
                                                {isImageTool
                                                    ? isDone ? '🎨 Imagem gerada!' : '🎨 Gerando imagem...'
                                                    : isDone ? '🔍 Busca concluída' : '🔍 Buscando nos documentos...'}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Sources */}
                                {message.parts
                                    .filter((p): p is Extract<typeof p, { type: 'source-url' }> => p.type === 'source-url')
                                    .length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-stone-700/50">
                                            <p className="text-xs text-stone-400 mb-1">📎 Fontes:</p>
                                            {message.parts
                                                .filter((p): p is Extract<typeof p, { type: 'source-url' }> => p.type === 'source-url')
                                                .map((source) => (
                                                    <a
                                                        key={source.url}
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-orange-400 hover:text-orange-300 block truncate"
                                                    >
                                                        {source.title || new URL(source.url).hostname}
                                                    </a>
                                                ))}
                                        </div>
                                    )}
                            </div>
                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-stone-300 text-xs font-bold shrink-0 mt-1">
                                    👤
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-lg shadow-orange-500/10">
                                <Image
                                    src="/images/zezinho/zeninhopensando.png"
                                    alt="Zeninho pensando"
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover animate-pulse"
                                />
                            </div>
                            <div className="bg-stone-800/80 rounded-2xl rounded-bl-md px-4 py-3 border border-stone-700/50">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-stone-500 ml-1">Pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-stone-800 bg-stone-900/80 backdrop-blur-sm p-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Creation Action Chips */}
                        {showActions && (
                            <div className="flex flex-wrap gap-2 mb-3 animate-in">
                                {[
                                    { label: 'Criar Imagem', icon: <ImagePlus size={14} />, prompt: 'Crie uma imagem de ' },
                                    { label: 'Criar PowerPoint', icon: <Presentation size={14} />, prompt: 'Crie uma apresentação de PowerPoint com slides sobre ' },
                                    { label: 'Criar Gráfico', icon: <BarChart3 size={14} />, prompt: 'Crie um gráfico mostrando ' },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => {
                                            setInput(action.prompt);
                                            setShowActions(false);
                                            textareaRef.current?.focus();
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700/50 hover:border-orange-500/40 text-stone-300 hover:text-white text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Hidden file input for chat attachments */}
                        <input
                            type="file"
                            ref={chatFileInputRef}
                            onChange={handleChatFileChange}
                            accept="image/*,.pdf,.doc,.docx,.pptx,.xlsx,.txt"
                            multiple
                            className="hidden"
                        />

                        {/* File Preview Strip */}
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
                                        <button
                                            onClick={() => removeChatFile(i)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-end gap-2"
                        >
                            {/* Create button */}
                            <button
                                type="button"
                                onClick={() => setShowActions(!showActions)}
                                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${showActions
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-orange-500/30'
                                    }`}
                                title="Criar conteúdo visual"
                            >
                                <ImagePlus size={18} />
                            </button>

                            {/* Attach file button */}
                            <button
                                type="button"
                                onClick={() => chatFileInputRef.current?.click()}
                                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${chatFiles
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-blue-500/30'
                                    }`}
                                title="Anexar arquivo ou imagem"
                            >
                                <Paperclip size={18} />
                            </button>

                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    disabled={isLoading}
                                    placeholder={chatFiles ? 'Descreva o que quer saber sobre o arquivo...' : 'Pergunte algo ao Zeninho...'}
                                    rows={1}
                                    className="w-full resize-none rounded-xl bg-stone-800 border border-stone-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white placeholder-stone-500 px-4 py-3 pr-12 text-sm outline-none transition-colors"
                                />
                            </div>

                            {/* Voice input button */}
                            <button
                                type="button"
                                onClick={toggleVoiceInput}
                                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${isListening
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                    : 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700 hover:border-orange-500/30'
                                    }`}
                                title={isListening ? 'Parar gravação' : 'Falar com Zeninho'}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>

                            {/* Send button */}
                            <button
                                type="submit"
                                disabled={(!input.trim() && !chatFiles) || isLoading}
                                className="shrink-0 w-11 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-orange-500/20 disabled:shadow-none"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                        <p className="text-center text-stone-600 text-xs mt-2">
                            Zeninho pode cometer erros. Verifique informações importantes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
