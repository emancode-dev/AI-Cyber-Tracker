import { HttpError } from "../utils/HttpError.js";

function dbError(error, fallback) {
  if (!error) return null;
  return new HttpError(500, fallback, "DATABASE_ERROR");
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
    title: finding.title,
    why_it_matters: finding.whyItMatters
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
    title: row.title || row.code,
    whyItMatters:
      row.why_it_matters ||
      "This scanner observation may need additional application context."
  };
}

export async function insertScan(supabase, websiteId, status = "scanning") {
  const { data, error } = await supabase
    .from("scans")
    .insert({ website_id: websiteId, status })
    .select(
      "id,website_id,status,score,risk_level,error_message,created_at,expires_at,completed_at"
    )
    .single();

  if (error) throw dbError(error, "Could not create scan.");
  return data;
}

export async function patchScan(supabase, scanId, values) {
  const { data, error } = await supabase
    .from("scans")
    .update(values)
    .eq("id", scanId)
    .select(
      "id,website_id,status,score,risk_level,error_message,created_at,expires_at,completed_at"
    )
    .single();

  if (error) throw dbError(error, "Could not update scan state.");
  return data;
}

export async function insertFindings(supabase, scanId, findings) {
  if (!findings.length) return [];

  const { data, error } = await supabase
    .from("findings")
    .upsert(findings.map((finding) => toFindingRow(scanId, finding)), {
      onConflict: "scan_id,code"
    })
    .select(
      "id,scan_id,code,category,severity,evidence_summary,status,confidence,finding_type,title,why_it_matters,created_at"
    );

  if (error) throw dbError(error, "Could not save scan findings.");
  return (data || []).map(fromFindingRow);
}

export async function getScan(supabase, scanId) {
  const { data, error } = await supabase
    .from("scans")
    .select(
      "id,website_id,status,score,risk_level,error_message,created_at,expires_at,completed_at"
    )
    .eq("id", scanId)
    .maybeSingle();

  if (error) throw dbError(error, "Could not load scan.");
  return data;
}

export async function listFindings(supabase, scanId) {
  const { data, error } = await supabase
    .from("findings")
    .select(
      "id,scan_id,code,category,severity,evidence_summary,status,confidence,finding_type,title,why_it_matters,created_at"
    )
    .eq("scan_id", scanId)
    .order("id", { ascending: true });

  if (error) throw dbError(error, "Could not load scan findings.");
  return (data || []).map(fromFindingRow);
}
