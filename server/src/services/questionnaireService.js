import {
  listActiveQuestions,
  listAnswers,
  upsertAnswers
} from "../repositories/questionnaireRepository.js";
import { patchScan } from "../repositories/scanRepository.js";
import {
  buildQuestionnaireState,
  validateSubmittedAnswers
} from "../questionnaire/questionEngine.js";

export async function getQuestionnaire(supabase, scanId) {
  const [questions, answers] = await Promise.all([
    listActiveQuestions(supabase),
    listAnswers(supabase, scanId)
  ]);
  return buildQuestionnaireState(questions, answers);
}

export async function saveQuestionnaireAnswers(supabase, scanId, submitted) {
  const [questions, existing] = await Promise.all([
    listActiveQuestions(supabase),
    listAnswers(supabase, scanId)
  ]);

  const validated = validateSubmittedAnswers(
    questions,
    existing,
    submitted
  );

  await upsertAnswers(supabase, scanId, questions, validated);
  await patchScan(supabase, scanId, { status: "waiting_for_answers" });

  const answers = await listAnswers(supabase, scanId);
  return buildQuestionnaireState(questions, answers);
}
