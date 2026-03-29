'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

// Supabase invite/recovery emails land here with a hash fragment:
//   #access_token=...&type=invite    → must set a password first
//   #access_token=...&type=recovery  → must set a new password
//   #access_token=...&type=signup    → must set a password first
//   anything else                    → go straight to /zeninho
export default function AuthCallbackPage() {
    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

        // Read type from the URL hash BEFORE Supabase clears it
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const type = params.get('type'); // 'invite' | 'recovery' | 'signup' | null

        const needsPassword = type === 'invite' || type === 'recovery' || type === 'signup';

        // onAuthStateChange fires as soon as Supabase processes the hash token
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!session) return;

            if (needsPassword || event === 'PASSWORD_RECOVERY') {
                window.location.replace('/auth/set-password');
            } else {
                window.location.replace('/zeninho');
            }
        });

        // Fallback: if already has a session and state change already fired
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                if (needsPassword) {
                    window.location.replace('/auth/set-password');
                } else {
                    window.location.replace('/zeninho');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center gap-4">
            <Loader2 size={28} className="text-orange-500 animate-spin" />
            <p className="text-stone-400 text-sm">Verificando acesso...</p>
        </div>
    );
}
