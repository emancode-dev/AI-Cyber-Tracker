// Day 22 controlled question bank reference.
// The production API reads mirrored rows from public.questions. With all branches
// inactive there are 15 questions; relevant owner context can expand the path to
// a maximum of 25. AI must never invent assessment questions.
export const QUESTION_BANK_CODES = Object.freeze([
  "APP_HAS_LOGIN",
  "STORES_PERSONAL_DATA",
  "HANDLES_PAYMENTS",
  "HAS_BACKUPS",
  "HAS_ADMIN_AREA",
  "USES_THIRD_PARTY_SERVICES",
  "OWNER_SECURITY_REVIEW_FREQUENCY",
  "DEPENDENCY_UPDATES_REGULAR",
  "PRODUCTION_DEBUG_DISABLED",
  "INCIDENT_RESPONSE_PLAN",
  "TEAM_ACCESS_REVIEWED",
  "SECRETS_SERVER_SIDE",
  "LOG_MONITORING_ENABLED",
  "CHANGE_REVIEW_PROCESS",
  "BACKEND_INPUT_VALIDATION",
  "ACCOUNT_MFA_AVAILABLE",
  "LOGIN_RATE_LIMITING",
  "PASSWORD_RESET_REVIEWED",
  "DATA_ENCRYPTED_AT_REST",
  "DATA_RETENTION_POLICY",
  "PAYMENT_PROVIDER",
  "STORES_CARD_DATA",
  "BACKUPS_TESTED",
  "ADMIN_MFA_ENABLED",
  "THIRD_PARTY_KEYS_SERVER_SIDE"
]);
