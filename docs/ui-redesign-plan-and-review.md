# Cyber AI Tracker — Landing + Dashboard Redesign

## Goal
Preserve the working Days 1–30 product architecture while replacing the visual layer with a dark emerald, conversational security experience based on the two supplied references.

## Backend contract preserved
- Supabase Auth and `AuthContext`
- Express API/service boundary
- Supabase PostgreSQL + RLS
- SSRF-oriented safe scanner
- Controlled questionnaire
- Deterministic risk engine
- Days 28–30 OpenRouter foundation

No existing API route was renamed for the redesign.

## Landing conversation
1. What is Cyber AI Tracker? — cinematic hero + security orb.
2. Why care if the site already looks fine? — browser mock with hidden risk signals.
3. What does the scanner inspect? — asymmetric scanner mosaic.
4. Is it an aggressive hacking tool? — authorization/safety boundary visual.
5. How do raw signals become useful? — scroll-scrubbed security core and normalized findings.
6. What can’t the scanner know? — interactive adaptive-question demo.
7. Does AI decide the score? — deterministic score engine visual.
8. Then what is AI for? — minimized-context explanation pipeline.
9. What is the actual product flow? — six-step workflow + benefit grid.
10. Where does everything live? — interactive dashboard showcase.
11. What does improvement look like? — stats and before/after comparison.
12. What happens to data? — 48-hour retention visualization.
13. What can I learn next? — resource cards.
14. Remaining objections — FAQ and final CTA.

## Interaction system
- IntersectionObserver reveal choreography
- mouse/pointer parallax in hero
- continuous ambient orb movement
- animated scan line/risk pins
- interactive security-header constellation
- sticky scroll-scrubbed scanner core
- adaptive mini-questionnaire
- interactive dashboard tabs
- before/after security comparison
- animated FAQ
- `prefers-reduced-motion` fallback

## Dashboard
The authenticated dashboard consumes the existing real `GET /api/websites` response. Metrics are derived from the user’s real website/latest-score records: average score, monitored sites, high-risk sites, medium/low distribution, recent website states and activity. Existing add/delete/scan actions are preserved.

A public `/preview/dashboard` route uses isolated illustrative data so the visual system can be reviewed without authentication. Mock data never replaces a signed-in user’s real assessment data.

## First-pass critique
The initial redesign was visually coherent but still relied too much on entrance reveals and explanatory blocks. It did not fully satisfy the requested “watch the product explain itself” feeling.

## Second-pass improvements
- Added real scroll-linked sticky storytelling to the scanner core.
- Added pointer parallax to the hero rather than a static decorative orb.
- Made security-header nodes selectable and explanatory.
- Added the missing product workflow, benefits, product-principle and resource sections.
- Removed development-day language from Scan, Questionnaire and Analysis pages and gave those flows the same product design language.
- Kept mock marketing values isolated from real authenticated security data.

## Remaining fidelity limitation
The supplied screenshots are compressed raster references, so exact proprietary fonts, original imagery and one-pixel source measurements cannot be recovered. The implementation instead targets their composition, dark/emerald palette, spacing rhythm, card geometry, glow placement and information density while using original Cyber AI Tracker visuals/content.
