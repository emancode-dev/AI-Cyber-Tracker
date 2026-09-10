# Implementation evaluation and critique — 2026-09 refinement

## Evaluation question

Did the implementation actually improve product trustworthiness, or did it only add code?

## What improved materially

### 1. Trust boundary — strong improvement

Before: ownership RLS prevented cross-user access, but authenticated owners still held database mutation privileges for their own scanner facts.

After: scanner facts require a backend-only trusted writer. This is a real integrity improvement, not a UI feature.

### 2. Evidence quality — strong improvement

Before: a finding mostly carried human-readable evidence text.

After: safe observation/provenance records make scanner facts reproducible without retaining raw sensitive response content.

### 3. False-positive handling — meaningful improvement

The rule layer now distinguishes several “missing” states that were previously too binary, and optional COOP/Permissions signals no longer lower the external score automatically.

### 4. Score semantics — strong improvement

Before: owner questionnaire penalties reduced the same numeric score as scanner facts.

After: external posture and owner context are separate. This is easier to explain and defend.

### 5. Product loop — meaningful improvement

The retained lifecycle model supports new/existing/resolved/regressed states, so the product can answer whether a fix actually survived a rescan.

## What is still not solved

### Passive scope is still narrow

The scanner is still primarily a single-page HTTP/TLS/public-metadata assessor. It does not inspect a whole application, authenticated pages, source code, database permissions, JavaScript runtime behavior or private APIs.

### Standards mappings are guidance, not certification

Attaching OWASP Top 10/ASVS/WSTG references improves explainability, but the application must never say a passive finding proves ASVS compliance/non-compliance for the whole system.

### Scoring weights are product policy

Severity/status/confidence factors are deterministic and testable, but they are not empirically calibrated probabilities. Future work should benchmark them against expert-labeled cases before making stronger claims.

### Lifecycle fingerprint is code-level

The current durable lifecycle key is the finding code per assessment. This is appropriate for the current single-target scan. Multi-page scanning later will need a richer fingerprint that includes resource/scope while preserving privacy.

### Browser mode remains deferred

This is intentional. Adding Playwright before solving browser-request SSRF controls would raise risk faster than it raises trust.

### Real deployment validation still required

Unit/static tests cannot prove that a hosted Supabase migration, secret-key environment and production CORS/deployment are configured correctly. The deployment checklist must include migration/RLS verification with two real test users.

## Testing performed in this build

- Server Node test suite: 29/29 passing after the second implementation loop.
- Added scanner/header benchmark tests.
- Added whitespace/case cookie-attribute regression tests.
- Added evidence-privacy test.
- Added coverage semantics test.
- Added finding lifecycle test.
- Added trusted-write migration static assertions.
- Existing IP safety, questionnaire, AI validation/fallback, risk, dashboard tests retained.
- Project UI design regression script passes all checks.
- TypeScript transpile parser used over JS/JSX/TS source files to catch syntax errors without external package installation.

## Environment limitation during artifact build

The extracted ZIP intentionally contains no `node_modules`. The sandbox could not complete a fresh client dependency install, so `vite build` and ESLint could not be executed here. This is an environment/dependency availability limitation rather than a reported code failure. The source was syntax-transpiled successfully and the repository's dependency-free UI regression script passed.

The final user/deployment verification should still run:

```bash
npm run install:all
npm test
npm run test:ui-design
npm --prefix client run lint
npm --prefix client run build
```

## Next best refinements

1. Add a controlled local HTTP fixture server/adapter so the complete scanner runner can be integration-tested without external targets.
2. Add migration integration tests against a disposable Supabase/Postgres environment.
3. Add a richer finding fingerprint before multi-page scanning.
4. Add optional scheduled rescans after lifecycle logic is proven in production.
5. Add a separately sandboxed browser worker only after request-level SSRF controls are designed and tested.
