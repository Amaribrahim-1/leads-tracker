create table public.leads (
    id uuid primary key not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    source text,
    status text not null check(status in ('idea','contacted','proposal_sent','negotiating','won','lost')),
    notes text,
    next_follow_up date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant select, insert, update, delete on table public.leads to authenticated;

create policy "users_own_leads"
on public.leads
for all 
to authenticated
using (
    auth.uid() = user_id
) 
with check(
    auth.uid() = user_id
);