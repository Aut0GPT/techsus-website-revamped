'use client';

import { useState, useEffect } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function ZeninhoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthed, setIsAuthed] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('zeninho-auth');
        if (stored) {
            setIsAuthed(true);
        }
        setChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        localStorage.setItem('zeninho-auth', code.trim());
        setIsAuthed(true);
        setError('');
    };

    // Full-screen overlay to cover the website nav/footer
    const fullScreenWrapper = (content: React.ReactNode) => (
        <div className="fixed inset-0 z-[100] bg-stone-950">
            {content}
        </div>
    );

    if (checking) {
        return fullScreenWrapper(
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthed) {
        return fullScreenWrapper(
            <div className="h-full flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/20 to-orange-600/20 p-1 mx-auto mb-4 shadow-2xl shadow-orange-500/30">
                            <Image
                                src="/images/zezinho/Zeninhonormal.png"
                                alt="Zeninho"
                                width={112}
                                height={112}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Zeninho</h1>
                        <p className="text-stone-400 text-sm">Assistente IA da TECHSUS</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-stone-400 text-sm mb-2">Código de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                                <input
                                    type="password"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Digite o código de convite"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-800 border border-stone-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white placeholder-stone-500 text-sm outline-none transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                        >
                            Acessar Zeninho
                            <ChevronRight size={16} />
                        </button>
                    </form>

                    <p className="text-center text-stone-600 text-xs mt-6">
                        Acesso restrito a membros da TECHSUS
                    </p>
                </div>
            </div>
        );
    }

    return fullScreenWrapper(children);
}
