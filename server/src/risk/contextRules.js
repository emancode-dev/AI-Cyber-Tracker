import { FINDING_CODES } from "../../../shared/findingCodes.js";

function hasFinding(findings, code) {
  return findings.some(
    (finding) =>
      finding.code === code &&
      ["needs_attention", "manual_review"].includes(finding.status)
  );
}

function add(adjustments, rule) {
  adjustments.push(rule);
}

export function calculateContextAdjustments(findings, answers) {
  const adjustments = [];

  // Eman's Day 26 cross-teach rule: a missing transport/client-access cookie
  // control matters more when the owner confirms that the app has logins.
  if (
    answers.APP_HAS_LOGIN === true &&
    (hasFinding(findings, FINDING_CODES.COOKIE_SECURE_MISSING) ||
      hasFinding(findings, FINDING_CODES.COOKIE_HTTPONLY_MISSING))
  ) {
    add(adjustments, {
      code: "CTX_LOGIN_COOKIE_CONTROLS",
      category: "authentication",
      penalty: 6,
      reason:
        "Login functionality makes missing Secure/HttpOnly cookie attributes more important to review."
    });
  }

  if (
    answers.HAS_ADMIN_AREA === true &&
    answers.ADMIN_MFA_ENABLED === false
  ) {
    add(adjustments, {
      code: "CTX_ADMIN_MFA_MISSING",
      category: "administration",
      penalty: 14,
      reason: "The owner reports an admin area without MFA."
    });
  }

  if (
    answers.STORES_PERSONAL_DATA === true &&
    answers.HAS_BACKUPS === false
  ) {
    add(adjustments, {
      code: "CTX_PERSONAL_DATA_NO_BACKUPS",
      category: "resilience",
      penalty: 10,
      reason: "Personal/customer data is stored without a backup process."
    });
  }

  if (
    answers.STORES_PERSONAL_DATA === true &&
    answers.DATA_ENCRYPTED_AT_REST === false
  ) {
    add(adjustments, {
      code: "CTX_DATA_AT_REST",
      category: "data",
      penalty: 8,
      reason:
        "The owner reports sensitive stored data without appropriate at-rest encryption."
    });
  }

  if (
    answers.HANDLES_PAYMENTS === true &&
    answers.STORES_CARD_DATA === true
  ) {
    add(adjustments, {
      code: "CTX_CARD_DATA_STORAGE",
      category: "payments",
      penalty: 15,
      reason:
        "The owner reports that the application stores full payment-card data."
    });
  }

  if (
    answers.HAS_BACKUPS === true &&
    answers.BACKUPS_TESTED === false
  ) {
    add(adjustments, {
      code: "CTX_BACKUP_RESTORE_UNTESTED",
      category: "resilience",
      penalty: 6,
      reason: "Backups exist, but a restore has not been successfully tested."
    });
  }

  if (
    answers.USES_THIRD_PARTY_SERVICES === true &&
    answers.THIRD_PARTY_KEYS_SERVER_SIDE === false
  ) {
    add(adjustments, {
      code: "CTX_THIRD_PARTY_KEYS",
      category: "operations",
      penalty: 10,
      reason:
        "The owner reports that private third-party keys are not kept server-side."
    });
  }

  if (answers.OWNER_SECURITY_REVIEW_FREQUENCY === "rarely") {
    add(adjustments, {
      code: "CTX_SECURITY_REVIEW_RARE",
      category: "operations",
      penalty: 5,
      reason: "The owner reports that intentional security reviews are rare."
    });
  }

  return adjustments;
}
