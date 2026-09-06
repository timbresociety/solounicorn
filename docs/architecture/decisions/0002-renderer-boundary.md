# ADR 0002: React shell and renderer boundary

- Status: accepted
- Date: 2026-09-06

## Decision

React and DOM remain the shell and current tactile-room renderer. Phaser, Canvas, or WebGL is not added for the golden slice because swipe, logical drag/drop, pricing timing, HUD, quarter accounting, and accessibility are fully expressible with the current stack.

Room adapters may interpret pointer, touch, mouse, trackpad, or keyboard input, but they must dispatch the same semantic action. Rendering consumes immutable snapshots and domain events. It never mutates economy state.

## Consequences

- Marketing records a decision lane, not a drag path.
- Product records component and logical slot IDs, not screen coordinates.
- Monetization records the authoritative simulation tick, not a CSS cursor position.
- A future renderer requires a separate ADR covering bundle size, accessibility, DPR, lifecycle, reduced motion, and PWA costs.
