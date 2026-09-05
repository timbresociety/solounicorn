---
name: opu-build-guardian
description: Apply the ONE PERSON UNICORN build and integration contract for architecture, PWA, responsive implementation, state boundaries, framework/tooling, performance, persistence, infra, and broad refactors. Use whenever code changes can affect how product systems are wired or shipped.
---

1. Read repository-root `AGENTS.md`.
2. Read `docs/BUILD.md` and the relevant sections of `ARCHITECTURE.md`.
3. If the change consumes product mechanics, read only the relevant sections of `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`.
4. If the change consumes numeric economy, inspect `docs/balance/BALANCE_SPEC_V2.md` and `balance/v2/registry.json`; never invent unresolved values.
5. Preserve dependency direction: product -> balance -> deterministic simulation -> semantic adapter -> presentation.
6. Keep economic truth outside React, Canvas, animation, viewport and network callbacks.
7. Preserve replay identity and seeded randomness. Viewport, DPR, FPS, reduced motion and network availability must not alter economic outcomes.
8. Preserve responsive PWA support. Mobile is recomposed, not shrunk desktop. Do not break manifest/service-worker/install behavior without an explicit migration reason.
9. Prefer the repository's current stack and scripts. Do not introduce a framework/runtime/large dependency because it is familiar.
10. When proposing a large dependency, justify the user-facing capability, mobile/performance cost, maintenance cost and why the existing stack is insufficient.
11. Do not add runtime 3D merely to render 3D-looking bitmap icons.
12. Use explicit adapters/fixtures for unresolved balance. Never bury calibration constants in UI code.
13. For cross-domain changes, create/update an exec plan under `docs/exec-plans/active/` and invoke the relevant domain skill(s).
14. Run `npm run validate`. For production-ready integration also run `npm run build`.
15. If the change is visible, also invoke `$opu-design-guardian` and `$opu-visual-qa`.

A successful build is not proof that product, simulation, responsive or interaction contracts were preserved.