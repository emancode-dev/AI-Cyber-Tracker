# AI Cyber Tracker

HerDev learn-by-building project. This ZIP contains the integrated implementation through **Day 20**: React foundation, Express API, Supabase PostgreSQL/Auth/RLS, and the safe scanner modules/UI defined for Days 16–20.

## What is real now
- Supabase Auth signup/login/session restoration.
- Protected React routes.
- Express JWT verification.
- PostgreSQL website persistence through a user-scoped Supabase client.
- RLS + backend ownership checks.
- Core schema for profiles/websites/scans/findings.
- SSRF-oriented target validation and pinned outbound requests.
- Redirect, header, cookie, TLS and metadata scanner modules.
- Standardized finding codes/interface.
- Scanner progress/finding/filter/manual-review frontend UI.

## Intentional Day-20 boundary
The scanner modules are **not exposed as a public scan-start API yet**. Day 21 adds scan endpoint protection, rate limiting, request limits and persistence. To exercise the real scanner modules before then, use only an owned/authorized target through `npm run scanner:test` after explicitly setting `SCANNER_CONFIRM_AUTHORIZED=true`.

## 1. Supabase database
Read `docs/supabase-setup.md` and apply the migrations in `supabase/migrations/`.

## 2. Environment
Copy:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in your Supabase project URL and publishable key (or legacy anon key) in both files.

## 3. Install

```bash
cd client && npm install
cd ../server && npm install
```

## 4. Run
Terminal A:

```bash
cd server
npm run dev
```

Terminal B:

```bash
cd client
npm run dev
```

## 5. Verify Day 15
Register → confirm email if enabled → login → add an authorized website → refresh/restart Express → website remains in PostgreSQL.

## 6. Verify ownership
Create User A and User B. A website created by A must not appear for B, and B must not be able to read/delete A's website by guessing its ID.

## 7. Authorized scanner CLI (Days 16–20)
Edit `server/.env`:

```text
SCANNER_CONFIRM_AUTHORIZED=true
SCANNER_TEST_URL=https://YOUR-OWNED-OR-AUTHORIZED-TEST-SITE
```

Then:

```bash
cd server
npm run scanner:test
```

Never use this against sites you do not own or have explicit permission to assess.

## Important docs
- `docs/day11-20-implementation.md`
- `docs/supabase-setup.md`
- `docs/scanner-security.md`
- `shared/api-contract.md`
- `shared/finding-interface.md`
