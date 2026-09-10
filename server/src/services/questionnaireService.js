import {
  listActiveQuestions,
  listAnswers,
  saveAnswersAtomically
} from "../repositories/questionnaireRepository.js";
import { getScan } from "../repositories/scanRepository.js";
import {
  buildQuestionnaireState,
  validateSubmittedAnswers
} from "../questionnaire/questionEngine.js";
import { HttpError } from "../utils/HttpError.js";

function withRevision(state, revision) {
  return { ...state, answersRevision: revision ?? 0 };
}

export async function getQuestionnaire(supabase, scanId) {
  const [scan, questions, answers] = await Promise.all([
    getScan(supabase, scanId),
    listActiveQuestions(supabase),
    listAnswers(supabase, scanId)
  ]);
  if (!scan) throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  return withRevision(buildQuestionnaireState(questions, answers), scan.answers_revision);
}

export async function saveQuestionnaireAnswers(readClient, writeClient, scanId, submitted) {
  const [scan, questions, existing] = await Promise.all([
    getScan(readClient, scanId),
    listActiveQuestions(readClient),
    listAnswers(readClient, scanId)
  ]);

  if (!scan) throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  if (scan.status !== "waiting_for_answers") {
    throw new HttpError(409, "This assessment is immutable after owner-context collection. Start a fresh scan to change answers.", "ASSESSMENT_IMMUTABLE");
  }

  const validated = validateSubmittedAnswers(questions, existing, submitted);
  const result = await saveAnswersAtomically(writeClient, scanId, validated, scan.answers_revision);

  // The RPC above is the commit point. Build the response from the already-read
  // state plus the values that were atomically committed instead of performing
  // a second database read that could fail after a successful save and turn a
  // committed answer into an ambiguous 500 response.
  const merged = new Map(existing.map((answer) => [answer.code, answer.value]));
  validated.forEach((answer) => merged.set(answer.code, answer.value));
  const committedAnswers = [...merged.entries()].map(([code, value]) => ({ code, value }));
  return withRevision(buildQuestionnaireState(questions, committedAnswers), result.answersRevision);
}
