-- Days 22–24: controlled questionnaire bank + validated owner answers.
-- AI never invents assessment questions; the bank is versioned in code/database.

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  text text not null,
  answer_type text not null
    check (answer_type in ('yes_no', 'single_choice')),
  options jsonb not null default '[]'::jsonb,
  condition_rule jsonb,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  answer_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint answers_scan_question_unique unique (scan_id, question_id)
);

create index if not exists questions_active_order_idx
  on public.questions(active, sort_order);

create index if not exists answers_scan_id_idx
  on public.answers(scan_id);

alter table public.questions enable row level security;
alter table public.answers enable row level security;

revoke all on public.questions from anon;
revoke all on public.answers from anon;

grant select on public.questions to authenticated;
grant select, insert, update, delete on public.answers to authenticated;

drop policy if exists "questions_read_authenticated" on public.questions;
create policy "questions_read_authenticated"
on public.questions
for select
to authenticated
using (active = true);

drop policy if exists "answers_select_owned_scan" on public.answers;
create policy "answers_select_owned_scan"
on public.answers
for select
to authenticated
using (
  exists (
    select 1
    from public.scans s
    join public.websites w on w.id = s.website_id
    where s.id = answers.scan_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "answers_insert_owned_scan" on public.answers;
create policy "answers_insert_owned_scan"
on public.answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.scans s
    join public.websites w on w.id = s.website_id
    where s.id = answers.scan_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "answers_update_owned_scan" on public.answers;
create policy "answers_update_owned_scan"
on public.answers
for update
to authenticated
using (
  exists (
    select 1
    from public.scans s
    join public.websites w on w.id = s.website_id
    where s.id = answers.scan_id
      and w.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.scans s
    join public.websites w on w.id = s.website_id
    where s.id = answers.scan_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "answers_delete_owned_scan" on public.answers;
create policy "answers_delete_owned_scan"
on public.answers
for delete
to authenticated
using (
  exists (
    select 1
    from public.scans s
    join public.websites w on w.id = s.website_id
    where s.id = answers.scan_id
      and w.user_id = (select auth.uid())
  )
);

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

drop trigger if exists answers_set_updated_at on public.answers;
create trigger answers_set_updated_at
before update on public.answers
for each row execute function public.set_updated_at();

insert into public.questions
  (code, category, text, answer_type, options, condition_rule, sort_order)
values
  ('APP_HAS_LOGIN', 'authentication', 'Does this website have user login or account functionality?', 'yes_no', '[]', null, 10),
  ('STORES_PERSONAL_DATA', 'data', 'Does the application store personal or customer data?', 'yes_no', '[]', null, 20),
  ('HANDLES_PAYMENTS', 'payments', 'Does the application accept or process payments?', 'yes_no', '[]', null, 30),
  ('HAS_BACKUPS', 'resilience', 'Do you keep backups of important application data?', 'yes_no', '[]', null, 40),
  ('HAS_ADMIN_AREA', 'administration', 'Does the application have an admin or staff-only area?', 'yes_no', '[]', null, 50),
  ('USES_THIRD_PARTY_SERVICES', 'operations', 'Does the application depend on third-party APIs or hosted services?', 'yes_no', '[]', null, 60),
  ('OWNER_SECURITY_REVIEW_FREQUENCY', 'operations', 'How often do you intentionally review application security settings?', 'single_choice', '["monthly","quarterly","yearly","rarely"]', null, 70),
  ('DEPENDENCY_UPDATES_REGULAR', 'operations', 'Do you regularly review and apply important dependency/security updates?', 'yes_no', '[]', null, 80),
  ('PRODUCTION_DEBUG_DISABLED', 'operations', 'Is verbose debug mode disabled in production?', 'yes_no', '[]', null, 90),
  ('INCIDENT_RESPONSE_PLAN', 'operations', 'Do you have a basic plan for responding to a security incident?', 'yes_no', '[]', null, 100),
  ('TEAM_ACCESS_REVIEWED', 'administration', 'Do you periodically review who still needs access to production systems?', 'yes_no', '[]', null, 110),
  ('SECRETS_SERVER_SIDE', 'operations', 'Are private application secrets kept outside frontend/browser code?', 'yes_no', '[]', null, 120),
  ('LOG_MONITORING_ENABLED', 'operations', 'Do you review application/security logs or alerts for unusual failures?', 'yes_no', '[]', null, 130),
  ('CHANGE_REVIEW_PROCESS', 'operations', 'Are important production changes reviewed or tested before release?', 'yes_no', '[]', null, 140),
  ('BACKEND_INPUT_VALIDATION', 'application', 'Does the backend validate important user-controlled input instead of trusting frontend validation alone?', 'yes_no', '[]', null, 150),

  ('ACCOUNT_MFA_AVAILABLE', 'authentication', 'Is multi-factor authentication available for normal user accounts?', 'yes_no', '[]', '{"all":[{"code":"APP_HAS_LOGIN","equals":true}]}'::jsonb, 210),
  ('LOGIN_RATE_LIMITING', 'authentication', 'Do login attempts have rate limiting or equivalent abuse protection?', 'yes_no', '[]', '{"all":[{"code":"APP_HAS_LOGIN","equals":true}]}'::jsonb, 220),
  ('PASSWORD_RESET_REVIEWED', 'authentication', 'Have you reviewed the password-reset flow for account takeover risks?', 'yes_no', '[]', '{"all":[{"code":"APP_HAS_LOGIN","equals":true}]}'::jsonb, 230),

  ('DATA_ENCRYPTED_AT_REST', 'data', 'Is sensitive stored data encrypted at rest where appropriate?', 'yes_no', '[]', '{"all":[{"code":"STORES_PERSONAL_DATA","equals":true}]}'::jsonb, 310),
  ('DATA_RETENTION_POLICY', 'data', 'How is personal-data retention handled?', 'single_choice', '["documented","informal","not_defined"]', '{"all":[{"code":"STORES_PERSONAL_DATA","equals":true}]}'::jsonb, 320),

  ('PAYMENT_PROVIDER', 'payments', 'How are payments handled?', 'single_choice', '["hosted_provider","provider_sdk","self_managed"]', '{"all":[{"code":"HANDLES_PAYMENTS","equals":true}]}'::jsonb, 410),
  ('STORES_CARD_DATA', 'payments', 'Does your own application store full payment-card data?', 'yes_no', '[]', '{"all":[{"code":"HANDLES_PAYMENTS","equals":true}]}'::jsonb, 420),

  ('BACKUPS_TESTED', 'resilience', 'Have you successfully tested restoring from a backup?', 'yes_no', '[]', '{"all":[{"code":"HAS_BACKUPS","equals":true}]}'::jsonb, 510),
  ('ADMIN_MFA_ENABLED', 'administration', 'Is MFA enabled for admin or staff accounts?', 'yes_no', '[]', '{"all":[{"code":"HAS_ADMIN_AREA","equals":true}]}'::jsonb, 610),
  ('THIRD_PARTY_KEYS_SERVER_SIDE', 'operations', 'Are private third-party API keys kept server-side rather than shipped to the browser?', 'yes_no', '[]', '{"all":[{"code":"USES_THIRD_PARTY_SERVICES","equals":true}]}'::jsonb, 710)
on conflict (code) do update set
  category = excluded.category,
  text = excluded.text,
  answer_type = excluded.answer_type,
  options = excluded.options,
  condition_rule = excluded.condition_rule,
  sort_order = excluded.sort_order,
  active = true;
