import { HttpError } from "../utils/HttpError.js";

function dbError(error, fallback) {
  return error ? new HttpError(500, fallback, "DATABASE_ERROR") : null;
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
    expires_at: metadata.expiresAt
  }, { onConflict: "scan_id" }).select("*").single();
  if (error) throw dbError(error, "Could not save the assessment report.");
  return fromReport(data);
}

export async function upsertScoreHistory(supabase, values) {
  const { error } = await supabase.from("score_history").upsert({
    user_id: values.userId,
    website_id: values.websiteId,
    scan_id: values.scanId,
    score: values.score,
    risk_level: values.riskLevel,
    category_scores: values.categoryScores
  }, { onConflict: "scan_id" });
  if (error) throw dbError(error, "Could not save score history.");
}

export async function listScoreHistory(supabase, websiteId = null) {
  let query = supabase.from("score_history").select("id,website_id,scan_id,score,risk_level,category_scores,created_at").order("created_at", { ascending: true }).limit(100);
  if (websiteId) query = query.eq("website_id", websiteId);
  const { data, error } = await query;
  if (error) throw dbError(error, "Could not load score history.");
  return data || [];
}

export async function deleteDetailedScan(supabase, scanId) {
  const { error } = await supabase.from("scans").delete().eq("id", scanId);
  if (error) throw dbError(error, "Could not delete assessment data.");
}
