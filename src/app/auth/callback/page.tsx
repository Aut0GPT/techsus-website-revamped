'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

// Supabase invite/magic-link emails redirect here with a hash fragment:
// /auth/callback#access_token=...&type=invite
// This page grabs the session from the hash and sends the user to /zeninho.
export default function AuthCallbackPage() {
    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

        // getSession() reads the hash fragment automatically on the client
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                window.location.replace('/zeninho');
            } else {
                // Try exchanging the code if present (PKCE flow)
                supabase.auth.onAuthStateChange((event, session) => {
                    if (session) {
                        window.location.replace('/zeninho');
                    }
                });
            }
        });
    }, []);

    return (
        <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center gap-4">
            <Loader2 size={28} className="text-orange-500 animate-spin" />
            <p className="text-stone-400 text-sm">Verificando acesso...</p>
        </div>
    );
}
