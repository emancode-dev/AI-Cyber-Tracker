# Supabase setup — trusted-write and reliability model

Use the migrations in `supabase/migrations/`; do not manually recreate schema objects.

## Apply through migration 011

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Current reliability migration:

```text
202609020010_reliability_state_machine.sql
202609090011_dashboard_pending_scan_state.sql
```

Migration 010 adds answer revisions, immutable analysis snapshots, atomic scanner/analysis RPCs, backend-only answer mutation, shared scan quotas, the durable dashboard RPC, report fingerprints, cleanup scheduling and stale-scan recovery. Migration 011 preserves that durable score source while exposing whether a newer assessment is still pending.

## Environment split

`client/.env` contains only browser-safe publishable values. `server/.env` contains the same public project coordinates plus `SUPABASE_SECRET_KEY=sb_secret_...`. The secret key is backend-only and must never be shipped in Vite/browser code or committed.

The Express server uses a user-token client for owner-scoped reads and a separate secret-key client for trusted writes/RPCs.

## Integrity verification

Use two accounts and verify:

1. A normal authenticated client can read only its own rows.
2. Direct authenticated INSERT/UPDATE/DELETE of `scans`, `findings`, `answers`, `ai_reports`, and `score_history` is denied where the application expects backend authority.
3. The Express flow can scan/save answers/analyze/report successfully through the trusted RPCs.
4. Two concurrent answer saves with the same revision cannot both commit.
5. Answer-save versus analysis-finalize either increments the revision first (forcing analysis retry) or completes the assessment first (making the later answer write immutable).
6. A completed assessment remains unchanged on refresh; a new scan creates a new lifecycle assessment.
7. Cleanup removes detailed scan data while durable score/finding history remains owner-scoped.

## Cron

Migration 010 enables/schedules `pg_cron` jobs for expired assessment cleanup and stale transient-scan recovery. Check `cron.job` after migration rather than creating duplicate jobs manually.
