-- Reliability hardening: atomic assessment state transitions, immutable completed
-- assessments, backend-only questionnaire writes, shared scan quotas, durable
-- dashboard state, report fingerprints, and scheduled cleanup/recovery.

alter table public.scans
  add column if not exists answers_revision integer not null default 0 check (answers_revision >= 0),
  add column if not exists analysis_snapshot jsonb;

alter table public.ai_reports
  add column if not exists input_fingerprint text,
  add column if not exists retryable boolean not null default false,
  add column if not exists retry_after_at timestamptz;

alter table public.score_history
  add column if not exists assessment_id uuid,
  add column if not exists rule_pack_version text,
  add column if not exists questionnaire_version text;

-- score_history.scan_id intentionally becomes NULL when the 48-hour detailed
-- scan row is cleaned up. Keep a separate durable assessment identity so
-- finding lifecycle comparisons can still join to retained methodology data.
update public.score_history
set assessment_id = scan_id
where assessment_id is null and scan_id is not null;

create unique index if not exists score_history_assessment_id_unique_idx
  on public.score_history(assessment_id);

-- A website row is the durable identity that retained score/lifecycle history
-- belongs to. Authenticated users can rename it, but cannot retarget the row or
-- rewrite its authorization state through the Data API.
revoke insert, update on public.websites from authenticated;
grant update (name) on public.websites to authenticated;
grant select, insert, update, delete on public.websites to service_role;

create or replace function public.guard_website_url_authorization()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.url is distinct from old.url
     or new.domain is distinct from old.domain
     or new.authorization_confirmed is distinct from old.authorization_confirmed
     or new.authorization_confirmed_at is distinct from old.authorization_confirmed_at
     or new.user_id is distinct from old.user_id then
    raise exception 'WEBSITE_TARGET_IMMUTABLE';
  end if;
  return new;
end;
$$;

alter table public.finding_history
  drop constraint if exists finding_history_lifecycle_state_check;
alter table public.finding_history
  add constraint finding_history_lifecycle_state_check
  check (lifecycle_state in ('baseline','new','existing','resolved','regressed'));

-- Owner answers are still readable by their owner through RLS, but writes now
-- go through the trusted backend so application validation cannot be bypassed.
revoke insert, update, delete on public.answers from authenticated;
grant select on public.answers to authenticated;
grant select, insert, update, delete on public.answers to service_role;

drop policy if exists "answers_insert_owned_scan" on public.answers;
drop policy if exists "answers_update_owned_scan" on public.answers;
drop policy if exists "answers_delete_owned_scan" on public.answers;

create table if not exists public.scan_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.scan_rate_limits enable row level security;
revoke all on public.scan_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.scan_rate_limits to service_role;

-- Atomic questionnaire write. The row lock and revision make concurrent
-- answer-save vs analysis-finalize races deterministic.
create or replace function public.save_questionnaire_answers(
  p_scan_id uuid,
  p_answers jsonb,
  p_expected_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_revision integer;
  v_item jsonb;
  v_question public.questions%rowtype;
  v_code text;
  v_value jsonb;
begin
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) = 0 then
    raise exception 'ANSWERS_PAYLOAD_INVALID';
  end if;

  select s.status, s.answers_revision
  into v_status, v_revision
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'SCAN_NOT_FOUND';
  end if;

  if v_status <> 'waiting_for_answers' then
    raise exception 'ASSESSMENT_IMMUTABLE';
  end if;

  if p_expected_revision is not null and v_revision <> p_expected_revision then
    raise exception 'ANSWERS_REVISION_CONFLICT';
  end if;

  for v_item in select value from jsonb_array_elements(p_answers)
  loop
    v_code := v_item->>'code';
    v_value := v_item->'value';

    select q.* into v_question
    from public.questions q
    where q.code = v_code and q.active = true;

    if not found then
      raise exception 'QUESTION_NOT_FOUND:%', coalesce(v_code, '');
    end if;

    if v_question.answer_type = 'yes_no' and jsonb_typeof(v_value) <> 'boolean' then
      raise exception 'QUESTION_ANSWER_INVALID:%', v_code;
    end if;

    if v_question.answer_type = 'single_choice' and not exists (
      select 1
      from jsonb_array_elements_text(v_question.options) option_value
      where to_jsonb(option_value) = v_value
    ) then
      raise exception 'QUESTION_ANSWER_INVALID:%', v_code;
    end if;

    insert into public.answers (scan_id, question_id, answer_value)
    values (p_scan_id, v_question.id, v_value)
    on conflict (scan_id, question_id)
    do update set answer_value = excluded.answer_value, updated_at = now();
  end loop;

  update public.scans
  set answers_revision = answers_revision + 1
  where id = p_scan_id
  returning answers_revision into v_revision;

  return jsonb_build_object('answersRevision', v_revision);
