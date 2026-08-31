# Premium UI Library Research Notes

The final stack deliberately prioritizes a small set of tools rather than mixing many visual runtimes.

## Adopted
### GSAP + ScrollTrigger
Use for pinned scenes, scrubbed scroll timelines, score construction, hero transition, AI context stripping and dashboard entrance.

### Lenis
Use for smooth wheel scrolling while keeping the page’s native scroll model. It is integrated with ScrollTrigger updates rather than replacing product navigation.

## Pattern sources, not runtime dependencies
### Origin UI
Useful patterns: accordion interaction, compact navigation controls, accessible buttons and low-overhead copy/paste primitives.

### Magic UI
Useful patterns: animated borders, beams, grid/ripple thinking, box/text reveals. Effects are reauthored in the project’s own CSS/React visual language.

### React Bits
Useful patterns: animated backgrounds, text entrances, cursor-reactive surfaces and visual distortion. We avoid importing a broad library when a small bespoke implementation is sufficient.

## Why not use everything
More animation libraries do not automatically create a more premium interface. Multiple animation schedulers and styling systems would increase bundle size, conflict risk, and visual inconsistency. The chosen runtime is GSAP + Lenis; the rest informs component design.
