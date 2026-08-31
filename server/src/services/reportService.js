import { env } from "../config/env.js";

import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { buildFallbackReport } from "../ai/fallbackReport.js";
import { callOpenRouter } from "../ai/openRouterClient.js";
import { buildReportMessages } from "../ai/systemPrompt.js";
import { validateAIReport } from "../ai/validateAIReport.js";

import { answersToMap } from "../questionnaire/questionEngine.js";
import { listAnswers } from "../repositories/questionnaireRepository.js";

import {
  deleteDetailedScan,
  getReport,
  listScoreHistory,
  upsertReport,
  upsertScoreHistory
} from "../repositories/reportRepository.js";

import {
  getScan,
  listFindings
} from "../repositories/scanRepository.js";

import { calculateScore } from "../risk/calculateScore.js";
import { HttpError } from "../utils/HttpError.js";

function expiresAt(scan) {
  return (
    scan.expires_at ||
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  );
}

export async function generateOwnedReport(
  supabase,
  scanId,
  userId
) {
  const cached = await getReport(supabase, scanId);

  if (cached) {
    return cached;
  }

  const [scan, findings, answers] = await Promise.all([
    getScan(supabase, scanId),
    listFindings(supabase, scanId),
    listAnswers(supabase, scanId)
  ]);

  if (!scan) {
    throw new HttpError(
      404,
      "Scan not found.",
      "SCAN_NOT_FOUND"
    );
  }

  if (typeof scan.score !== "number") {
    throw new HttpError(
      409,
      "Calculate the deterministic score before generating the report.",
      "ANALYSIS_REQUIRED"
    );
  }

  const answerMap = answersToMap(answers);

  const analysis = calculateScore(
    findings,
    answerMap
  );

  if (analysis.score !== scan.score) {
    throw new HttpError(
      409,
      "Stored scan score no longer matches its evidence. Re-analyze the scan.",
      "SCORE_STALE"
    );
  }

  const context = buildSafeAIContext({
    score: analysis.score,
    riskLevel: analysis.riskLevel,
    findings,
    answers: answerMap
  });

  // Always prepare a deterministic fallback first.
  // This guarantees that report generation still works
  // if OpenRouter is unavailable or produces invalid output.
  let report = buildFallbackReport(analysis);

  let metadata = {
    modelUsed: "deterministic-fallback",
    mode: "fallback",
    source: "deterministic-fallback",
    expiresAt: expiresAt(scan)
  };

  if (env.openRouterApiKey) {
    try {
      const result = await callOpenRouter({
        messages: buildReportMessages(context),

        // Ask the model for valid JSON.
        // Our own validator below remains the source of truth.
        responseFormat: {
          type: "json_object"
        }
      });

      const parsedContent = JSON.parse(
        result.content
      );

      report = validateAIReport(
        parsedContent,
        {
          score: context.score,
          allowedFindingCodes:
            context.findingCodes
        }
      );

      metadata = {
        modelUsed: result.model,
        mode: "ai",
        source: "openrouter-validated",
        expiresAt: expiresAt(scan)
      };
    } catch (error) {
      console.warn(
        JSON.stringify({
          type: "ai_report_fallback",
          scan_id: scanId,
          reason:
            error instanceof Error
              ? error.message
              : String(error)
        })
      );
    }
  }

  await upsertScoreHistory(
    supabase,
    {
      userId,
      websiteId: scan.website_id,
      scanId,
      score: analysis.score,
      riskLevel: analysis.riskLevel,
      categoryScores:
        analysis.categoryScores
    }
  );

  return upsertReport(
    supabase,
    scanId,
    report,
    metadata
  );
}

export async function readOwnedReport(
  supabase,
  scanId
) {
  const report = await getReport(
    supabase,
    scanId
  );

  if (!report) {
    throw new HttpError(
      404,
      "Report not found.",
      "REPORT_NOT_FOUND"
    );
  }

  return report;
}

export async function removeOwnedAssessment(
  supabase,
  scanId
) {
  await deleteDetailedScan(
    supabase,
    scanId
  );

  return {
    deleted: true,
    scanId
  };
}

export async function readScoreHistory(
  supabase,
  websiteId
) {
  return listScoreHistory(
    supabase,
    websiteId
  );
}