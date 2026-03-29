'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

function StrengthBar({ password }: { password: string }) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const textColors = ['', 'text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'];

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-stone-700'}`}
                    />
                ))}
            </div>
            <p className={`text-[10px] ${textColors[score]}`}>{labels[score]}</p>
        </div>
    );
}

export default function SetPasswordPage() {
    const [checking, setChecking] = useState(true);
    const [hasSession, setHasSession] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // No session — user shouldn't be here, send to login
                window.location.replace('/zeninho');
                return;
            }
            setHasSession(true);
            setUserEmail(session.user.email ?? '');
            setChecking(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError('Erro ao definir a senha. A sessão pode ter expirado — peça um novo convite.');
            setLoading(false);
            return;
        }

        setDone(true);
        setTimeout(() => window.location.replace('/zeninho'), 2500);
    };

    // ── Loading / redirecting ─────────────────────────────────────────────
    if (checking) {
        return (
            <div className="fixed inset-0 bg-stone-950 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!hasSession) return null;

    return (
        <div className="fixed inset-0 bg-stone-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="bg-stone-900/80 backdrop-blur-sm border border-stone-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60">

                    {done ? (
                        // ── Success state ────────────────────────────────
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle2 size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Senha definida!</h2>
                            <p className="text-stone-400 text-sm mb-4">Entrando no Zeninho agora...</p>
                            <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
                        </div>
                    ) : (
                        // ── Set password form ────────────────────────────
                        <>
                            <div className="text-center mb-7">
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/20 to-orange-600/20 p-1 shadow-xl shadow-orange-500/20">
                                        <Image
                                            src="/images/zezinho/Zeninhonormal.png"
                                            alt="Zeninho"
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <ShieldCheck size={16} className="text-orange-400" />
                                    <h1 className="text-xl font-bold text-white">Crie sua senha</h1>
                                </div>
                                <p className="text-stone-400 text-xs leading-relaxed">
                                    Configure uma senha para acessar o Zeninho nas próximas vezes.
                                </p>
                                {userEmail && (
                                    <p className="text-stone-500 text-xs mt-2 font-mono truncate">{userEmail}</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New password */}
                                <div>
                                    <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                                        Nova senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={15} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-stone-800/80 border border-stone-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 text-white placeholder-stone-500 text-sm outline-none transition-all"
                                            autoFocus
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    <StrengthBar password={password} />
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                                        Confirmar senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={15} />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            placeholder="Repita a senha"
                                            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-stone-800/80 border text-white placeholder-stone-500 text-sm outline-none transition-all focus:ring-1 ${
                                                confirm && confirm !== password
                                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                                                    : confirm && confirm === password
                                                        ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/30'
                                                        : 'border-stone-700 focus:border-orange-500 focus:ring-orange-500/40'
                                            }`}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {confirm && confirm === password && (
                                        <p className="text-[10px] text-green-400 mt-1.5 flex items-center gap-1">
                                            <CheckCircle2 size={10} /> Senhas coincidem
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirm}
                                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
                                >
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                                    {loading ? 'Salvando...' : 'Definir senha e entrar'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
