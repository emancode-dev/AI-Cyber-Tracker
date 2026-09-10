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
Returns only `{ status: "ok", service: "ai-cyber-tracker-api" }`; dependency configuration is not advertised publicly.

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

Runs the safe passive scanner and persists normalized findings plus sanitized observations through the backend-only trusted writer. Successful technical scan state becomes `waiting_for_answers`. Browser-authenticated users cannot directly fabricate scanner-owned rows.

### GET `/api/scans/:id`
Returns one owned scan, persisted normalized findings, and sanitized observations.

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

Server validates code, applicability, type, and allowed values. Persistence uses a backend-only revision-locked database function; completed assessments are immutable and concurrent stale saves receive a conflict.

## Days 25–27 deterministic analysis

### POST `/api/scans/:id/analyze`
Requires a complete applicable questionnaire. Calculates the deterministic **external posture score** from scanner facts, calculates owner-context risk separately, derives overall priority and assessment coverage, and atomically persists an immutable analysis snapshot + minimal score/lifecycle history. Repeating analyze on a completed assessment returns the immutable result instead of creating a lifecycle event.

AI is not used to calculate or alter the score. Owner context changes priority, not scanner facts or the external score.

## Days 31–34 validated report, retention and history

### POST `/api/scans/:id/report`

Creates or returns a cached report for an owned scored scan. OpenRouter receives only minimized allowlisted context. The response must pass local schema, score-lock and source-code grounding validation. Every roadmap action cites a supplied finding or owner-context code. Provider failures return a retryable deterministic fallback without losing verified facts.

### GET `/api/scans/:id/report`

Returns a previously generated, unexpired report for an owned scan.

### DELETE `/api/scans/:id/data`

Deletes the owned scan and cascading detailed findings, answers and AI report. Lightweight `score_history` remains for progress comparison.

### GET `/api/websites/:id/history`

Returns owner-scoped external score, external risk, owner-context risk, overall priority, coverage, version metadata and category history for before/after UI.

### GET `/api/websites/:id/finding-history`

Returns minimal durable lifecycle events (`new`, `existing`, `resolved`, `regressed`) without restoring expired raw/detailed scan evidence.
