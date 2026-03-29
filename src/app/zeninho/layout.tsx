'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

export default function ZeninhoLayout({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [checking, setChecking] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setChecking(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setSession(session);
            setChecking(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setError('');

        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (error) {
            setError(
                error.message.toLowerCase().includes('invalid login credentials')
                    ? 'Email ou senha incorretos.'
                    : 'Erro ao fazer login. Tente novamente.'
            );
        }
        setLoading(false);
    };

    const fullScreen = (content: React.ReactNode) => (
        <div className="fixed inset-0 z-[100] bg-stone-950">{content}</div>
    );

    if (checking) {
        return fullScreen(
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) {
        return fullScreen(
            <div className="h-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
                    <div className="bg-stone-900/80 backdrop-blur-sm border border-stone-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60">

                        <div className="text-center mb-8">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl" />
                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/20 to-orange-600/20 p-1 shadow-2xl shadow-orange-500/30">
                                    <Image
                                        src="/images/zezinho/Zeninhonormal.png"
                                        alt="Zeninho"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo ao Zeninho</h1>
                            <p className="text-stone-400 text-sm">Assistente IA exclusivo da TECHSUS</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={15} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 text-white placeholder-stone-500 text-sm outline-none transition-all"
                                        autoFocus
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={15} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-stone-800/80 border border-stone-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 text-white placeholder-stone-500 text-sm outline-none transition-all"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email.trim() || !password.trim()}
                                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
                            >
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-stone-800">
                            <p className="text-center text-stone-600 text-xs">
                                Acesso restrito · TECHSUS © 2025
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-stone-700 text-xs mt-4">
                        Não tem acesso? Fale com o administrador da TECHSUS.
                    </p>
                </div>
            </div>
        );
    }

    return fullScreen(children);
}
