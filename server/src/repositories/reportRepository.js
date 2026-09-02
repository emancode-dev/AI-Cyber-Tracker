import { HttpError } from "../utils/HttpError.js";

function dbError(error, fallback) {
  return error ? new HttpError(500, fallback, "DATABASE_ERROR", { databaseCode: error.code || null }) : null;
}

function fromReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    scanId: row.scan_id,
    summary: row.summary,
    priorities: row.priorities || [],
    roadmap: row.roadmap || { today: [], thisWeek: [], thisMonth: [] },
    manualReview: row.manual_review || [],
    modelUsed: row.model_used,
    mode: row.mode,
    source: row.source,
    promptVersion: row.prompt_version,
    reportSchemaVersion: row.report_schema_version,
    inputFingerprint: row.input_fingerprint || null,
    retryable: Boolean(row.retryable),
    retryAfterAt: row.retry_after_at || null,
    createdAt: row.created_at,
    expiresAt: row.expires_at
  };
}

export async function getReport(supabase, scanId) {
  const { data, error } = await supabase.from("ai_reports").select("*").eq("scan_id", scanId).maybeSingle();
  if (error) throw dbError(error, "Could not load the assessment report.");
  return fromReport(data);
}

export async function upsertReport(supabase, scanId, report, metadata) {
  const { data, error } = await supabase.from("ai_reports").upsert({
    scan_id: scanId,
    summary: report.summary,
    priorities: report.priorities,
    roadmap: report.roadmap,
    manual_review: report.manualReview,
    model_used: metadata.modelUsed,
    mode: metadata.mode,
    source: metadata.source,
    prompt_version: metadata.promptVersion,
    report_schema_version: metadata.reportSchemaVersion,
    input_fingerprint: metadata.inputFingerprint,
    retryable: Boolean(metadata.retryable),
    retry_after_at: metadata.retryAfterAt || null,
    expires_at: metadata.expiresAt,
    updated_at: new Date().toISOString()
  }, { onConflict: "scan_id" }).select("*").single();
  if (error) throw dbError(error, "Could not save the assessment report.");
  return fromReport(data);
}

export async function listScoreHistory(supabase, websiteId = null) {
  let query = supabase
    .from("score_history")
    .select("id,website_id,scan_id,assessment_id,score,risk_level,context_risk_level,overall_priority,category_scores,coverage,scanner_version,rule_pack_version,risk_engine_version,questionnaire_version,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (websiteId) query = query.eq("website_id", websiteId);
  const { data, error } = await query;
  if (error) throw dbError(error, "Could not load score history.");
  return (data || []).reverse();
}

export async function listFindingHistory(supabase, websiteId) {
  const { data, error } = await supabase.from("finding_history")
    .select("id,assessment_id,finding_code,category,severity,title,lifecycle_state,created_at")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw dbError(error, "Could not load finding lifecycle history.");
  return data || [];
}

export async function deleteDetailedScan(supabase, scanId) {
  const { error } = await supabase.from("scans").delete().eq("id", scanId);
  if (error) throw dbError(error, "Could not delete assessment data.");
}
