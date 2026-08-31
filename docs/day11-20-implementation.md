# Days 11–20 implementation map

## Day 11
- Added `profiles`, `websites`, `scans`, and `findings` relational tables.
- Added primary/foreign keys, `NULL`-capable scan result fields, constraints and CRUD-ready schema.

## Day 12
- Added migration files, indexes, timestamps, seed file, Supabase server/client configuration.
- Added reproducible CLI workflow documentation.

## Day 13
- Replaced mock Login/Register behavior with Supabase Auth.
- `AuthContext` restores sessions and listens to auth changes.
- Express `requireAuth` verifies the bearer JWT using Supabase.
- Profile trigger plus `/api/me` profile fallback flow added.

## Day 14
- Added RLS policies for user-owned rows.
- Added backend `requireWebsiteOwnership` middleware.
- Client never supplies `user_id`; backend derives it from verified identity.

## Day 15
- Replaced in-memory website storage with Supabase repositories.
- Add/list/get/update/delete website flows now persist in PostgreSQL.
- Dashboard already includes loading, error and retry states.

## Day 16
- Added URL parsing, protocol/port policy, DNS resolution, private/loopback/link-local blocking, request timeouts and response byte caps.
- Scan page has standardized progress UI using preview data.

## Day 17
- Added safe Node HTTP/HTTPS requests, manual redirect handling, redirect re-validation and max redirects.
- Added frontend finding cards and severity/status badges.

## Day 18
- Added CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame protection, Permissions-Policy and server-disclosure observations.
- `checkHsts()` is intentionally isolated as Eman's cross-teach scanner check.

## Day 19
- Added Secure/HttpOnly/SameSite cookie observations without storing raw cookie values.
- Added practical TLS certificate validity/expiry metadata checks.

## Day 20
- Added safe public metadata checks, form/password-field detection and low-confidence debug/error exposure review.
- Added category filtering + "Needs manual review" UI.
- Locked shared finding codes and normalized finding JSON interface.

## Not pulled forward
- No public scan-start endpoint yet (Day 21).
- No scan/finding persistence yet (Day 21).
- No questionnaire/risk engine (Days 22–27).
- No OpenRouter layer (Days 28–32).
