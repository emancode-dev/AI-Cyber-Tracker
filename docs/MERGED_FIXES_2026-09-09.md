# Hardened Bug-Fix Merge — 9 September 2026

This package combines the complete hardening implementation with the supplied dashboard and responsive-layout fixes.

## Preserved hardening

- Service-level authorization confirmation remains mandatory.
- URLs containing embedded credentials remain rejected.
- Website assessment targets remain immutable.
- Dashboard scores continue to come from durable `score_history` after detailed scan cleanup.
- Owner scoping, RLS boundaries, trusted backend writes, atomic assessment transitions, scanner protections and report validation remain unchanged.

## Integrated fixes

- Added a first-load dashboard state instead of briefly rendering an empty dashboard.
- Added tablet layout rules for the dashboard shell, navigation and top bar.
- Changed large heading reveals from character animation to smoother word animation.
- Website cards show `Scanning…` while a newer assessment is in progress.
- Added migration `202609090011_dashboard_pending_scan_state.sql`, which reports pending scan state without replacing retained scores or performing per-website API queries.
- Corrected the History page loading flow so React lint passes without a synchronous state update inside an effect.

## Verification completed

- Server tests: 73 passed, 0 failed.
- Client ESLint: passed.
- Premium UI checks: 15 passed, 0 failed.
- Vite production build: passed.
- `git diff --check`: passed.

Apply every Supabase migration through `202609090011_dashboard_pending_scan_state.sql` before testing pending scan status against a hosted database.
