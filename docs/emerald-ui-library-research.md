# Emerald UI Library Research

Research date: 2026-08-30

## Decision standard

The selected tools must be free to use, work with the existing React/Vite application, preserve source ownership, support the supplied dark-emerald reference, and avoid turning the product into a generic component-library demo. Primary documentation and project repositories were used to verify licensing and intended use.

## Selected stack

### COBE — animated globe

- Role: the hero and global-signal globe.
- Why selected: COBE is a lightweight WebGL globe designed for continuous `requestAnimationFrame` updates, with configurable colors, markers, scale and rotation. It is a closer fit to the supplied reference than the current CSS orb.
- License/source: MIT, [official repository](https://github.com/shuding/cobe) and [official demo](https://cobe.vercel.app/).
- Guardrail: lazy-load the canvas, stop work when it is off-screen, respect reduced motion, and provide a static fallback when WebGL is unavailable.

### GSAP + ScrollTrigger — page choreography

- Role: section reveals, partner/data rails, marker pulses and controlled scroll choreography.
- Why selected: already installed, mature, and suitable for deterministic timelines. GSAP states that commercial use is covered at no charge under its standard license.
- Source: [official license](https://gsap.com/community/standard-license/) and [official pricing statement](https://gsap.com/pricing/).
- Guardrail: one motion language, no long pinned blank sections, no animation that delays reading or primary actions.

### Motion for React — pointer and UI motion

- Role: cursor-reactive tilt cards, hover/focus transitions, compact list motion and gesture-safe micro-interactions.
- Why selected: MIT-licensed, React-native API, production-focused gestures and layout animation.
- Source: [official React documentation](https://motion.dev/docs/react) and [official repository](https://github.com/motiondivision/motion).
- Guardrail: use for component-level interaction only; GSAP remains responsible for page timelines.

### Recharts — dashboard charts

- Role: security-score history, category bars and finding trends.
- Why selected: declarative React components, responsive containers, accessible labeling opportunities and MIT license.
- Source: [official documentation](https://recharts.org/) and [official repository](https://github.com/recharts/recharts).
- Guardrail: charts always have text summaries and do not become the only way to read important values.

### React 19 Simple Maps — world signal map

- Role: subtle world map with animated security-signal markers and activity connections.
- Why selected: the original React Simple Maps package has an outdated React peer range. This maintained ESM fork is intentionally built for React 19+, retains the focused d3-geo/topojson API and is MIT licensed.
- Source: [React 19 package repository](https://github.com/vnedyalk0v/react19-simple-maps) and the [original API documentation](https://www.react-simple-maps.io/docs/getting-started/).
- Guardrail: bundle a small local TopoJSON asset instead of depending on a third-party runtime URL.

### Radix Primitives — accessible overlays and menus

- Role: profile menu, modal/dialog behavior and keyboard-safe overlays.
- Why selected: unstyled, composable and accessibility-focused; it lets the supplied visual direction remain custom.
- Source: [official primitives site](https://www.radix-ui.com/primitives) and [official repository](https://github.com/radix-ui/primitives).

### Phosphor Icons — icon system

- Role: navigation, security categories, account controls and dashboard actions.
- Why selected: consistent family with multiple optical weights and MIT license.
- Source: [official site](https://phosphoricons.com/) and [official React license](https://github.com/phosphor-icons/react/blob/master/LICENSE).

### Sonner — async feedback

- Role: scan, delete, save, rescan and authentication feedback.
- Why selected: focused React toast API, promise states and MIT license.
- Source: [official repository](https://github.com/emilkowalski/sonner).

## Reviewed but not adopted as foundations

- React Bits: useful source of individual interaction ideas and MIT licensed, but adopting multiple effects would add mixed rendering engines and reproduce the current page's visual noise. The final build uses one purposeful cursor-reactive card treatment instead. [Official site](https://reactbits.dev/) and [repository](https://github.com/DavidHDev/react-bits).
- shadcn/ui: excellent open-code, MIT-licensed components, but installing a second full visual system is unnecessary in this existing plain-CSS application. Radix is used only where its accessibility behavior is valuable. [Official repository](https://github.com/shadcn-ui/ui).
- Globe.GL / full Three.js scene: powerful but materially heavier than COBE for the required single globe. [Official repository](https://github.com/vasturiano/globe.gl).
- AI-generated globe imagery: rejected. It cannot provide the continuous, data-driven motion or cursor response required by the reference.

## Security and Days 31–40 evidence

- OpenRouter structured outputs support JSON Schema response formats; the server still validates every response and keeps a fallback report because free-model support can vary. [Official OpenRouter documentation](https://openrouter.ai/docs/guides/features/structured-outputs).
- Supabase recommends RLS on exposed tables; new `ai_reports`, `score_history` and account-data access paths receive explicit ownership policies. [Official RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Supabase Cron uses `pg_cron` for recurring database work and is appropriate for expired assessment cleanup. [Official Cron documentation](https://supabase.com/docs/guides/cron).
- Server routes keep object-level ownership checks because RLS is defense in depth, not a replacement for API authorization. [OWASP IDOR prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).
- Scanner URL handling retains its SSRF-oriented validation and redirect checks. [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Final architecture rule

The reference determines composition, density, palette, spacing and motion. The CyberTracker product determines the copy, data and actions. No section exists only to imitate a screenshot; every section must explain, demonstrate or operate part of the assessment flow.
