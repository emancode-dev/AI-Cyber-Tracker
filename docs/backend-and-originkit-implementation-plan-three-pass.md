# Backend truth audit and Originkit implementation plan

## Backend truth audit

| Dashboard surface | Current source | Verdict before this update | Required correction |
|---|---|---|---|
| Portfolio score and risk counts | `GET /api/websites`, latest scored scan per owned website | Real, owner-scoped, derived from Supabase | Keep; return through a dedicated summary contract so provenance is explicit. |
| Latest website state | `GET /api/websites` | Real and owner-scoped | Keep and add edit access. |
| Priority watchlist | Browser sort of current real scores | Real derived data | Move derivation to the API summary and expose the rule. |
| Website score comparison | Browser chart of current real scores | Real derived data | Move to the API summary for one authoritative response. |
| Score movement | Latest scores from different websites treated as time points | Incorrect temporal meaning | Replace with real `score_history` records ordered by assessment date. |
| Dashboard world map | Decorative static locations | Not backend-backed | Replace with a real category exposure summary calculated from retained score history. |
| Reports | Latest owned scan IDs from `GET /api/websites` | Real and owner-scoped | Add explicit empty/failed states; keep report route ownership checks. |
| History | `GET /api/websites/:id/history` | Real and owner-scoped | Keep; improve loading selection and comparison semantics. |
| Add website | `POST /api/websites` | Real and validated | Keep. |
| Website edit | API `PATCH` exists, no UI | Backend exists but UI is missing | Add accessible edit modal and refresh state after save. |
| Settings/profile | Supabase session metadata; static security cards | Partly real, not editable | Add API-backed profile update, avatar storage, password update, and real session/security facts. |
| Notification bell | Static button | Not workable | Add an accessible menu driven by real priority/scan state. |

## Plan v1

1. Add a dashboard summary endpoint built from owner-scoped websites and score history.
2. Add profile update and avatar fields, wire settings forms, and add website edit UI.
3. Replace COBE with the supplied Originkit Three.js globe and add full/semiglobe wrappers.
4. Add falling-code canvas, generated security-exposure artwork, and stronger reveal motion.
5. Test API utilities, build both apps, perform browser QA, then package and document.

### Critique 1

The plan fixes the visible gaps, but it does not state how a user can tell demo data from live data. It also risks putting multiple unrelated aggregates into a loosely defined response. Avatar upload needs database and storage authorization, not only a frontend input. The globe must avoid a runtime dependency on a third-party GeoJSON URL.

## Plan v2

1. Define a versioned, explicit `dashboard/summary` response with `source`, `generatedAt`, real trend points, portfolio comparison, category averages, watchlist, and notifications.
2. Label preview-only content as demo and live content as protected Supabase data.
3. Add `avatar_url` plus a constrained Supabase Storage bucket and owner-folder RLS policies; validate profile payloads on the API.
4. Bundle the globe's world geometry locally and preserve reduced-motion behavior.
5. Add UI, tests, browser QA, PDF, migration/setup guide, and ZIP.

### Critique 2

The response could still over-fetch if it loads all history forever. The category panel must explain that retained history contains category scores, not raw findings. Password changes should use Supabase Auth rather than inventing an Express password endpoint. A generated visual must remain illustrative and never imply it is live scan evidence.

## Plan v3

1. Limit trend history to the newest 90 owner-scoped records and aggregate category scores from retained deterministic history only.
2. Return a `methodology` block so UI labels accurately distinguish current scores, historical points, and derived priorities.
3. Use Express + RLS for profile records, Supabase Auth for password changes, and Supabase Storage for validated PNG/JPEG/WebP avatars under the user's own folder.
4. Mark the landing security artwork as an explanatory visualization; all dashboard charts use API results or an unmistakably labelled preview dataset.
5. Integrate the exact supplied Originkit component, switch its geometry fetch to a bundled asset, and expose continuous full and clipped variants.
6. Verify validation, ownership, failure states, responsive layout, keyboard operation, reduced motion, console health, and visual fidelity before packaging.

### Critique 3

This version has clear data provenance and security boundaries. The remaining execution risks are performance from the Three.js globe and character animation, plus unsupported Storage setup on an un-migrated project. Mitigations: pause animation off-screen, cap device pixel ratio, honor reduced motion, animate only meaningful headings/copy, show actionable migration errors, and keep the UI usable without an uploaded avatar.

## Approved implementation sequence

1. Create and test the owner-scoped dashboard summary and profile update contracts.
2. Add the migration for avatar profile data and constrained Storage policies.
3. Wire dashboard, notifications, edit website, settings, avatar, and password flows.
4. Integrate the supplied Originkit globe using local geometry; remove COBE usage.
5. Add code rain, generated explanatory security artwork, card surfaces, and scroll typography.
6. Build, lint, test, run browser interaction and design QA loops.
7. Produce the bilingual teaching PDF, exact setup/migration/Git commands, clean ZIP, and durable deliverables.
