---
name: opu-design-guardian
description: Apply the ONE PERSON UNICORN canonical design system when creating or changing visible UI, UX, room gameplay, responsive layout, onboarding, copy, motion, audio, iconography, rarity visuals, brand art, or game presentation. Use for every user-facing implementation task in this repository.
---

1. Read repository-root `AGENTS.md` first.
2. Read the relevant product mechanics in `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`.
3. Read the relevant sections of `one-person-unicorn-design-context-v2.2/design.md`.
4. Read `one-person-unicorn-design-context-v2.2/references/visual/INDEX.md` before interpreting supplied visual references.
5. Read `CODEX_REBUILD_BRIEF.md` for current rebuild acceptance criteria.
6. Identify the canonical room interaction verb before implementation. Never replace swipe, merge/assembly, timing, aim/auto-fire, drag/pack, or scratch/reveal with generic button-card interactions for convenience.
7. Preserve the protected-center / stable-periphery attention architecture during active gameplay.
8. Treat the center as a tactile game surface. DOM product chrome frames it; Canvas/WebGL or an equivalent tactile renderer handles interactions that need physical manipulation or choreography.
9. Use progressive disclosure for new mechanics and first-relevance teaching for advanced rules.
10. For ordinary UI icons, enforce the custom hyperrealistic outlined 3D transparent-image contract. Never ship flat icons, emoji, abbreviations, or generic stock 3D as final art.
11. For rarity-bearing assets only, use semantic material progression with Ethereal as the apex.
12. For copy, use mechanical clarity first, then contextual wit/cultural literacy.
13. For meaningful events, classify P0–P4 and choose one lead sensory channel.
14. Recompose mobile and desktop independently while preserving identical deterministic game state.
15. Reject generic dark-dashboard composition even when it is clean or technically correct.
16. Before completion, invoke `$opu-visual-qa` or perform the same screenshot-based checks manually.

If a required final visual/audio asset cannot be generated well in the current environment, invoke `$opu-asset-request` instead of inventing a generic substitute.