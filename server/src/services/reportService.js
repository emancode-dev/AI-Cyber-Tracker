import { env } from "../config/env.js";
import { VERSIONS } from "../config/versions.js";
import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { buildFallbackReport } from "../ai/fallbackReport.js";
import { buildReportFingerprint } from "../ai/reportFingerprint.js";
import { callOpenRouter } from "../ai/openRouterClient.js";
import { buildReportMessages } from "../ai/systemPrompt.js";
import { validateAIReport } from "../ai/validateAIReport.js";
import { answersToMap } from "../questionnaire/questionEngine.js";
import { listAnswers } from "../repositories/questionnaireRepository.js";
import { deleteDetailedScan, getReport, listFindingHistory, listScoreHistory, upsertReport } from "../repositories/reportRepository.js";
import { getScan, listFindings } from "../repositories/scanRepository.js";
import { calculateScore } from "../risk/calculateScore.js";
import { HttpError } from "../utils/HttpError.js";


export function shouldUseCachedReport(cached, inputFingerprint, { apiKeyPresent = Boolean(env.openRouterApiKey), nowMs = Date.now() } = {}) {
  if (!cached || cached.inputFingerprint !== inputFingerprint) return false;
  if (!cached.retryable || !apiKeyPresent) return true;
  const retryAt = cached.retryAfterAt ? Date.parse(cached.retryAfterAt) : Number.NaN;
  return Number.isFinite(retryAt) && retryAt > nowMs;
}

function expiresAt(scan) {
  return scan.expires_at || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
}

export async function generateOwnedReport(readClient, writeClient, scanId) {
  const [scan, findings, answers] = await Promise.all([
    getScan(readClient, scanId),
    listFindings(readClient, scanId),
    listAnswers(readClient, scanId)
  ]);

  if (!scan) throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  if (scan.status !== "completed" || typeof scan.score !== "number") {
    throw new HttpError(409, "Complete deterministic analysis before generating the report.", "ANALYSIS_REQUIRED");
  }

  const answerMap = answersToMap(answers);
  const analysis = scan.analysis_snapshot && typeof scan.analysis_snapshot === "object"
    ? scan.analysis_snapshot
    : calculateScore(findings, answerMap, scan.coverage || null);
  if (analysis.score !== scan.score || analysis.contextRiskLevel !== scan.context_risk_level || analysis.overallPriority !== scan.overall_priority) {
    throw new HttpError(409, "Stored scan assessment no longer matches its immutable analysis snapshot.", "SCORE_STALE");
  }

  const inputFingerprint = buildReportFingerprint({ scan, analysis, findings, answers: answerMap });
  const cached = await getReport(readClient, scanId);
  if (shouldUseCachedReport(cached, inputFingerprint)) return cached;

  const context = buildSafeAIContext({ analysis, findings, answers: answerMap });
  let report = buildFallbackReport(analysis);
  let metadata = {
    modelUsed: "deterministic-fallback",
    mode: "fallback",
    source: "deterministic-fallback",
    promptVersion: VERSIONS.aiPrompt,
    reportSchemaVersion: VERSIONS.reportSchema,
    inputFingerprint,
    retryable: false,
    retryAfterAt: null,
    expiresAt: expiresAt(scan)
  };

  if (env.openRouterApiKey) {
    try {
      const result = await callOpenRouter({ messages: buildReportMessages(context), responseFormat: { type: "json_object" } });
      report = validateAIReport(JSON.parse(result.content), {
        score: context.score,
        allowedFindingCodes: context.findingCodes,
        allowedPriorityFindingCodes: context.priorityFindingCodes,
        allowedReviewFindingCodes: context.reviewFindingCodes,
        allowedRoadmapFindingCodes: context.roadmapFindingCodes,
        allowedContextCodes: context.contextCodes
      });
      metadata = {
        ...metadata,
        modelUsed: result.model,
        mode: "ai",
        source: "openrouter-validated",
        retryable: false,
        retryAfterAt: null
      };
    } catch (error) {
      metadata = {
        ...metadata,
        source: "openrouter-temporary-fallback",
        retryable: true,
        retryAfterAt: new Date(Date.now() + env.openRouterFallbackRetryCooldownMs).toISOString()
      };
      console.warn(JSON.stringify({ type: "ai_report_fallback", scan_id: scanId, reason: error instanceof Error ? error.message : String(error) }));
    }
  }

  return upsertReport(writeClient, scanId, report, metadata);
}

export async function readOwnedReport(supabase, scanId) {
  const report = await getReport(supabase, scanId);
  if (!report) throw new HttpError(404, "Report not found.", "REPORT_NOT_FOUND");
  return report;
}

export async function removeOwnedAssessment(writeClient, scanId) {
  await deleteDetailedScan(writeClient, scanId);
  return { deleted: true, scanId };
}

export async function readScoreHistory(supabase, websiteId) {
  return listScoreHistory(supabase, websiteId);
}

export async function readFindingLifecycle(supabase, websiteId) {
  return listFindingHistory(supabase, websiteId);
}
