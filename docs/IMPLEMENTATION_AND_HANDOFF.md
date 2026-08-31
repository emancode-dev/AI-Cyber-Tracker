# Emerald implementation and handoff

## Outcome

The supplied dark-emerald SaaS reference now drives the product's composition: near-black green surfaces, restrained hairline borders, strong white type, mint focus light, dense modular cards, a real animated globe, global signal map, continuous status rail and compact dashboard proof. The former violet presentation is not loaded by the application.

## Frontend map

| Area | Implementation |
|---|---|
| Landing | `client/src/pages/LandingPage.jsx`, `client/src/styles/emerald.css` |
| Real globe | `client/src/components/emerald/EmeraldGlobe.jsx` using COBE |
| Signal map | `client/src/components/emerald/GlobalSignalMap.jsx` |
| Pointer motion | `client/src/components/emerald/TiltCard.jsx` using Motion |
| Dashboard proof | `client/src/components/emerald/LandingDashboardPreview.jsx` |
| Live dashboard | `client/src/components/dashboard-v2/DashboardOverview.jsx` |
| Auth | `client/src/components/auth/AuthShell.jsx`, `pages/Login.jsx`, `pages/Register.jsx` |
| Reports/history/privacy | `pages/ReportPage.jsx`, `ReportsPage.jsx`, `HistoryPage.jsx`, `SettingsPage.jsx` |

Continuous animation is disabled by the operating system's reduced-motion preference. The COBE canvas pauses while off-screen, and route-level lazy imports keep the landing/dashboard visualization bundles away from unrelated flows.

## Days 31–40 implementation map

| Day | Delivered |
|---|---|
| 31 | Strict `validateAIReport`, production report route/page, timeout/retry and deterministic fallback |
| 32 | Model/mode/source metadata; safe failure log contains scan id + reason, not prompt/context dumps |
| 33 | 48-hour expiry, Delete Now, cascading detail deletion, report export and cleanup function |
| 34 | Persistent owner-scoped score history, fresh-rescan action and before/after category comparison |
| 35 | Server unit tests, frontend lint/build checks, loading/error/empty and responsive states |
| 36 | JWT verification, route ownership checks, RLS, scanner SSRF controls, CORS/rate/body limits and safe client/server errors |
| 37 | Indexed history/expiry queries, AI timeout/retry/fallback, disabled async controls and code-split routes |
| 38 | Environment-driven API/Supabase/OpenRouter configuration and deploy instructions |
| 39 | Health/smoke checklist and production verification commands |
| 40 | Updated README, API contract, architecture/security notes and complete handoff |

## Security boundaries

- Supabase access tokens are verified by the backend. Frontend route protection is convenience, not authorization.
- Every website/scan/history/report endpoint checks ownership, while RLS independently scopes table access.
- OpenRouter never receives URLs, emails, raw headers/cookies, credentials, customer content or arbitrary database rows. Only score, allowlisted finding codes and required normalized questionnaire context are sent.
- AI output cannot alter the deterministic score or introduce a finding code absent from verified evidence. Invalid, unavailable or timed-out AI output falls back to a deterministic roadmap.
- Scanner protections from Days 21–30 remain intact: protocol/port allowlisting, DNS/IP checks, redirect revalidation, size/time limits and per-user scan throttling.
- No secrets are included in the frontend bundle or this archive.

This is a security posture improvement, not a claim of perfect security. Run a dedicated application and infrastructure security review before exposing a production scanner to untrusted tenants.

## Key product flow

1. User authenticates with Supabase.
2. User adds a website and confirms authorization.
3. Express runs the passive, bounded scan and persists normalized findings.
4. Controlled owner questions supply context the scanner cannot see.
5. Pure code calculates the deterministic score.
6. The server builds minimized context and requests structured explanatory output.
7. Local validation accepts only score-locked, evidence-referenced output; otherwise the deterministic fallback is shown.
8. The user exports or deletes detailed data; scheduled cleanup removes it after 48 hours while lightweight history remains.

## Verification performed

- `npm test`: server tests pass, including score determinism, SSRF IP blocks, adaptive questions, minimized AI context, fallback generation and adversarial report validation.
- `npm --prefix client run lint`: passes.
- `npm --prefix client run build`: production build passes.
- `npm run test:ui-design`: checks the required globe/map/motion/chart/privacy elements and reduced-motion fallback.

See `design-qa.md` for the visual/interaction review and `LOCAL_SETUP_SUPABASE_DEPLOY_GIT.md` for copy-paste commands.
