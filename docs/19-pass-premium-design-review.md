# 19-Pass Premium Frontend Review — Cyber AI Tracker

This review is the design QA loop used for the violet motion-first rebuild. Each pass had to identify a gap, apply a change, and define what would count as acceptable before moving on.

## Pass 01 — Reference composition
**Critique:** Previous page matched color direction more than composition; visual masses were too small and centered-card-heavy.
**Change:** Rebuilt the page around editorial splits, full-width scenes, asymmetric mosaics, a giant visual core, and a large product-dashboard reveal.
**Acceptance:** Large visual moments now alternate with dense/sparse sections instead of repeating `heading → paragraph → card`.

## Pass 02 — Product palette
**Critique:** Emerald felt generic/cyber-template and did not match the desired owned visual identity.
**Change:** Shifted to near-black + violet/lilac/fuchsia accents using CSS tokens. Green remains reserved for semantic states where needed.
**Acceptance:** Purple is the brand accent across landing and dashboard without sacrificing risk-state semantics.

## Pass 03 — Background atmosphere
**Critique:** Dead black gaps made the page feel unfinished.
**Change:** Added low-contrast binary number rainfall, perspective grid, noise, and slow violet ambient fields.
**Acceptance:** Empty space remains spacious but visually alive.

## Pass 04 — Hero art direction
**Critique:** Previous core graphic was too small and decorative.
**Change:** Made the security core a primary hero object with mesh geometry, orbit rings, labels, particles, lighting and parallax.
**Acceptance:** Hero still reads clearly with copy hidden; visual alone communicates a security signal system.

## Pass 05 — Scroll experience
**Critique:** Previous implementation mostly changed sections when scrolling rather than transforming them.
**Change:** Added Lenis smooth scrolling + GSAP ScrollTrigger for hero transition, scrubbed stages, pinning, score build, AI minimization and dashboard reveal.
**Acceptance:** Scroll creates changes inside scenes; it is not just a trigger for fade-ins.

## Pass 06 — Hidden-risk story
**Critique:** “Everything looks normal” was a plain card.
**Change:** Rebuilt as a browser/site mockup with scanning line and individually revealed risk pins.
**Acceptance:** Visitor can understand “looks fine ≠ configured safely” without reading the supporting paragraph.

## Pass 07 — Scanner mosaic
**Critique:** Feature cards lacked the density and internal art direction of the reference.
**Change:** Added large core visual, animated HTTP path, interactive header constellation and dense technical micro-labels.
**Acceptance:** Each card contains a real visual explanation, not a generic icon.

## Pass 08 — Safety boundary
**Critique:** Safety copy was strong but the visual did not teach the boundary.
**Change:** Built an animated boundary diagram separating blocked aggressive actions from permitted passive observations.
**Acceptance:** “Passive only” is visible before reading the list.

## Pass 09 — Signature security core
**Critique:** Missing the reference’s giant memorable orb moment.
**Change:** Added a 320vh pinned scanner-core scene with a large globe and progressive transport/header/cookie/context layers.
**Acceptance:** This is now the signature mid-page visual and one of the page’s largest objects.

## Pass 10 — Context merge
**Critique:** Questionnaire appeared before the visitor visually understood why owner context is needed.
**Change:** Added two evidence streams merging into a context engine before the interactive branching demo.
**Acceptance:** Public evidence vs owner-only context is visually obvious.

## Pass 11 — Deterministic score
**Critique:** Previous score section jumped straight to 78.
**Change:** Added individual score inputs, a pure-JS rule-engine object, animated gauge and category bars.
**Acceptance:** The visitor watches the score being built and sees that AI is not the scoring engine.

## Pass 12 — AI role and minimization
**Critique:** AI explanation/data minimization was a major missing scene.
**Change:** Added a payload stripping sequence: sensitive/unnecessary fields are removed, minimized evidence remains, and a roadmap emerges.
**Acceptance:** AI role is visually distinct from scanning/scoring and privacy design is demonstrated rather than asserted.

## Pass 13 — Product-loop pacing
**Critique:** Benefits and workflow were previously too card-heavy.
**Change:** Rebuilt workflow as an editorial six-step rail and benefits as a line-based information list with a large editorial lead.
**Acceptance:** The section changes rhythm and avoids another generic card grid.

## Pass 14 — Dashboard reveal
**Critique:** Previous dashboard was too small and wireframe-like.
**Change:** Built a large perspective reveal with dense metrics, chart, risk ring, scan table and interactive tabs.
**Acceptance:** Dashboard reads as the payoff of the landing story and carries the same visual system.

## Pass 15 — Proof and improvement
**Critique:** Mock stats floated in empty space and benefits lacked a tangible before/after moment.
**Change:** Added count-up metrics plus an interactive before/after score and resolved-finding story.
**Acceptance:** Visitors see improvement as a state change, not just a marketing claim.

## Pass 16 — Privacy lifecycle
**Critique:** Privacy was a text card.
**Change:** Added a 0h → 24h → 48h visual retention track with assessment data moving toward deletion.
**Acceptance:** Retention is understandable in one glance.

## Pass 17 — Resources / FAQ / final conversion
**Critique:** Lower page lost visual density and became bare.
**Change:** Added visual editorial resource cards, two-column numbered FAQ, accordion motion and a high-impact final violet CTA.
**Acceptance:** Visual quality does not collapse after the dashboard reveal.

## Pass 18 — Authenticated dashboard
**Critique:** Landing improved faster than the actual product shell.
**Change:** Restyled the live dashboard to violet tokens and added score trajectory, risk overview, priority watchlist, portfolio profile and signal-orbit panels while retaining real API data.
**Acceptance:** `/dashboard` remains functional and no mock security finding is mixed into live user results.

## Pass 19 — Accessibility, responsiveness and performance
**Critique:** Motion-heavy work can easily become nauseating, slow or unusable on mobile.
**Change:** Added `prefers-reduced-motion` fallbacks, native scroll semantics, responsive unpinning, lower visual density on small screens, keyboard-accessible buttons, and transform/opacity-first animation choices.
**Acceptance:** Core content remains readable and usable without motion; mobile does not depend on hover or pinned scenes.

## Library research decision
- **GSAP + ScrollTrigger:** selected for pinned/scrubbed sequences. GSAP 3.13+ and plugins are available through npm.
- **Lenis:** selected for smooth scroll because it is MIT-licensed, lightweight and documents GSAP/ScrollTrigger integration.
- **Origin UI:** used as a reference for accessible control/accordion composition; components are open-source copy/paste React UI.
- **Magic UI / React Bits:** researched for animation patterns. We borrowed interaction ideas rather than pulling in large component stacks; the project keeps bespoke Cyber AI visuals.
- **No full Originkit template import:** intentionally avoided because replacing the existing Vite app would create duplicate routing/dependencies and risk breaking Days 1–30 functionality.
