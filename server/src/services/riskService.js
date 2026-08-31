import { listAnswers, listActiveQuestions } from "../repositories/questionnaireRepository.js";
import { getScan, listFindings, patchScan } from "../repositories/scanRepository.js";
import { answersToMap, buildQuestionnaireState } from "../questionnaire/questionEngine.js";
import { calculateScore } from "../risk/calculateScore.js";
import { HttpError } from "../utils/HttpError.js";

export async function analyzeOwnedScan(supabase, scanId) {
  const [scan, findings, questions, answers] = await Promise.all([
    getScan(supabase, scanId),
    listFindings(supabase, scanId),
    listActiveQuestions(supabase),
    listAnswers(supabase, scanId)
  ]);

  if (!scan) {
    throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  }

  const questionnaire = buildQuestionnaireState(questions, answers);
  if (!questionnaire.progress.complete) {
    const missing = questionnaire.questions
      .filter(
        (question) =>
          !Object.prototype.hasOwnProperty.call(
            questionnaire.answers,
            question.code
          )
      )
      .map((question) => question.code);

    throw new HttpError(
      409,
      "Complete the applicable questionnaire before calculating the risk score.",
      "QUESTIONNAIRE_INCOMPLETE",
      { missing }
    );
  }

  await patchScan(supabase, scanId, { status: "analyzing" });

  try {
    const analysis = calculateScore(findings, answersToMap(answers));
    await patchScan(supabase, scanId, {
      status: "completed",
      score: analysis.score,
      risk_level: analysis.riskLevel,
      completed_at: new Date().toISOString(),
      error_message: null
    });
    return analysis;
  } catch (error) {
    await patchScan(supabase, scanId, { status: "waiting_for_answers" });
    throw error;
  }
}
