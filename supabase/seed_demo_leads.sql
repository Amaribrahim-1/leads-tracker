-- Demo leads for local UI work. Not a schema migration.
-- Run in the Supabase SQL editor (as postgres), or:
--   select public.seed_demo_leads();
-- When you're done:
--   select public.delete_demo_leads();
--
-- Rows are tagged with notes starting '[seed]' so they are easy to remove.
-- The functions are revoked from anon/authenticated — the app cannot call them.

create or replace function public.seed_demo_leads()
returns integer
language plpgsql
as $$
declare
  uid uuid;
  inserted integer;
begin
  select id into uid
  from auth.users
  order by created_at asc
  limit 1;

  if uid is null then
    raise exception 'No auth user found. Create your login user first.';
  end if;

  delete from public.leads
  where user_id = uid
    and notes like '[seed]%';

  insert into public.leads (
    user_id,
    name,
    source,
    status,
    notes,
    next_follow_up
  )
  values
    (
      uid,
      'Acme Studio',
      'Upwork',
      'idea',
      '[seed] Branding brief — reply after the weekend.',
      '2026-09-20'
    ),
    (
      uid,
      'Quiet Harbor',
      'Twitter',
      'idea',
      '[seed] Portfolio site, no budget talk yet.',
      '2026-09-22'
    ),
    (
      uid,
      'Northwind Shop',
      'Referral',
      'contacted',
      '[seed] First call done. Sending a rough estimate.',
      '2026-09-16'
    ),
    (
      uid,
      'Maple Press',
      'Email',
      'contacted',
      '[seed] Asked for a redesign quote on the catalog.',
      '2026-09-17'
    ),
    (
      uid,
      'Harbor Clinic',
      'LinkedIn',
      'proposal_sent',
      '[seed] Proposal for the booking site is out.',
      '2026-09-18'
    ),
    (
      uid,
      'Brightline Co',
      'Upwork',
      'proposal_sent',
      '[seed] Landing page proposal waiting on feedback.',
      '2026-09-19'
    ),
    (
      uid,
      'Cedar Bakery',
      'Instagram',
      'negotiating',
      '[seed] Scope is clear. Waiting on budget confirmation.',
      '2026-09-15'
    ),
    (
      uid,
      'Oak & Iron',
      'Referral',
      'negotiating',
      '[seed] Pushing back on the timeline, not the price.',
      '2026-09-21'
    ),
    (
      uid,
      'Lumen Labs',
      'Email',
      'won',
      '[seed] Kickoff next week.',
      null
    ),
    (
      uid,
      'Field Notes',
      'LinkedIn',
      'won',
      '[seed] Paid the deposit. Build starts Monday.',
      null
    ),
    (
      uid,
      'Pixel Forge',
      'Cold outreach',
      'lost',
      '[seed] Went with an in-house hire.',
      null
    ),
    (
      uid,
      'Nimbus Apps',
      'Upwork',
      'lost',
      '[seed] Ghosted after the discovery call.',
      null
    );

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

create or replace function public.delete_demo_leads()
returns integer
language plpgsql
as $$
declare
  deleted integer;
begin
  delete from public.leads
  where notes like '[seed]%';

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function public.seed_demo_leads() from public;
revoke all on function public.seed_demo_leads() from anon, authenticated;
revoke all on function public.delete_demo_leads() from public;
revoke all on function public.delete_demo_leads() from anon, authenticated;
