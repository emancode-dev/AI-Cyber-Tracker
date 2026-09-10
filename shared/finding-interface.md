# Normalized finding interface — refinement v2

Every scanner module ultimately normalizes a result into the same trust-aware structure:

```json
{
  "code": "HSTS_MISSING",
  "category": "headers",
  "severity": "medium",
  "status": "needs_attention",
  "confidence": "high",
  "type": "configuration",
  "observationStatus": "not_observed",
  "assessmentState": "needs_attention",
  "title": "HSTS not observed",
  "evidenceSummary": "Strict-Transport-Security was not observed in the final HTTPS response.",
  "whyItMatters": "HSTS tells supporting browsers to keep using HTTPS for this host after a secure visit.",
  "remediation": "After confirming HTTPS readiness, add a durable Strict-Transport-Security policy.",
  "verification": "Rescan and confirm Strict-Transport-Security is present with an appropriate policy.",
  "standards": {
    "owaspTop10": ["OWASP Top 10 A02:2025 Security Misconfiguration"],
    "asvs": ["v5.0.0-3.4.1"],
    "wstg": ["OWASP WSTG - Configuration and Deployment Management Testing"]
  },
  "source": "passive_http",
  "ruleVersion": "2026.09.01",
  "evidence": {
    "summary": "sanitized evidence only"
  }
}
```

## Semantic separation

- `observationStatus`: what the scanner could directly see (`observed`, `not_observed`, `not_tested`, `inconclusive`).
- `assessmentState`: what the product concludes for review (`passed`, `needs_attention`, `manual_review`).
- `status`: backward-compatible scoring/UI status.
- `confidence`: qualitative evidence confidence (`high`, `medium`, `low`), deliberately not a fake numeric probability.

`shared/findingCodes.js` remains the canonical code list. Renaming a code that is already stored in history is a versioned data-contract change, not a casual refactor.
