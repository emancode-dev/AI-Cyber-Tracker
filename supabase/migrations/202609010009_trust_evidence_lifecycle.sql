-- Product hardening: trusted writes, safe evidence provenance, versioning, coverage, and finding lifecycle.

alter table public.scans
  add column if not exists context_risk_level text check (context_risk_level in ('low','medium','high')),
  add column if not exists overall_priority text check (overall_priority in ('low','medium','high')),
  add column if not exists coverage jsonb,
  add column if not exists target_summary jsonb,
  add column if not exists scanner_version text,
  add column if not exists rule_pack_version text,
  add column if not exists risk_engine_version text,
  add column if not exists questionnaire_version text;

alter table public.findings
  add column if not exists observation_status text check (observation_status in ('observed','not_observed','not_tested','inconclusive')),
  add column if not exists assessment_state text check (assessment_state in ('passed','needs_attention','manual_review')),
  add column if not exists remediation text,
  add column if not exists verification text,
  add column if not exists standards jsonb not null default '{"owaspTop10":[],"asvs":[],"wstg":[]}'::jsonb,
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists source text not null default 'passive_http',
  add column if not exists rule_version text;

alter table public.ai_reports
  add column if not exists prompt_version text,
  add column if not exists report_schema_version text;

alter table public.score_history
  add column if not exists context_risk_level text check (context_risk_level in ('low','medium','high')),
  add column if not exists overall_priority text check (overall_priority in ('low','medium','high')),
  add column if not exists coverage jsonb,
  add column if not exists scanner_version text,
  add column if not exists risk_engine_version text;

create table if not exists public.scan_observations (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  kind text not null,
  observation_key text not null,
  observation_status text not null check (observation_status in ('observed','not_observed','not_tested','inconclusive')),
  source text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scan_observations_scan_idx on public.scan_observations(scan_id);

create table if not exists public.finding_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  assessment_id uuid not null,
  finding_code text not null,
  category text not null,
  severity text not null check (severity in ('info','low','medium','high')),
  title text not null,
  lifecycle_state text not null check (lifecycle_state in ('new','existing','resolved','regressed')),
  created_at timestamptz not null default now(),
  constraint finding_history_assessment_code_unique unique (assessment_id, finding_code)
);

create index if not exists finding_history_website_created_idx on public.finding_history(website_id, created_at desc);
create index if not exists finding_history_code_created_idx on public.finding_history(website_id, finding_code, created_at desc);

-- Authenticated users may read assessment facts they own, but cannot fabricate or mutate scanner-produced facts.
revoke insert, update, delete on public.scans from authenticated;
revoke insert, update, delete on public.findings from authenticated;
revoke insert, update, delete on public.ai_reports from authenticated;
revoke insert, update, delete on public.score_history from authenticated;
grant select on public.scans, public.findings, public.ai_reports, public.score_history to authenticated;

drop policy if exists "scans_insert_owned_website" on public.scans;
drop policy if exists "scans_update_owned_website" on public.scans;
drop policy if exists "scans_delete_owned_website" on public.scans;
drop policy if exists "findings_insert_owned_scan" on public.findings;
drop policy if exists "findings_update_owned_scan" on public.findings;
drop policy if exists "findings_delete_owned_scan" on public.findings;

drop policy if exists "ai_reports_owned_scan" on public.ai_reports;
create policy "ai_reports_select_owned_scan" on public.ai_reports for select to authenticated
using (exists (
  select 1 from public.scans s join public.websites w on w.id = s.website_id
  where s.id = ai_reports.scan_id and w.user_id = (select auth.uid())
));

drop policy if exists "score_history_owned" on public.score_history;
create policy "score_history_select_owned" on public.score_history for select to authenticated
using (user_id = (select auth.uid()));

alter table public.scan_observations enable row level security;
revoke all on public.scan_observations from anon, authenticated;
grant select on public.scan_observations to authenticated;
create policy "scan_observations_select_owned" on public.scan_observations for select to authenticated
using (exists (
  select 1 from public.scans s join public.websites w on w.id = s.website_id
  where s.id = scan_observations.scan_id and w.user_id = (select auth.uid())
));

alter table public.finding_history enable row level security;
revoke all on public.finding_history from anon, authenticated;
grant select on public.finding_history to authenticated;
create policy "finding_history_select_owned" on public.finding_history for select to authenticated
using (user_id = (select auth.uid()));

-- Trusted backend secret keys run as service_role and bypass RLS; keep explicit table privileges for clarity.
grant select, insert, update, delete on public.scans, public.findings, public.scan_observations, public.ai_reports, public.score_history, public.finding_history to service_role;
grant usage, select on all sequences in schema public to service_role;

comment on table public.scan_observations is 'Temporary, sanitized scanner provenance. Never store raw cookies, authorization headers, response bodies, or credentials here.';
comment on table public.finding_history is 'Durable minimal lifecycle events used for new/existing/resolved/regressed comparisons after detailed scan data expires.';
