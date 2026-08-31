# Days 21–30 implementation map

This implementation follows the 40-day plan and intentionally stops before Day 31 production AI-report generation/validation.

## Day 21 — Protected real scan endpoint
- Exposed `POST /api/websites/:id/scans` only behind Supabase authentication, website ownership, explicit per-scan authorization confirmation, and rate limiting.
- Added API JSON body limit, safe request logging (no auth/body/query/evidence logging), and friendly 413/429 errors.
- Runs the real safe passive scanner from Days 16–20.
- Persists scan state + normalized findings to Supabase.
- React `ScanPage` now renders REAL findings rather than generic preview findings.

## Day 22 — Controlled questionnaire design
- Added `questions` and `answers` tables by migration.
- Added a controlled adaptive 15–25 question bank spanning authentication, data, payments, backups/resilience, administration, and operations.
- Added questionnaire progress UI and fixed question types (`yes_no`, `single_choice`).
- AI is not allowed to invent assessment questions.

## Day 23 — Conditional branching
- Added `questionEngine.js` with condition-rule evaluation.
- Login/data/payment/backups/admin/third-party follow-up questions appear only when relevant.
- Frontend submits one answer at a time and receives the newly applicable path from the server.

## Day 24 — Validation, persistence, resume
- Added `GET /api/scans/:id/questions` and `POST /api/scans/:id/answers`.
- Server validates question existence, applicability, answer type, and allowed choice values.
- Answers are upserted to Supabase so the user can refresh and resume.
- Scan remains `waiting_for_answers` until deterministic analysis begins.

## Day 25 — Deterministic score
- Added pure scoring rules in `riskRules.js` and `calculateScore.js`.
- Same findings + same answers always yield the same score.
- Score is code-based; AI cannot change it.
- Added React `SecurityScore` and category breakdown UI.

## Day 26 — Context rules
- Added owner-context adjustments in `contextRules.js`.
- Eman's cross-teach rule increases importance of missing Secure/HttpOnly cookie controls when the owner confirms login functionality.
- Added prioritized findings and context-adjustment UI.
- Scoring limitations are documented in `docs/scoring.md`.

## Day 27 — Business-logic tests + AI-off integration gate
- Added questionnaire branching tests, deterministic score fixtures, secure-ish/medium/high-risk combinations, context-rule tests, and frontend mock analysis states for manual component testing.
- Flow now works: authorized scan → persisted findings → adaptive questionnaire → deterministic score → dashboard latest score.
- AI remains OFF for the product flow at this gate.

## Day 28 — OpenRouter client foundation
- Added server-only `openRouterClient.js` using `OPENROUTER_API_KEY` and configurable `OPENROUTER_MODEL`.
- Added timeout handling and optional attribution headers.
- Added `npm run ai:test` using FAKE minimized evidence only; network call is disabled unless `OPENROUTER_TEST_ENABLED=true`.
- The key never belongs in the React client.

## Day 29 — Constrained prompt + report shape
- Added `SYSTEM_PROMPT` with hard evidence boundaries.
- Model is explicitly forbidden from inventing findings or changing the deterministic score.
- Added structured report shape: summary, priorities, roadmap (Today/This Week/This Month), manual review.
- OpenRouter practice script performs a lightweight score/finding-code grounding smoke check. Full production validation remains Day 31.

## Day 30 — Minimized AI context
- Added `contextBuilder.js` with an allowlisted payload containing only score, risk level, finding codes, and controlled questionnaire context.
- Raw cookies, headers, URLs, evidence dumps, user identity, tokens, passwords, API keys, and customer data are not forwarded.
- Added context-minimization tests and `docs/safe-ai-payload.md`.

## Intentionally NOT pulled forward
- Day 31 production `validateAIReport`, ReportPage/RoadmapCard, fallback/retry policy.
- Day 32 AI evaluation/logging integration.
- Day 33 48-hour cleanup job and Delete Now.
- Later rescan/history/deployment work.
