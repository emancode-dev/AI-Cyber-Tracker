-- Preserve durable dashboard scores while exposing a newer in-progress scan.
-- The score and evidence identity continue to come from score_history so the
-- 48-hour detailed-scan cleanup cannot erase the user's current score.

drop function if exists public.get_owned_website_dashboard();

create function public.get_owned_website_dashboard()
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
  latest_score_at timestamptz,
  score_pending boolean
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
    coalesce(latest_scan.status, scored_scan.status) as latest_scan_status,
    sh.category_scores as latest_category_scores,
    sh.scanner_version,
    sh.rule_pack_version,
    sh.risk_engine_version,
    sh.questionnaire_version,
    sh.created_at as latest_score_at,
    coalesce(
      latest_scan.status in ('queued', 'scanning', 'waiting_for_answers', 'analyzing')
      and latest_scan.id is distinct from sh.scan_id,
      false
    ) as score_pending
  from public.websites w
  left join lateral (
    select h.*
    from public.score_history h
    where h.website_id = w.id
      and h.user_id = (select auth.uid())
    order by h.created_at desc
    limit 1
  ) sh on true
  left join public.scans scored_scan on scored_scan.id = sh.scan_id
  left join lateral (
    select s.id, s.status, s.created_at
    from public.scans s
    where s.website_id = w.id
    order by s.created_at desc
    limit 1
  ) latest_scan on true
  where w.user_id = (select auth.uid())
  order by w.created_at desc;
$$;

revoke execute on function public.get_owned_website_dashboard() from public, anon;
grant execute on function public.get_owned_website_dashboard() to authenticated;