end;
$$;

revoke execute on function public.save_questionnaire_answers(uuid, jsonb, integer) from public, anon, authenticated;
grant execute on function public.save_questionnaire_answers(uuid, jsonb, integer) to service_role;

-- Persist the passive scan result in one database transaction. If the RPC is
-- retried after a response/network ambiguity and the scan is already in
-- waiting_for_answers, it returns the committed row instead of duplicating data.
create or replace function public.commit_scan_results(
  p_scan_id uuid,
  p_target_summary jsonb,
  p_findings jsonb,
  p_observations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan public.scans%rowtype;
  v_item jsonb;
begin
  select s.* into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'SCAN_NOT_FOUND';
  end if;

  if v_scan.status = 'waiting_for_answers' then
    return to_jsonb(v_scan);
  end if;

  if v_scan.status <> 'scanning' then
    raise exception 'SCAN_STATE_CONFLICT:%', v_scan.status;
  end if;

  delete from public.findings where scan_id = p_scan_id;
  delete from public.scan_observations where scan_id = p_scan_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_findings, '[]'::jsonb))
  loop
    insert into public.findings (
      scan_id, code, category, severity, evidence_summary, status, confidence,
      finding_type, observation_status, assessment_state, title, why_it_matters,
      remediation, verification, standards, evidence, source, rule_version
    ) values (
      p_scan_id,
      v_item->>'code',
      coalesce(v_item->>'category', 'general'),
      coalesce(v_item->>'severity', 'info'),
      coalesce(v_item->>'evidenceSummary', 'No evidence summary provided.'),
      coalesce(v_item->>'status', 'observed'),
      coalesce(v_item->>'confidence', 'medium'),
      coalesce(v_item->>'type', 'observation'),
      coalesce(v_item->>'observationStatus', 'observed'),
      coalesce(v_item->>'assessmentState', 'manual_review'),
      coalesce(v_item->>'title', v_item->>'code'),
      coalesce(v_item->>'whyItMatters', 'This observation may need application context.'),
      v_item->>'remediation',
      v_item->>'verification',
      coalesce(v_item->'standards', '{"owaspTop10":[],"asvs":[],"wstg":[]}'::jsonb),
      coalesce(v_item->'evidence', '{}'::jsonb),
      coalesce(v_item->>'source', 'passive_http'),
      v_item->>'ruleVersion'
    )
    on conflict (scan_id, code) do update set
      category = excluded.category,
      severity = excluded.severity,
      evidence_summary = excluded.evidence_summary,
      status = excluded.status,
      confidence = excluded.confidence,
      finding_type = excluded.finding_type,
      observation_status = excluded.observation_status,
      assessment_state = excluded.assessment_state,
      title = excluded.title,
      why_it_matters = excluded.why_it_matters,
      remediation = excluded.remediation,
      verification = excluded.verification,
      standards = excluded.standards,
      evidence = excluded.evidence,
      source = excluded.source,
      rule_version = excluded.rule_version;
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(p_observations, '[]'::jsonb))
  loop
    insert into public.scan_observations (
      scan_id, kind, observation_key, observation_status, source, details
    ) values (
      p_scan_id,
      coalesce(v_item->>'kind', 'unknown'),
      coalesce(v_item->>'key', 'unknown'),
      coalesce(v_item->>'status', 'inconclusive'),
      coalesce(v_item->>'source', 'scanner'),
      coalesce(v_item->'details', '{}'::jsonb)
    );
  end loop;

  update public.scans
  set status = 'waiting_for_answers',
      target_summary = p_target_summary,
      error_message = null
  where id = p_scan_id
  returning * into v_scan;

  return to_jsonb(v_scan);
end;
$$;

