import { HttpError } from "../utils/HttpError.js";

function dbError(error, fallback) {
  if (!error) return null;
  return new HttpError(500, fallback, "DATABASE_ERROR", { databaseCode: error.code || null });
}

function questionnaireRpcError(error) {
  const message = String(error?.message || "");
  if (message.includes("ASSESSMENT_IMMUTABLE")) {
    return new HttpError(409, "This assessment has already moved past owner-context collection. Start a fresh scan to change answers.", "ASSESSMENT_IMMUTABLE");
  }
  if (message.includes("ANSWERS_REVISION_CONFLICT")) {
    return new HttpError(409, "The questionnaire changed in another request. Reload it before saving again.", "ANSWERS_REVISION_CONFLICT");
  }
  if (message.includes("QUESTION_NOT_FOUND")) {
    return new HttpError(400, "The questionnaire contains an unknown or inactive question.", "QUESTION_NOT_FOUND");
  }
  if (message.includes("QUESTION_ANSWER_INVALID")) {
    return new HttpError(400, "One of the submitted questionnaire values is invalid.", "QUESTION_ANSWER_INVALID");
  }
  return dbError(error, "Could not save questionnaire answers.");
}

export async function listActiveQuestions(supabase) {
  const { data, error } = await supabase
    .from("questions")
    .select("id,code,category,text,answer_type,options,condition_rule,sort_order,active")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw dbError(error, "Could not load questionnaire questions.");
  return data || [];
}

export async function listAnswers(supabase, scanId) {
  const { data, error } = await supabase
    .from("answers")
    .select("id,scan_id,question_id,answer_value,updated_at,questions(code,sort_order)")
    .eq("scan_id", scanId);

  if (error) throw dbError(error, "Could not load questionnaire answers.");

  return (data || [])
    .map((row) => ({
      id: row.id,
      scanId: row.scan_id,
      questionId: row.question_id,
      code: row.questions?.code,
      value: row.answer_value,
      sortOrder: row.questions?.sort_order ?? 0,
      updatedAt: row.updated_at
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || String(a.code).localeCompare(String(b.code)));
}

export async function saveAnswersAtomically(supabase, scanId, answers, expectedRevision) {
  const { data, error } = await supabase.rpc("save_questionnaire_answers", {
    p_scan_id: scanId,
    p_answers: answers,
    p_expected_revision: expectedRevision ?? null
  });
  if (error) throw questionnaireRpcError(error);
  return data || { answersRevision: expectedRevision ?? 0 };
}
