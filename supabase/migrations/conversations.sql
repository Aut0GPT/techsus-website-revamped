-- ─────────────────────────────────────────────────────────────────────────────
-- Zeninho: Conversation persistence
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists conversations (
    id           uuid        default gen_random_uuid() primary key,
    user_id      uuid        references auth.users(id) on delete cascade not null,
    title        text        not null default 'Nova conversa',
    model        text        not null default 'gemini',
    messages     jsonb       not null default '[]'::jsonb,
    created_at   timestamptz default now() not null,
    updated_at   timestamptz default now() not null
);

-- Only the owner can see / modify their conversations
alter table conversations enable row level security;

create policy "Users manage own conversations"
    on conversations for all
    using  (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Fast lookup ordered by recency
create index if not exists conversations_user_recency_idx
    on conversations (user_id, updated_at desc);

-- Auto-update updated_at on every change
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists conversations_touch on conversations;
create trigger conversations_touch
    before update on conversations
    for each row execute function touch_updated_at();
