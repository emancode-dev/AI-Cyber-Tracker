-- Days 31-40: validated report persistence, lightweight score history, and retention cleanup.

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references public.scans(id) on delete cascade,
  summary text not null,
  priorities jsonb not null default '[]'::jsonb,
  roadmap jsonb not null default '{"today":[],"thisWeek":[],"thisMonth":[]}'::jsonb,
  manual_review jsonb not null default '[]'::jsonb,
  model_used text not null default 'deterministic-fallback',
  mode text not null default 'fallback' check (mode in ('ai', 'fallback')),
  source text not null default 'deterministic-fallback',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours')
);

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  scan_id uuid unique references public.scans(id) on delete set null,
  score integer not null check (score between 0 and 100),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  category_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_reports_expires_at_idx on public.ai_reports(expires_at);
create index if not exists score_history_owner_created_idx on public.score_history(user_id, created_at desc);
create index if not exists score_history_website_created_idx on public.score_history(website_id, created_at desc);

alter table public.ai_reports enable row level security;
alter table public.score_history enable row level security;
revoke all on public.ai_reports from anon;
revoke all on public.score_history from anon;
grant select, insert, update, delete on public.ai_reports to authenticated;
grant select, insert, update, delete on public.score_history to authenticated;

drop policy if exists "ai_reports_owned_scan" on public.ai_reports;
create policy "ai_reports_owned_scan" on public.ai_reports for all to authenticated
using (exists (
  select 1 from public.scans s join public.websites w on w.id = s.website_id
  where s.id = ai_reports.scan_id and w.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.scans s join public.websites w on w.id = s.website_id
  where s.id = ai_reports.scan_id and w.user_id = (select auth.uid())
));

drop policy if exists "score_history_owned" on public.score_history;
create policy "score_history_owned" on public.score_history for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop trigger if exists ai_reports_set_updated_at on public.ai_reports;
create trigger ai_reports_set_updated_at before update on public.ai_reports
for each row execute function public.set_updated_at();

create or replace function public.cleanup_expired_assessment_data()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare deleted_count bigint;
begin
  delete from public.scans where expires_at <= now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_expired_assessment_data() from public, anon, authenticated;
comment on function public.cleanup_expired_assessment_data() is
  'Deletes expired detailed scan data. Schedule hourly with Supabase Cron; score_history is retained.';
