import { listAnswers, listActiveQuestions } from "../repositories/questionnaireRepository.js";
import { finalizeScanAnalysis, getScan, listFindings } from "../repositories/scanRepository.js";
import { listFindingHistory } from "../repositories/reportRepository.js";
import { answersToMap, buildQuestionnaireState } from "../questionnaire/questionEngine.js";
import { calculateScore } from "../risk/calculateScore.js";
import { calculateAssessmentCoverage } from "../risk/coverage.js";
import { VERSIONS } from "../config/versions.js";
import { HttpError } from "../utils/HttpError.js";

const EMPTY_LIFECYCLE = Object.freeze({ baseline: 0, new: 0, existing: 0, resolved: 0, regressed: 0 });

function lifecycleForAssessment(events, scanId) {
  const summary = { ...EMPTY_LIFECYCLE };
  for (const event of events || []) {
    if (event.assessment_id !== scanId) continue;
    if (Object.prototype.hasOwnProperty.call(summary, event.lifecycle_state)) {
      summary[event.lifecycle_state] += 1;
    }
  }
  return summary;
}

function persistedMethodology(scan) {
  return {
    scanner: scan.scanner_version || null,
    rulePack: scan.rule_pack_version || null,
    riskEngine: scan.risk_engine_version || null,
    questionnaire: scan.questionnaire_version || null
  };
}

/**
 * Completed assessments are immutable historical records. If a stored analysis
 * snapshot exists, it must be returned before consulting today's questionnaire
 * or risk rules. This keeps old assessments reproducible after methodology
 * changes.
 */
export function canReturnStoredAnalysis(scan) {
  return Boolean(
    scan
    && scan.status === "completed"
    && scan.analysis_snapshot
    && typeof scan.analysis_snapshot === "object"
    && scan.analysis_snapshot.score === scan.score
  );
}

export async function analyzeOwnedScan(readClient, writeClient, scanId) {
  const scan = await getScan(readClient, scanId);
  if (!scan) throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");

  // Historical snapshots are authoritative. Do this before loading or
  // validating the current question bank so future questionnaire changes do
  // not invalidate an assessment that was valid when it completed.
  if (canReturnStoredAnalysis(scan)) {
    const history = await listFindingHistory(readClient, scan.website_id);
    return {
      ...scan.analysis_snapshot,
      lifecycle: lifecycleForAssessment(history, scanId),
      methodology: persistedMethodology(scan)
    };
  }

  const [findings, questions, answers] = await Promise.all([
    listFindings(readClient, scanId),
    listActiveQuestions(readClient),
    listAnswers(readClient, scanId)
  ]);

  const questionnaire = buildQuestionnaireState(questions, answers);
  if (!questionnaire.progress.complete) {
    const missing = questionnaire.questions
      .filter((question) => !Object.prototype.hasOwnProperty.call(questionnaire.answers, question.code))
      .map((question) => question.code);
    throw new HttpError(409, "Complete the applicable questionnaire before calculating the risk score.", "QUESTIONNAIRE_INCOMPLETE", { missing });
  }

  const coverage = calculateAssessmentCoverage(findings, questionnaire);
  const analysis = calculateScore(findings, answersToMap(answers), coverage);

  // Legacy completed assessments created before analysis snapshots cannot be
  // silently reinterpreted by a newer engine. Only return them when the score
  // still matches; otherwise require a fresh assessment.
  if (scan.status === "completed") {
    if (analysis.score !== scan.score) {
      throw new HttpError(409, "This legacy completed assessment predates analysis snapshots and no longer matches the current risk engine.", "METHODOLOGY_CHANGED");
    }
    const history = await listFindingHistory(readClient, scan.website_id);
    return { ...analysis, lifecycle: lifecycleForAssessment(history, scanId), methodology: persistedMethodology(scan) };
  }

  if (scan.status !== "waiting_for_answers") {
    throw new HttpError(409, "The assessment is not ready for deterministic analysis.", "SCAN_STATE_CONFLICT", { status: scan.status });
  }

  const committed = await finalizeScanAnalysis(writeClient, scanId, scan.answers_revision, analysis);
  return {
    ...analysis,
    lifecycle: committed.lifecycle || { ...EMPTY_LIFECYCLE },
    methodology: VERSIONS
  };
}
