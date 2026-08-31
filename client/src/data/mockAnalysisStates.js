// Day 27 UI fixtures. These are intentionally not used as production results;
// they give frontend developers stable states for component/manual testing.
export const mockAnalysisStates = Object.freeze({
  secureish: {
    score: 93,
    riskLevel: "low",
    categoryScores: { transport: 100, headers: 94, cookies: 90 },
    prioritizedFindings: [],
    contextAdjustments: []
  },
  medium: {
    score: 72,
    riskLevel: "medium",
    categoryScores: { headers: 78, cookies: 84, authentication: 88 },
    prioritizedFindings: [
      {
        code: "HSTS_MISSING",
        title: "HSTS not observed",
        category: "headers",
        severity: "medium",
        penalty: 9
      }
    ],
    contextAdjustments: []
  },
  highRisk: {
    score: 41,
    riskLevel: "high",
    categoryScores: { transport: 55, tls: 58, administration: 70 },
    prioritizedFindings: [
      {
        code: "HTTPS_MISSING",
        title: "HTTPS is not in use",
        category: "transport",
        severity: "high",
        penalty: 18
      }
    ],
    contextAdjustments: [
      {
        code: "CTX_ADMIN_MFA_MISSING",
        category: "administration",
        penalty: 14,
        reason: "The owner reports an admin area without MFA."
      }
    ]
  }
});
