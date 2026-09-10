import { createHash } from "node:crypto";
import { VERSIONS } from "../config/versions.js";

function sortedObject(value) {
  if (Array.isArray(value)) return value.map(sortedObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortedObject(value[key])]));
}

export function buildReportFingerprint({ scan, analysis, findings, answers }) {
  const payload = {
    scanId: scan.id,
    answersRevision: scan.answers_revision ?? 0,
    score: analysis.score,
    riskLevel: analysis.riskLevel,
    contextRiskLevel: analysis.contextRiskLevel,
    overallPriority: analysis.overallPriority,
    coverage: analysis.coverage || null,
    findings: (findings || [])
      .map((finding) => ({
        code: finding.code,
        severity: finding.severity,
        status: finding.status,
        confidence: finding.confidence,
        ruleVersion: finding.ruleVersion || null
      }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    answers: Object.fromEntries(Object.entries(answers || {}).sort(([a], [b]) => a.localeCompare(b))),
    versions: {
      scanner: scan.scanner_version || VERSIONS.scanner,
      rulePack: scan.rule_pack_version || VERSIONS.rulePack,
      riskEngine: scan.risk_engine_version || VERSIONS.riskEngine,
      questionnaire: scan.questionnaire_version || VERSIONS.questionnaire,
      aiPrompt: VERSIONS.aiPrompt,
      reportSchema: VERSIONS.reportSchema
    }
  };
  return createHash("sha256").update(JSON.stringify(sortedObject(payload))).digest("hex");
}
