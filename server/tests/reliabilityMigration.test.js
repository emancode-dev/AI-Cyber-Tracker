import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(here, "../../supabase/migrations/202609020010_reliability_state_machine.sql");
const sql = fs.readFileSync(migrationPath, "utf8");
const pendingStateMigrationPath = path.resolve(here, "../../supabase/migrations/202609090011_dashboard_pending_scan_state.sql");
const pendingStateSql = fs.readFileSync(pendingStateMigrationPath, "utf8");

test("questionnaire writes are backend-only and revision-locked", () => {
  assert.match(sql, /revoke insert, update, delete on public\.answers from authenticated/i);
  assert.match(sql, /function public\.save_questionnaire_answers/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /ANSWERS_REVISION_CONFLICT/i);
  assert.match(sql, /answers_revision = answers_revision \+ 1/i);
  assert.match(sql, /analysis_snapshot jsonb/i);
  assert.match(sql, /analysis_snapshot = p_analysis/i);
});

test("analysis and scanner result commits are atomic service-role RPCs", () => {
  assert.match(sql, /function public\.commit_scan_results/i);
  assert.match(sql, /function public\.finalize_scan_analysis/i);
  assert.match(sql, /grant execute on function public\.commit_scan_results[\s\S]*to service_role/i);
  assert.match(sql, /grant execute on function public\.finalize_scan_analysis[\s\S]*to service_role/i);
});

test("shared quota and scheduled cleanup/recovery are configured", () => {
  assert.match(sql, /create table if not exists public\.scan_rate_limits/i);
  assert.match(sql, /function public\.consume_scan_quota/i);
  assert.match(sql, /act-cleanup-expired-assessments/i);
  assert.match(sql, /act-recover-stale-scans/i);
  assert.match(sql, /cleanup_expired_assessment_data/i);
  assert.match(sql, /function public\.cleanup_expired_assessment_data[\s\S]*security definer[\s\S]*set search_path = ''/i);
  assert.match(sql, /create extension if not exists pg_cron;/i);
});

test("dashboard current score comes from durable score history", () => {
  assert.match(sql, /from public\.score_history h/i);
  assert.match(sql, /left join public\.scans s on s\.id = sh\.scan_id/i);
});

test("dashboard pending state preserves durable scores and owner-scoped reads", () => {
  assert.match(pendingStateSql, /from public\.score_history h/i);
  assert.match(pendingStateSql, /h\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(pendingStateSql, /where w\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(pendingStateSql, /latest_scan\.status in \('queued', 'scanning', 'waiting_for_answers', 'analyzing'\)/i);
  assert.match(pendingStateSql, /latest_scan\.id is distinct from sh\.scan_id/i);
  assert.match(pendingStateSql, /score_pending boolean/i);
  assert.match(pendingStateSql, /security invoker/i);
  assert.match(pendingStateSql, /revoke execute[\s\S]*from public, anon/i);
});


test("lifecycle comparisons re-baseline when scanner or rule-pack methodology is not comparable", () => {
  assert.match(sql, /v_methodology_comparable := false/i);
  assert.match(sql, /'baseline'::text as lifecycle_state/i);
  assert.match(sql, /where not v_methodology_comparable/i);
  assert.match(sql, /where v_methodology_comparable[\s\S]*'resolved'::text/i);
  assert.match(sql, /add column if not exists assessment_id uuid/i);
  assert.match(sql, /set assessment_id = scan_id/i);
  assert.match(sql, /h\.assessment_id is not null/i);
  assert.match(sql, /join public\.score_history ph on ph\.assessment_id = fh\.assessment_id/i);
  assert.match(sql, /on conflict \(assessment_id\) do update set/i);
  assert.match(sql, /ph\.scanner_version[\s\S]*p_versions->>'scanner'/i);
  assert.match(sql, /ph\.rule_pack_version[\s\S]*p_versions->>'rulePack'/i);
});

test("website target identity is immutable at the database privilege boundary", () => {
  assert.match(sql, /revoke insert, update on public\.websites from authenticated/i);
  assert.match(sql, /grant update \(name\) on public\.websites to authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on public\.websites to service_role/i);
  assert.match(sql, /function public\.guard_website_url_authorization/i);
  assert.match(sql, /WEBSITE_TARGET_IMMUTABLE/i);
});
