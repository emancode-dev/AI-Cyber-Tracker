# Design QA — Originkit and backend-truth update

## Reference inputs

- Emerald SaaS landing-page screenshot supplied by the user.
- Originkit Globe screenshot supplied by the user.
- Exact Originkit Globe component source supplied in the attached text file.

## Source-level review passes

### Pass 1 — truth and interaction

- P0 resolved: the live score movement chart no longer treats different websites as chronological measurements; it uses owner-scoped retained `score_history` points.
- P0 resolved: the dashboard's decorative world map was removed and replaced with a category exposure panel computed from retained deterministic category scores.
- P1 resolved: website editing, notification menu, name/avatar profile updates, and password changes now have working flows.
- P1 resolved: preview-only values remain explicitly demo data; live dashboard values come from the protected summary endpoint.

### Pass 2 — requested visual assets

- P0 resolved: the COBE globe was removed. The supplied Originkit Three.js component is integrated with local world geometry, continuous rotation, markers, and reduced-motion support.
- P1 resolved: the hero uses the full globe and the benefits section uses a clipped semiglobe treatment.
- P1 resolved: the passive-scanner card uses a generated high-resolution cybersecurity exposure illustration, labelled as explanatory rather than live evidence.
- P1 resolved: a subtle emerald binary-rain canvas animates behind the site.

### Pass 3 — motion, surfaces, and responsiveness

- P1 resolved: major headings reveal character by character, supporting copy reveals by word, and existing cards retain cursor tilt and scroll staging.
- P1 resolved: formerly flat benefit blocks are now distinct bordered card surfaces with hover depth.
- P2 resolved: motion honors `prefers-reduced-motion`; generated artwork was converted to a 93 KB WebP asset.
- P2 resolved: new profile, notification, edit-modal, and category-panel layouts include mobile fallbacks.

## Automated gates

- Client ESLint: passed.
- Client production build: passed.
- Server Node syntax checks: passed.
- Server test suite: 16/16 passed.
- Supplied Originkit source: bundled and production-compiled.

## Blocking visual gate

The local preview service started successfully at the expected project endpoint, but the cloud browser's URL security policy blocked access to that local endpoint. The browser policy explicitly prohibited retrying through another automation surface. Therefore a same-viewport prototype screenshot and combined reference/prototype visual comparison could not be captured in this environment.

Final result: blocked

The code/build/test gates pass, but Product Design visual handoff cannot be declared passed until the updated build is opened and compared in an allowed browser. The exact local commands are included in the final PDF and setup guide.
