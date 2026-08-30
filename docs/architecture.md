# Architecture through Day 20

```text
React + Vite
  ├─ Supabase Auth (signup/login/session)
  └─ Bearer JWT → Express API
                    ├─ requireAuth
                    ├─ requireOwnership
                    ├─ user-scoped Supabase client
                    └─ PostgreSQL + RLS

Authorized scanner practice path (not public API yet):
URL → urlValidator → pinned safeRequest → redirects → headers/cookies/TLS/metadata → normalizeFindings
```

## Database relationships

```text
auth.users
   │ 1:1
profiles

 auth.users
    │ 1:N
 websites
    │ 1:N
   scans
    │ 1:N
 findings
```

The Day 20 scanner uses standardized finding codes but does not persist scan results yet. Persistence starts at Day 21 according to the plan.
