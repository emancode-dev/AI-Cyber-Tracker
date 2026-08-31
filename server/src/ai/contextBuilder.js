const ALLOWED_CONTEXT_KEYS = new Set([
  "score",
  "riskLevel",
  "findingCodes",
  "questionnaire"
]);

const FORBIDDEN_KEY_FRAGMENTS = [
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "email",
  "user_id",
  "userid",
  "url",
  "domain",
  "header",
  "body",
  "evidence",
  "api_key",
  "apikey"
];

function assertNoForbiddenKeys(value, path = "context") {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoForbiddenKeys(item, `${path}[${index}]`)
    );
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, nested] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    const isQuestionCode =
      path === "context.questionnaire" && /^[A-Z0-9_]+$/.test(key);

    if (
      !isQuestionCode &&
      FORBIDDEN_KEY_FRAGMENTS.some((fragment) => normalized.includes(fragment))
    ) {
      throw new Error(`Unsafe AI context key blocked at ${path}.${key}`);
    }
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function addIfPresent(set, answers, code) {
  if (Object.prototype.hasOwnProperty.call(answers || {}, code)) {
    set.add(code);
  }
}

export function deriveRequiredQuestionCodes(answers = {}) {
  const required = new Set();

  if (answers.APP_HAS_LOGIN === true) {
    addIfPresent(required, answers, "APP_HAS_LOGIN");
    if (answers.ACCOUNT_MFA_AVAILABLE === false) {
      addIfPresent(required, answers, "ACCOUNT_MFA_AVAILABLE");
    }
    if (answers.LOGIN_RATE_LIMITING === false) {
      addIfPresent(required, answers, "LOGIN_RATE_LIMITING");
    }
    if (answers.PASSWORD_RESET_REVIEWED === false) {
      addIfPresent(required, answers, "PASSWORD_RESET_REVIEWED");
    }
  }

  if (answers.STORES_PERSONAL_DATA === true) {
    addIfPresent(required, answers, "STORES_PERSONAL_DATA");
    if (answers.DATA_ENCRYPTED_AT_REST === false) {
      addIfPresent(required, answers, "DATA_ENCRYPTED_AT_REST");
    }
    if (answers.DATA_RETENTION_POLICY === "not_defined") {
      addIfPresent(required, answers, "DATA_RETENTION_POLICY");
    }
    if (answers.HAS_BACKUPS === false) {
      addIfPresent(required, answers, "HAS_BACKUPS");
    }
  }

  if (answers.HANDLES_PAYMENTS === true) {
    addIfPresent(required, answers, "HANDLES_PAYMENTS");
    addIfPresent(required, answers, "PAYMENT_PROVIDER");
    if (answers.STORES_CARD_DATA === true) {
      addIfPresent(required, answers, "STORES_CARD_DATA");
    }
  }

  if (answers.HAS_BACKUPS === true && answers.BACKUPS_TESTED === false) {
    addIfPresent(required, answers, "HAS_BACKUPS");
    addIfPresent(required, answers, "BACKUPS_TESTED");
  }

  if (answers.HAS_ADMIN_AREA === true) {
    addIfPresent(required, answers, "HAS_ADMIN_AREA");
    if (answers.ADMIN_MFA_ENABLED === false) {
      addIfPresent(required, answers, "ADMIN_MFA_ENABLED");
    }
  }

  if (answers.USES_THIRD_PARTY_SERVICES === true) {
    addIfPresent(required, answers, "USES_THIRD_PARTY_SERVICES");
    if (answers.THIRD_PARTY_KEYS_SERVER_SIDE === false) {
      addIfPresent(required, answers, "THIRD_PARTY_KEYS_SERVER_SIDE");
    }
  }

  const concerningBaseAnswers = [
    ["OWNER_SECURITY_REVIEW_FREQUENCY", "rarely"],
    ["DEPENDENCY_UPDATES_REGULAR", false],
    ["PRODUCTION_DEBUG_DISABLED", false],
    ["INCIDENT_RESPONSE_PLAN", false],
    ["TEAM_ACCESS_REVIEWED", false],
    ["SECRETS_SERVER_SIDE", false],
    ["LOG_MONITORING_ENABLED", false],
    ["CHANGE_REVIEW_PROCESS", false],
    ["BACKEND_INPUT_VALIDATION", false]
  ];

  for (const [code, concerningValue] of concerningBaseAnswers) {
    if (answers[code] === concerningValue) {
      addIfPresent(required, answers, code);
    }
  }

  return [...required];
}

function normalizeQuestionnaireContext(answerMap, allowedQuestionCodes) {
  const allowed = new Set(allowedQuestionCodes || []);
  const entries = Object.entries(answerMap || {}).filter(([code, value]) => {
    const safeType = ["boolean", "string", "number"].includes(typeof value);
    return allowed.has(code) && safeType;
  });
  return Object.fromEntries(entries);
}

export function buildSafeAIContext({
  score,
  riskLevel,
  findings,
  answers,
  requiredQuestionCodes = null
}) {
  const required =
    requiredQuestionCodes || deriveRequiredQuestionCodes(answers || {});

  const context = {
    score,
    riskLevel,
    findingCodes: [...new Set((findings || []).map((finding) => finding.code))],
    questionnaire: normalizeQuestionnaireContext(answers, required)
  };

  for (const key of Object.keys(context)) {
    if (!ALLOWED_CONTEXT_KEYS.has(key)) {
      throw new Error(`Unexpected AI context key: ${key}`);
    }
  }

  assertNoForbiddenKeys(context);
  return context;
}

export function assertSafeAIContext(context) {
  const keys = Object.keys(context || {});
  if (keys.some((key) => !ALLOWED_CONTEXT_KEYS.has(key))) {
    throw new Error("AI context contains fields outside the allowlist.");
  }
  assertNoForbiddenKeys(context);
  return true;
}
