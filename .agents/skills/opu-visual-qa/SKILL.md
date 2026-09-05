---
name: opu-visual-qa
description: Visually QA ONE PERSON UNICORN after any frontend, room-gameplay, responsive, onboarding, motion, icon, or presentation change. Use before declaring visible work complete.
---

1. Determine the existing local run command from the repository.
2. Start the app and use browser automation when available, preferring Playwright.
3. Verify at minimum:
   - desktop wide viewport;
   - mobile portrait around 390×844;
   - minimum supported narrow viewport when materially different.
4. Capture screenshots of the changed state and at least one active gameplay state.
5. Compare the result to `AGENTS.md`, `CODEX_REBUILD_BRIEF.md`, the relevant sections of `one-person-unicorn-design-context-v2.2/design.md`, and any canonical whole-screen screenshot present in the repository.
6. Fail QA if any of these are true:
   - the center reads as a management/dashboard card layout rather than a tactile game surface;
   - the canonical room verb was reduced to generic click buttons;
   - ordinary alerts/modals obstruct active gameplay;
   - persistent state shifts unpredictably;
   - mobile is merely a shrunk desktop layout;
   - placeholder abbreviations, flat icons, emoji, or generic stock art are presented as final custom 3D iconography;
   - visual hierarchy depends on neon borders, excessive panels, or colored text instead of scale/space/object behavior;
   - interaction requires hover or a keyboard shortcut;
   - text overflows or touch targets become impractical.
7. Exercise the actual gesture path for the room, not just the state-changing function behind it.
8. Test reduced-motion behavior and confirm it changes presentation, not rules.
9. Fix visible defects and repeat screenshots before reporting completion.
10. If final art is missing, invoke `$opu-asset-request` and keep the slot explicit rather than lowering the visual bar.