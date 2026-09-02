import { HttpError } from "../utils/HttpError.js";
import { VERSIONS } from "../config/versions.js";

function dbError(error, fallback) {
  if (!error) return null;
  return new HttpError(500, fallback, "DATABASE_ERROR", {
    databaseCode: error.code || null
  });
}

function rpcError(error, fallback) {
  if (!error) return null;
  const message = String(error.message || "");
  if (message.includes("ANSWERS_REVISION_CONFLICT")) {
    return new HttpError(409, "Questionnaire answers changed while the assessment was being calculated. Re-run the analysis.", "ANSWERS_REVISION_CONFLICT");
  }
  if (message.includes("ASSESSMENT_IMMUTABLE")) {
    return new HttpError(409, "This completed assessment is immutable. Start a fresh scan to capture new owner context.", "ASSESSMENT_IMMUTABLE");
  }
  if (message.includes("SCAN_STATE_CONFLICT")) {
    return new HttpError(409, "The assessment is not in the expected workflow state.", "SCAN_STATE_CONFLICT");
  }
  if (message.includes("SCAN_NOT_FOUND")) {
    return new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  }
  return dbError(error, fallback);
}

function toFindingRow(scanId, finding) {
  return {
    scan_id: scanId,
    code: finding.code,
    category: finding.category,
    severity: finding.severity,
    evidence_summary: finding.evidenceSummary,
    status: finding.status,
    confidence: finding.confidence,
    finding_type: finding.type,
    observation_status: finding.observationStatus,
    assessment_state: finding.assessmentState,
    title: finding.title,
    why_it_matters: finding.whyItMatters,
    remediation: finding.remediation,
    verification: finding.verification,
    standards: finding.standards,
    evidence: finding.evidence,
    source: finding.source,
    rule_version: finding.ruleVersion
  };
}

function fromFindingRow(row) {
  return {
    code: row.code,
    category: row.category,
    severity: row.severity,
    evidenceSummary: row.evidence_summary,
    status: row.status,
    confidence: row.confidence,
    type: row.finding_type,
    observationStatus: row.observation_status || (row.status === "manual_review" ? "inconclusive" : "observed"),
    assessmentState: row.assessment_state || (row.status === "passed" ? "passed" : row.status === "needs_attention" ? "needs_attention" : "manual_review"),
    title: row.title || row.code,
    whyItMatters: row.why_it_matters || "This scanner observation may need additional application context.",
    remediation: row.remediation || "Review the observation against the application design.",
    verification: row.verification || "Repeat the assessment after the change.",
    standards: row.standards || { owaspTop10: [], asvs: [], wstg: [] },
    evidence: row.evidence || { summary: row.evidence_summary },
    source: row.source || "passive_http",
    ruleVersion: row.rule_version || VERSIONS.rulePack
  };
}

export const SCAN_SELECT = "id,website_id,status,score,risk_level,context_risk_level,overall_priority,coverage,target_summary,scanner_version,rule_pack_version,risk_engine_version,questionnaire_version,answers_revision,analysis_snapshot,error_message,created_at,expires_at,completed_at";
const FINDING_SELECT = "id,scan_id,code,category,severity,evidence_summary,status,confidence,finding_type,observation_status,assessment_state,title,why_it_matters,remediation,verification,standards,evidence,source,rule_version,created_at";

export async function insertScan(supabase, websiteId, status = "scanning") {
  const { data, error } = await supabase
    .from("scans")
    .insert({
      website_id: websiteId,
      status,
      scanner_version: VERSIONS.scanner,
      rule_pack_version: VERSIONS.rulePack,
      risk_engine_version: VERSIONS.riskEngine,
      questionnaire_version: VERSIONS.questionnaire
    })
    .select(SCAN_SELECT)
    .single();

  if (error) throw dbError(error, "Could not create scan.");
  return data;
}

export async function patchScan(supabase, scanId, values) {
  const { data, error } = await supabase
    .from("scans")
    .update(values)
    .eq("id", scanId)
    .select(SCAN_SELECT)
    .single();

  if (error) throw dbError(error, "Could not update scan state.");
  return data;
}

export async function insertFindings(supabase, scanId, findings) {
  if (!findings.length) return [];
  const { data, error } = await supabase
    .from("findings")
    .upsert(findings.map((finding) => toFindingRow(scanId, finding)), { onConflict: "scan_id,code" })
    .select(FINDING_SELECT);
  if (error) throw dbError(error, "Could not save scan findings.");
  return (data || []).map(fromFindingRow);
}

export async function insertObservations(supabase, scanId, observations) {
  if (!observations?.length) return [];
  const rows = observations.map((item) => ({
    scan_id: scanId,
    kind: item.kind,
    observation_key: item.key,
    observation_status: item.status,
    source: item.source,
    details: item.details || {}
  }));
  const { data, error } = await supabase.from("scan_observations").insert(rows).select("id,kind,observation_key,observation_status,source,details,created_at");
  if (error) throw dbError(error, "Could not save safe scan observations.");
  return data || [];
}

export async function commitScanResults(supabase, scanId, result) {
  const { data, error } = await supabase.rpc("commit_scan_results", {
    p_scan_id: scanId,
    p_target_summary: result.target || {},
    p_findings: result.findings || [],
    p_observations: result.observations || []
  });
  if (error) throw rpcError(error, "Could not atomically save the scan result.");
  return data;
}

export async function finalizeScanAnalysis(supabase, scanId, expectedAnswersRevision, analysis) {
  const { data, error } = await supabase.rpc("finalize_scan_analysis", {
    p_scan_id: scanId,
    p_expected_answers_revision: expectedAnswersRevision,
    p_analysis: analysis,
    p_versions: VERSIONS
  });
  if (error) throw rpcError(error, "Could not atomically finalize the assessment.");
  return data || { status: "completed", lifecycle: { baseline: 0, new: 0, existing: 0, resolved: 0, regressed: 0 } };
}

export async function consumeScanQuota(supabase, userId, limit, windowMs) {
  const { data, error } = await supabase.rpc("consume_scan_quota", {
    p_user_id: userId,
    p_limit: limit,
    p_window_ms: windowMs
  });
  if (error) throw dbError(error, "Could not check the shared scan quota.");
  return data || { allowed: false, remaining: 0, retryAfterSeconds: 60 };
}

export async function getScan(supabase, scanId) {
  const { data, error } = await supabase.from("scans").select(SCAN_SELECT).eq("id", scanId).maybeSingle();
  if (error) throw dbError(error, "Could not load scan.");
  return data;
}

export async function listFindings(supabase, scanId) {
  const { data, error } = await supabase.from("findings").select(FINDING_SELECT).eq("scan_id", scanId).order("id", { ascending: true });
  if (error) throw dbError(error, "Could not load scan findings.");
  return (data || []).map(fromFindingRow);
}

export async function listObservations(supabase, scanId) {
  const { data, error } = await supabase.from("scan_observations").select("id,kind,observation_key,observation_status,source,details,created_at").eq("scan_id", scanId).order("id", { ascending: true });
  if (error) throw dbError(error, "Could not load scan observations.");
  return data || [];
}