revoke execute on function public.commit_scan_results(uuid, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.commit_scan_results(uuid, jsonb, jsonb, jsonb) to service_role;

-- Atomically finalize analysis, durable score history, and finding lifecycle.
-- The scan row lock + expected answers revision prevents stale calculations from
-- committing if a questionnaire save won the race.
create or replace function public.finalize_scan_analysis(
  p_scan_id uuid,
  p_expected_answers_revision integer,
  p_analysis jsonb,
  p_versions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan public.scans%rowtype;
  v_user_id uuid;
  v_lifecycle jsonb;
  v_previous_scanner text;
  v_previous_rule_pack text;
  v_methodology_comparable boolean := true;
begin
  select s.* into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'SCAN_NOT_FOUND';
  end if;

  if v_scan.status = 'completed' then
    select jsonb_build_object(
      'baseline', count(*) filter (where lifecycle_state = 'baseline'),
      'new', count(*) filter (where lifecycle_state = 'new'),
      'existing', count(*) filter (where lifecycle_state = 'existing'),
      'resolved', count(*) filter (where lifecycle_state = 'resolved'),
      'regressed', count(*) filter (where lifecycle_state = 'regressed')
    ) into v_lifecycle
    from public.finding_history
    where assessment_id = p_scan_id;

    return jsonb_build_object('status', 'already_completed', 'lifecycle', coalesce(v_lifecycle, '{"baseline":0,"new":0,"existing":0,"resolved":0,"regressed":0}'::jsonb));
  end if;

  if v_scan.status <> 'waiting_for_answers' then
    raise exception 'SCAN_STATE_CONFLICT:%', v_scan.status;
  end if;

  if v_scan.answers_revision <> p_expected_answers_revision then
    raise exception 'ANSWERS_REVISION_CONFLICT';
  end if;

  select w.user_id into v_user_id
  from public.websites w
  where w.id = v_scan.website_id;

  if v_user_id is null then
    raise exception 'WEBSITE_OWNER_NOT_FOUND';
  end if;

  -- Serialize lifecycle commits for the same website so two concurrent rescans
  -- cannot both classify against the same old lifecycle head.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_scan.website_id::text, 0));

  select h.scanner_version, h.rule_pack_version
  into v_previous_scanner, v_previous_rule_pack
  from public.score_history h
  where h.website_id = v_scan.website_id
    and h.assessment_id is not null
    and h.assessment_id is distinct from p_scan_id
  order by h.created_at desc
  limit 1;

  -- Finding lifecycle comparisons are meaningful only when the detector
  -- methodology is comparable. The first assessment and any scanner/rule-pack
  -- change establish a fresh baseline rather than fabricating new/resolved/
  -- regressed claims across incomparable evidence.
  if v_previous_scanner is null then
    v_methodology_comparable := false;
  else
    v_methodology_comparable :=
      coalesce(v_previous_scanner, '') = coalesce(p_versions->>'scanner', '')
      and coalesce(v_previous_rule_pack, '') = coalesce(p_versions->>'rulePack', '');
  end if;

  with current_open as (
    select f.code, f.category, f.severity, f.title
    from public.findings f
    where f.scan_id = p_scan_id
      and f.status in ('needs_attention', 'manual_review')
  ),
  latest_previous as (
    -- Only compare against lifecycle events produced by the same detector
    -- methodology segment. Without this join, an obsolete finding from an old
    -- rule pack could be falsely marked resolved on the second scan after a
    -- methodology re-baseline.
    select distinct on (fh.finding_code)
      fh.finding_code, fh.category, fh.severity, fh.title, fh.lifecycle_state
    from public.finding_history fh
    join public.score_history ph on ph.assessment_id = fh.assessment_id
    where fh.website_id = v_scan.website_id
      and fh.assessment_id <> p_scan_id
      and coalesce(ph.scanner_version, '') = coalesce(p_versions->>'scanner', '')
      and coalesce(ph.rule_pack_version, '') = coalesce(p_versions->>'rulePack', '')
    order by fh.finding_code, fh.created_at desc
  ),
  lifecycle_events as (
    -- With no comparable detector baseline, record only the current open
    -- findings as baseline. Do not emit resolved events for findings that may
    -- simply have disappeared because the methodology changed.
    select
      c.code as finding_code,
      c.category,
      c.severity,
      c.title,
      'baseline'::text as lifecycle_state
    from current_open c
    where not v_methodology_comparable

    union all

    select
      c.code as finding_code,
      c.category,
      c.severity,
      c.title,
      case
        when p.finding_code is null then 'new'
        when p.lifecycle_state = 'resolved' then 'regressed'
        else 'existing'
      end::text as lifecycle_state
    from current_open c
    left join latest_previous p on p.finding_code = c.code
    where v_methodology_comparable

    union all

    select
      p.finding_code,
      p.category,
      p.severity,
      p.title,
      'resolved'::text
    from latest_previous p
    where v_methodology_comparable
      and p.lifecycle_state <> 'resolved'
      and not exists (select 1 from current_open c where c.code = p.finding_code)
  )
  insert into public.finding_history (
    user_id, website_id, assessment_id, finding_code, category, severity, title, lifecycle_state
  )
  select v_user_id, v_scan.website_id, p_scan_id, e.finding_code, e.category, e.severity, e.title, e.lifecycle_state
  from lifecycle_events e
  on conflict (assessment_id, finding_code)
  do update set lifecycle_state = excluded.lifecycle_state,
                category = excluded.category,
                severity = excluded.severity,
                title = excluded.title;

  update public.scans
  set status = 'completed',
      score = (p_analysis->>'score')::integer,
      risk_level = p_analysis->>'riskLevel',
      context_risk_level = p_analysis->>'contextRiskLevel',
      overall_priority = p_analysis->>'overallPriority',
      coverage = p_analysis->'coverage',
      analysis_snapshot = p_analysis,
      scanner_version = coalesce(p_versions->>'scanner', scanner_version),
      rule_pack_version = coalesce(p_versions->>'rulePack', rule_pack_version),
      risk_engine_version = coalesce(p_versions->>'riskEngine', risk_engine_version),
      questionnaire_version = coalesce(p_versions->>'questionnaire', questionnaire_version),
      completed_at = now(),
      error_message = null
  where id = p_scan_id;

  insert into public.score_history (
    user_id, website_id, scan_id, assessment_id, score, risk_level, context_risk_level,
    overall_priority, category_scores, coverage, scanner_version,
    rule_pack_version, risk_engine_version, questionnaire_version
  ) values (
    v_user_id,
    v_scan.website_id,
    p_scan_id,
    p_scan_id,
    (p_analysis->>'score')::integer,
    p_analysis->>'riskLevel',
    p_analysis->>'contextRiskLevel',
    p_analysis->>'overallPriority',
    coalesce(p_analysis->'categoryScores', '{}'::jsonb),
    p_analysis->'coverage',
    p_versions->>'scanner',
    p_versions->>'rulePack',
    p_versions->>'riskEngine',
    p_versions->>'questionnaire'
  )
  on conflict (assessment_id) do update set
    score = excluded.score,
    risk_level = excluded.risk_level,
    context_risk_level = excluded.context_risk_level,
    overall_priority = excluded.overall_priority,
    category_scores = excluded.category_scores,
    coverage = excluded.coverage,
    scanner_version = excluded.scanner_version,
    rule_pack_version = excluded.rule_pack_version,
    risk_engine_version = excluded.risk_engine_version,
    questionnaire_version = excluded.questionnaire_version;

  select jsonb_build_object(
    'baseline', count(*) filter (where lifecycle_state = 'baseline'),
    'new', count(*) filter (where lifecycle_state = 'new'),
    'existing', count(*) filter (where lifecycle_state = 'existing'),
    'resolved', count(*) filter (where lifecycle_state = 'resolved'),
    'regressed', count(*) filter (where lifecycle_state = 'regressed')
  ) into v_lifecycle
  from public.finding_history
  where assessment_id = p_scan_id;

  return jsonb_build_object('status', 'completed', 'lifecycle', coalesce(v_lifecycle, '{"baseline":0,"new":0,"existing":0,"resolved":0,"regressed":0}'::jsonb));
