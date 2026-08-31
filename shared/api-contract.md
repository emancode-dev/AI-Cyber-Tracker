# AI Cyber Tracker API Contract — Through Day 40

## Response envelope

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Public

### GET `/api/health`
Reports API status and booleans showing whether Supabase/OpenRouter environment configuration is present. No secrets are returned.

## Authenticated website routes

All require `Authorization: Bearer <Supabase access token>`.

### GET `/api/me`
Returns authenticated user context.

### POST `/api/websites`
Adds an owned/authorized website.

### GET `/api/websites`
Lists the current user's websites plus the latest persisted deterministic score when available.

### GET `/api/websites/:id`
Reads one owned website.

### PATCH `/api/websites/:id`
Updates supported owned website fields.

### DELETE `/api/websites/:id`
Deletes one owned website.

## Day 21 real scanner

### POST `/api/websites/:id/scans`
Requires website ownership, rate-limit allowance, and:

```json
{ "authorizationConfirmed": true }
```

Runs the safe passive scanner and persists normalized findings. Successful technical scan state becomes `waiting_for_answers`.

### GET `/api/scans/:id`
Returns one owned scan and its persisted normalized findings.

## Days 22–24 questionnaire

### GET `/api/scans/:id/questions`
Returns the currently applicable controlled questions, saved answers, and progress.

### POST `/api/scans/:id/answers`

```json
{
  "answers": [
    { "code": "APP_HAS_LOGIN", "value": true }
  ]
}
```

Server validates code, applicability, type, and allowed values before persistence.

## Days 25–27 deterministic analysis

### POST `/api/scans/:id/analyze`
Requires a complete applicable questionnaire. Calculates deterministic score/category breakdown/context adjustments, saves `score` + `risk_level` on the scan, and returns the analysis.

AI is not used to calculate or alter the score.

## Days 31–34 validated report, retention and history

### POST `/api/scans/:id/report`

Creates or returns a cached report for an owned scored scan. OpenRouter receives only minimized allowlisted context. The response must pass local schema, score-lock and finding-code validation; failures return a deterministic report without losing the verified score/findings.

### GET `/api/scans/:id/report`

Returns a previously generated, unexpired report for an owned scan.

### DELETE `/api/scans/:id/data`

Deletes the owned scan and cascading detailed findings, answers and AI report. Lightweight `score_history` remains for progress comparison.

### GET `/api/websites/:id/history`

Returns owner-scoped score, risk and broad category history for before/after UI.
