import { HttpError } from "../utils/HttpError.js";

export function answersToMap(answers) {
  return Object.fromEntries(
    answers
      .filter((answer) => answer.code)
      .map((answer) => [answer.code, answer.value])
  );
}

function conditionMatches(condition, answerMap) {
  if (!condition) return true;
  const rules = Array.isArray(condition.all) ? condition.all : [];
  return rules.every((rule) => answerMap[rule.code] === rule.equals);
}

export function getVisibleQuestions(questions, answerMap) {
  return questions.filter((question) =>
    conditionMatches(question.condition_rule, answerMap)
  );
}

export function validateAnswerForQuestion(question, value) {
  if (question.answer_type === "yes_no") {
    if (typeof value !== "boolean") {
      throw new HttpError(
        400,
        `Question ${question.code} expects a yes/no answer.`,
        "QUESTION_ANSWER_INVALID"
      );
    }
    return value;
  }

  if (question.answer_type === "single_choice") {
    const options = Array.isArray(question.options) ? question.options : [];
    if (typeof value !== "string" || !options.includes(value)) {
      throw new HttpError(
        400,
        `Question ${question.code} received an unsupported option.`,
        "QUESTION_ANSWER_INVALID"
      );
    }
    return value;
  }

  throw new HttpError(
    400,
    `Unsupported answer type for ${question.code}.`,
    "QUESTION_ANSWER_INVALID"
  );
}

export function validateSubmittedAnswers(questions, existingAnswers, submitted) {
  const byCode = new Map(questions.map((question) => [question.code, question]));
  const currentMap = answersToMap(existingAnswers);
  const validated = [];

  for (const answer of submitted) {
    const question = byCode.get(answer.code);
    if (!question) {
      throw new HttpError(
        400,
        `Unknown questionnaire code: ${answer.code}`,
        "QUESTION_NOT_FOUND"
      );
    }

    const visibleBeforeAnswer = getVisibleQuestions(questions, currentMap).some(
      (candidate) => candidate.code === question.code
    );

    if (!visibleBeforeAnswer) {
      throw new HttpError(
        400,
        `Question ${question.code} is not applicable to the current questionnaire path.`,
        "QUESTION_NOT_APPLICABLE"
      );
    }

    const value = validateAnswerForQuestion(question, answer.value);
    currentMap[answer.code] = value;
    validated.push({ code: answer.code, value });
  }

  return validated;
}

export function buildQuestionnaireState(questions, answers) {
  const answerMap = answersToMap(answers);
  const visible = getVisibleQuestions(questions, answerMap);
  const answeredVisible = visible.filter((question) =>
    Object.prototype.hasOwnProperty.call(answerMap, question.code)
  );

  return {
    questions: visible.map((question) => ({
      code: question.code,
      category: question.category,
      text: question.text,
      answerType: question.answer_type,
      options: question.options || []
    })),
    answers: answerMap,
    progress: {
      answered: answeredVisible.length,
      total: visible.length,
      complete:
        visible.length > 0 && answeredVisible.length === visible.length
    }
  };
}
