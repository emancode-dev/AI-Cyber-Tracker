# Emerald Implementation Plan — Three-Pass Review

## Visual target

Recreate the supplied dark-emerald AI SaaS reference as the CyberTracker's product language: near-black green surfaces, luminous emerald focus, compact two-column grids, continuous globe/map/rail motion, restrained borders, high-density dashboard proof and strong white typography. The current violet design is not retained as a parallel theme.

## Plan V1

1. Replace violet tokens with emerald tokens.
2. Add a globe, scrolling rail, animated cards and charts.
3. Restyle authentication and dashboard pages.
4. Add Days 31–40 pages and migrations.
5. Build, deploy and package.

### Critique 1

- Too visual-first: it treats motion as decoration instead of product communication.
- Too vague about which existing services and routes stay stable.
- Does not address the current page's major failures: long empty sections, weak CTA flow, inconsistent density and symbolic CSS visuals.
- No motion budget or accessibility fallback.

## Plan V2

1. Map each reference section to a CyberTracker purpose.
2. Introduce a reusable visual system and selected open-source libraries.
3. Rebuild the public landing route around a compact product narrative.
4. Rebuild auth and dashboard with shared components.
5. Implement report, history, privacy and account experiences.
6. Add AI/report/history/retention database and API work.
7. Add tests and deploy.

### Critique 2

- Better structure, but adopting multiple component collections would create mismatched styling and unnecessary dependencies.
- A full Three.js scene is excessive for one globe and risky on mobile.
- Dashboard scope could become too complex for the 40-day learning project.
- The plan still needs explicit security boundaries and a migration order.

## Plan V3

1. Use COBE for the one real globe, GSAP for page timelines, Motion for pointer-reactive cards, Recharts for charts, React Simple Maps for the map, Radix for accessible menus/dialogs, Phosphor for icons and Sonner for feedback.
2. Preserve the existing API base, Supabase Auth context, protected-route boundary, scanner modules, deterministic risk engine and existing migrations.
3. Replace the landing page with the following reference-mapped sections:
   - compact navigation and hero with real auto-rotating globe;
   - continuously moving security-signal/technology rail;
   - modular solution grid for passive scanning, deterministic scoring and owner context;
   - global signal map with live markers;
   - six practical security benefits;
   - real dashboard preview;
   - evidence-first testimonial/trust block;
   - pricing/readiness cards framed honestly for the MVP;
   - FAQ/resources and final scan CTA.
4. Rebuild login/register as branded, responsive two-panel screens with validation, password visibility, Supabase configuration/error states and direct navigation back to the product.
5. Rebuild the dashboard shell with a collapsible sidebar, profile/account card, responsive top bar, usable filters, Recharts visualizations, security summary, recent assessments, priority actions and preview data.
6. Implement Days 31–40 in isolated layers:
   - validated AI report generation and non-AI fallback;
   - report page and Today/Week/Month roadmap;
   - `ai_reports` and `score_history` tables with RLS;
   - delete-now and expiring-data endpoints/UI;
   - rescan history/comparison service and page;
   - cleanup SQL function and optional Supabase Cron schedule;
   - loading/error/empty/success states and duplicate-submit guards;
   - frontend tests, server tests, security checks, production configuration and documentation.
7. Use a motion budget: transforms/opacity only for most UI, stop canvas work off-screen, throttle pointer tilt, disable continuous decorative motion for `prefers-reduced-motion`, and use responsive/static fallbacks below the mobile breakpoint.
8. Run source tests, builds, responsive interaction checks, security checks and design-to-reference comparison. Fix P0–P2 issues before packaging.
9. Deploy only the frontend preview with realistic mock/dashboard data; keep production API/Supabase URLs environment-driven.

### Critique 3

- The scope is large but now separable and testable.
- The visual target is strict without copying irrelevant business content.
- The chosen libraries are purpose-specific and mostly MIT licensed; GSAP is free under its current standard license.
- The database work is additive and migration-safe.
- The deployed frontend can be evaluated without exposing secrets or requiring the production scanner backend.

## Final execution order

1. Foundation: dependencies, tokens, icon system, shared motion/accessibility utilities.
2. Landing page: hero/globe, rails, product grids, map, proof, dashboard showcase, FAQ/CTA.
3. Auth: login/register and recovery-ready form behavior.
4. Dashboard: shell, account menu/card, charts, assessment lists and responsive interactions.
5. Days 31–40 product work: report, history, comparison, privacy/delete, services/routes/migrations/tests.
6. Verification: lint, unit tests, builds, reduced-motion/mobile states, error states and security checklist.
7. Delivery: frontend deployment, complete zip and step-by-step Supabase/environment/Git commands.
