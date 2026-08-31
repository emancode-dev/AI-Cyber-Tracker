import test from "node:test";
import assert from "node:assert/strict";
import {
  buildQuestionnaireState,
  getVisibleQuestions,
  validateAnswerForQuestion
} from "../src/questionnaire/questionEngine.js";

const questions = [
  {
    code: "APP_HAS_LOGIN",
    category: "authentication",
    text: "Login?",
    answer_type: "yes_no",
    options: [],
    condition_rule: null
  },
  {
    code: "ACCOUNT_MFA_AVAILABLE",
    category: "authentication",
    text: "MFA?",
    answer_type: "yes_no",
    options: [],
    condition_rule: {
      all: [{ code: "APP_HAS_LOGIN", equals: true }]
    }
  }
];

test("conditional question appears only when its rule matches", () => {
  assert.deepEqual(
    getVisibleQuestions(questions, {}).map((question) => question.code),
    ["APP_HAS_LOGIN"]
  );
  assert.deepEqual(
    getVisibleQuestions(questions, { APP_HAS_LOGIN: false }).map(
      (question) => question.code
    ),
    ["APP_HAS_LOGIN"]
  );
  assert.deepEqual(
    getVisibleQuestions(questions, { APP_HAS_LOGIN: true }).map(
      (question) => question.code
    ),
    ["APP_HAS_LOGIN", "ACCOUNT_MFA_AVAILABLE"]
  );
});

test("yes/no questions reject non-boolean answers", () => {
  assert.throws(() => validateAnswerForQuestion(questions[0], "yes"));
  assert.equal(validateAnswerForQuestion(questions[0], true), true);
});

test("questionnaire progress expands when branching answer reveals a question", () => {
  const state = buildQuestionnaireState(questions, [
    { code: "APP_HAS_LOGIN", value: true }
  ]);
  assert.equal(state.progress.answered, 1);
  assert.equal(state.progress.total, 2);
  assert.equal(state.progress.complete, false);
});
