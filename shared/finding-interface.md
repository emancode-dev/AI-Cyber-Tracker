# Locked finding JSON interface — Day 20

Every scanner module normalizes output to:

```json
{
  "code": "HSTS_MISSING",
  "category": "headers",
  "severity": "medium",
  "status": "needs_attention",
  "confidence": "high",
  "type": "configuration",
  "title": "HSTS not observed",
  "evidenceSummary": "The Strict-Transport-Security header was not observed.",
  "whyItMatters": "HSTS tells supporting browsers to keep using HTTPS."
}
```

`shared/findingCodes.js` is the canonical code list. Once frontend/backend/tests depend on a code, create a deliberate migration/version change rather than casually renaming it.
