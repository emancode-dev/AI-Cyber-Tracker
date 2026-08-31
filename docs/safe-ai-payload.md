# Safe AI payload checklist — Day 30

The OpenRouter layer must receive minimized, normalized context only.

## Allowed production context shape

```json
{
  "score": 72,
  "riskLevel": "medium",
  "findingCodes": ["HSTS_MISSING", "CSP_MISSING"],
  "questionnaire": {
    "APP_HAS_LOGIN": true,
    "HAS_ADMIN_AREA": false
  }
}
```

## Never send to AI
- passwords or password values
- API keys, access tokens, bearer headers, Supabase secrets
- raw cookies or session values
- raw HTTP headers/body dumps
- customer/user records or email addresses
- website URL/domain unless a future feature explicitly proves it is required
- database IDs that do not help the explanation
- raw scanner evidence when the finding code already captures the needed fact
- arbitrary user-entered free text

`contextBuilder.js` uses a small top-level allowlist and rejects sensitive structural fields. The controlled questionnaire uses booleans/known choice values rather than unrestricted text.
