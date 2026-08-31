import { HttpError } from "../utils/HttpError.js";

function dbError(error, fallback) {
  if (!error) return null;
  return new HttpError(500, fallback, "DATABASE_ERROR");
}

export async function listActiveQuestions(supabase) {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id,code,category,text,answer_type,options,condition_rule,sort_order,active"
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw dbError(error, "Could not load questionnaire questions.");
  return data || [];
}

export async function listAnswers(supabase, scanId) {
  const { data, error } = await supabase
    .from("answers")
    .select("id,scan_id,question_id,answer_value,updated_at,questions(code)")
    .eq("scan_id", scanId);

  if (error) throw dbError(error, "Could not load questionnaire answers.");

  return (data || []).map((row) => ({
    id: row.id,
    scanId: row.scan_id,
    questionId: row.question_id,
    code: row.questions?.code,
    value: row.answer_value,
    updatedAt: row.updated_at
  }));
}

export async function upsertAnswers(supabase, scanId, questionRows, answers) {
  const byCode = new Map(questionRows.map((question) => [question.code, question]));
  const rows = answers.map((answer) => ({
    scan_id: scanId,
    question_id: byCode.get(answer.code).id,
    answer_value: answer.value
  }));

  const { error } = await supabase.from("answers").upsert(rows, {
    onConflict: "scan_id,question_id"
  });

  if (error) throw dbError(error, "Could not save questionnaire answers.");
}
