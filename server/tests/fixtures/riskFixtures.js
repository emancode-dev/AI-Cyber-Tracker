export const secureish = {
  findings: [
    {
      code: "HTTPS_PRESENT",
      category: "transport",
      severity: "info",
      status: "passed",
      confidence: "high",
      title: "HTTPS is in use"
    },
    {
      code: "HSTS_PRESENT",
      category: "headers",
      severity: "info",
      status: "passed",
      confidence: "high",
      title: "HSTS observed"
    }
  ],
  answers: {
    APP_HAS_LOGIN: false,
    STORES_PERSONAL_DATA: false,
    HANDLES_PAYMENTS: false,
    HAS_BACKUPS: true,
    BACKUPS_TESTED: true,
    HAS_ADMIN_AREA: false,
    USES_THIRD_PARTY_SERVICES: false,
    OWNER_SECURITY_REVIEW_FREQUENCY: "quarterly"
  }
};

export const medium = {
  findings: [
    {
      code: "HSTS_MISSING",
      category: "headers",
      severity: "medium",
      status: "needs_attention",
      confidence: "high",
      title: "HSTS missing"
    },
    {
      code: "CSP_MISSING",
      category: "headers",
      severity: "medium",
      status: "needs_attention",
      confidence: "high",
      title: "CSP missing"
    },
    {
      code: "COOKIE_HTTPONLY_MISSING",
      category: "cookies",
      severity: "medium",
      status: "needs_attention",
      confidence: "high",
      title: "HttpOnly missing"
    }
  ],
  answers: {
    APP_HAS_LOGIN: true,
    HAS_ADMIN_AREA: false,
    STORES_PERSONAL_DATA: false,
    HANDLES_PAYMENTS: false,
    HAS_BACKUPS: true,
    BACKUPS_TESTED: true,
    USES_THIRD_PARTY_SERVICES: false,
    OWNER_SECURITY_REVIEW_FREQUENCY: "yearly"
  }
};

export const highRisk = {
  findings: [
    {
      code: "HTTPS_MISSING",
      category: "transport",
      severity: "high",
      status: "needs_attention",
      confidence: "high",
      title: "HTTPS missing"
    },
    {
      code: "TLS_CERT_INVALID",
      category: "tls",
      severity: "high",
      status: "needs_attention",
      confidence: "high",
      title: "TLS invalid"
    },
    {
      code: "CSP_MISSING",
      category: "headers",
      severity: "medium",
      status: "needs_attention",
      confidence: "high",
      title: "CSP missing"
    },
    {
      code: "COOKIE_SECURE_MISSING",
      category: "cookies",
      severity: "medium",
      status: "needs_attention",
      confidence: "high",
      title: "Secure cookie missing"
    }
  ],
  answers: {
    APP_HAS_LOGIN: true,
    HAS_ADMIN_AREA: true,
    ADMIN_MFA_ENABLED: false,
    STORES_PERSONAL_DATA: true,
    DATA_ENCRYPTED_AT_REST: false,
    HAS_BACKUPS: false,
    HANDLES_PAYMENTS: true,
    STORES_CARD_DATA: true,
    USES_THIRD_PARTY_SERVICES: true,
    THIRD_PARTY_KEYS_SERVER_SIDE: false,
    OWNER_SECURITY_REVIEW_FREQUENCY: "rarely"
  }
};
