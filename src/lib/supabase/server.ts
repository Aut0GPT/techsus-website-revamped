import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
    const store = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => store.get(name)?.value,
                set: () => {},
                remove: () => {},
            },
        }
    );
}

export async function requireUser(): Promise<
    { user: { id: string; email?: string }; response: null } |
    { user: null; response: Response }
> {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            user: null,
            response: new Response(
                JSON.stringify({ error: 'Não autorizado. Faça login para continuar.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            ),
        };
    }
    return { user: { id: user.id, email: user.email ?? undefined }, response: null };
}