end;
$$;

revoke execute on function public.finalize_scan_analysis(uuid, integer, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_scan_analysis(uuid, integer, jsonb, jsonb) to service_role;

create or replace function public.consume_scan_quota(
  p_user_id uuid,
  p_limit integer,
  p_window_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.scan_rate_limits%rowtype;
  v_now timestamptz := now();
  v_window interval;
  v_retry integer;
begin
  if p_limit <= 0 or p_window_ms <= 0 then
    raise exception 'RATE_LIMIT_CONFIG_INVALID';
  end if;

  v_window := p_window_ms * interval '1 millisecond';

  insert into public.scan_rate_limits (user_id, window_started_at, request_count, updated_at)
  values (p_user_id, v_now, 0, v_now)
  on conflict (user_id) do nothing;

  select * into v_row
  from public.scan_rate_limits
  where user_id = p_user_id
  for update;

  if v_now >= v_row.window_started_at + v_window then
    update public.scan_rate_limits
    set window_started_at = v_now, request_count = 1, updated_at = v_now
    where user_id = p_user_id;
    return jsonb_build_object('allowed', true, 'remaining', greatest(p_limit - 1, 0), 'retryAfterSeconds', 0);
  end if;

  if v_row.request_count >= p_limit then
    v_retry := greatest(1, ceil(extract(epoch from ((v_row.window_started_at + v_window) - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'remaining', 0, 'retryAfterSeconds', v_retry);
  end if;

  update public.scan_rate_limits
  set request_count = request_count + 1, updated_at = v_now
  where user_id = p_user_id;

  return jsonb_build_object('allowed', true, 'remaining', greatest(p_limit - (v_row.request_count + 1), 0), 'retryAfterSeconds', 0);
end;
$$;

revoke execute on function public.consume_scan_quota(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_scan_quota(uuid, integer, integer) to service_role;

-- One owner-scoped query for current website state. Durable score_history is the
-- source of truth after detailed scans expire; scan_id/status are nullable when
-- the 48-hour detailed record has been cleaned up.
create or replace function public.get_owned_website_dashboard()
returns table (
  id uuid,
  user_id uuid,
  name text,
  url text,
  domain text,
  authorization_confirmed boolean,
  authorization_confirmed_at timestamptz,
  created_at timestamptz,
  score integer,
  risk_level text,
  context_risk_level text,
  overall_priority text,
  coverage jsonb,
  latest_scan_id uuid,
  latest_scan_status text,
  latest_category_scores jsonb,
  scanner_version text,
  rule_pack_version text,
  risk_engine_version text,
  questionnaire_version text,
  latest_score_at timestamptz
)
language sql
security invoker
set search_path = ''
stable
as $$
  select
    w.id,
    w.user_id,
    w.name,
    w.url,
    w.domain,
    w.authorization_confirmed,
    w.authorization_confirmed_at,
    w.created_at,
    sh.score,
    sh.risk_level,
    sh.context_risk_level,
    sh.overall_priority,
    sh.coverage,
    sh.scan_id as latest_scan_id,
    s.status as latest_scan_status,
    sh.category_scores as latest_category_scores,
    sh.scanner_version,
    sh.rule_pack_version,
    sh.risk_engine_version,
    sh.questionnaire_version,
    sh.created_at as latest_score_at
  from public.websites w
  left join lateral (
    select h.*
    from public.score_history h
    where h.website_id = w.id
      and h.user_id = (select auth.uid())
    order by h.created_at desc
    limit 1
  ) sh on true
  left join public.scans s on s.id = sh.scan_id
  where w.user_id = (select auth.uid())
  order by w.created_at desc;
$$;

revoke execute on function public.get_owned_website_dashboard() from public, anon;
grant execute on function public.get_owned_website_dashboard() to authenticated;

-- Re-harden the retention function created in migration 007. Supabase
-- recommends an empty search_path for SECURITY DEFINER functions and explicit
-- schema qualification for every relation.
create or replace function public.cleanup_expired_assessment_data()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count bigint;
begin
  delete from public.scans where expires_at <= now();
  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;

revoke execute on function public.cleanup_expired_assessment_data() from public, anon, authenticated;
grant execute on function public.cleanup_expired_assessment_data() to service_role;

create or replace function public.recover_stale_scans()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count bigint;
begin
  update public.scans
  set status = 'failed',
      error_message = 'The assessment worker stopped before completion. Start a fresh scan.',
      completed_at = now()
  where status in ('scanning', 'analyzing')
    and created_at < now() - interval '30 minutes';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.recover_stale_scans() from public, anon, authenticated;
grant execute on function public.recover_stale_scans() to service_role;

-- Supabase hosted Postgres supports pg_cron. These jobs make the documented
-- retention/recovery behavior real instead of relying on a manual operator step.
create extension if not exists pg_cron;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.unschedule(jobid) from cron.job where jobname = 'act-cleanup-expired-assessments';
select cron.unschedule(jobid) from cron.job where jobname = 'act-recover-stale-scans';

select cron.schedule(
  'act-cleanup-expired-assessments',
  '15 * * * *',
  $$select public.cleanup_expired_assessment_data();$$
);

select cron.schedule(
  'act-recover-stale-scans',
  '*/10 * * * *',
  $$select public.recover_stale_scans();$$
);
