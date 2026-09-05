---
name: opu-visual-qa
description: Visually QA ONE PERSON UNICORN UI after frontend/gameplay changes. Use when a screen, component, responsive layout, onboarding flow, animation, visual state, or icon integration has been implemented and needs browser verification before completion.
---

1. Determine the local run command from the repo; do not invent a new framework command if one already exists.
2. Start the app and use the available browser automation tool (prefer Playwright skill/CLI; use MCP if configured).
3. Verify at minimum:
   - desktop wide viewport;
   - mobile portrait viewport around 390×844;
   - narrow minimum supported viewport if materially different.
4. Capture screenshots of the changed screen/state.
5. Check:
   - center gameplay is not obstructed by ordinary alerts/modals;
   - persistent metrics/navigation remain predictable;
   - hierarchy remains readable under motion/chaos;
   - custom 3D icons are correctly sized and backgrounds are transparent;
   - no emoji/flat icon fallback appeared;
   - text does not overflow;
   - interaction remains usable without hover;
   - reduced-motion mode preserves information;
   - focus/keyboard/touch behavior is sensible;
   - mobile is recomposed, not merely shrunk.
6. Fix visible defects before reporting completion.
7. If a missing final asset blocks QA, create an asset request rather than inserting a generic substitute.
