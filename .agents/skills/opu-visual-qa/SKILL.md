---
name: opu-visual-qa
description: Visually QA ONE PERSON UNICORN after any frontend, room-gameplay, responsive, onboarding, motion, icon, or presentation change. Use before declaring visible work complete.
---

1. Read `AGENTS.md`, `docs/design/DESIGN.md`, `docs/design/REFERENCES.md`, and the relevant parts of `docs/BUILD.md`.
2. Determine the existing local run command from the repository and start the actual app. Prefer project Playwright tooling for browser automation.
3. Verify at minimum:
   - desktop wide viewport;
   - mobile portrait around 390x844;
   - minimum supported compact viewport around 320x568 when materially different.
4. Exercise the real canonical gesture, not merely an internal state-changing function or accessibility fallback.
5. Capture changed/active states and, when relevant, normal plus busy/urgent states.
6. Fail QA if any are true:
   - center reads as a management/dashboard card grid rather than a tactile game surface;
   - Marketing swipe, Product assembly, Monetization timing, Retention aim, Expansion merge/package, Operations scratch, or Finance decision flow was replaced by generic buttons;
   - routine alerts/modals cover active gameplay;
   - persistent state moves unpredictably;
   - mobile is merely shrunk desktop;
   - placeholder abbreviations, flat icons, emoji, or generic stock art are presented as final custom iconography;
   - Ethereal/iridescence is used as generic UI decoration;
   - hierarchy depends on neon borders/panel repetition instead of scale, space and object behavior;
   - core interaction requires hover, right-click, multi-touch or unavailable precision;
   - text overflows, touch targets are impractical, or safe areas are broken;
   - effects obscure ARR, valuation, Cash, quarter/time, crisis state or causal feedback.
7. Test reduced motion and confirm it changes presentation, never simulation rules.
8. Check meaningful states without relying on color, sound, haptics or motion alone.
9. Compare founder-supplied assets only according to the authority limits in `docs/design/REFERENCES.md`.
10. Fix visible defects and repeat the relevant screenshots/interaction before reporting completion.
11. If final art/audio is missing, invoke `$opu-asset-request` rather than pretending a placeholder is final.
12. Run `npm run validate`; for production-ready integration also run `npm run build`.

A clean screenshot does not pass if the interaction is wrong. A working interaction does not pass if the product reads as generic software.