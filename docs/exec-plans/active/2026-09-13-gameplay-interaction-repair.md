# Founder gameplay interaction repair

Status: implemented and interaction-validated candidate; quantitative balance remains `runtimeReady=false`

Scope: remove hidden manual action locks; make Monetisation a seeded moving-marker timing game; smooth Product and Expansion pointer drag; make Operations scratch continuous and damage-specific; verify Retention and Expansion reachability without changing their canonical ARR causality.

Authority: `solounicorn-master-context/00_START_HERE.md`, `CONTEXT.md`, `GAME_DESIGN.md`, `DESIGN.md`, `SCREENS.md`, `BALANCE.md`, plus `docs/FOUNDER_RUNTIME.md`. Preserve all unrelated dirty-worktree changes.

Implementation boundaries:

- `src/game/founder/engine.ts` owns timing windows, submitted timing resolution, queue eligibility and economic consequences.
- `src/components/founder/ToyRooms.tsx` owns transient pointer position, drop highlighting and scratch canvas coverage only.
- `src/game/founder/save.ts` migrates candidate.4 saves to a candidate.5 replay baseline without resetting the company.
- Candidate tuning remains unvalidated. No balance value is promoted or locked.

Acceptance:

- Consecutive valid manual actions remain available; stale or ineligible semantic actions remain rejected.
- Monetisation displays a non-fixed target and scores the visible marker position against it deterministically.
- Product drag follows pointer/touch smoothly, highlights the active slot and reliably places on release; tap-then-place remains available.
- Operations begins clear, shows only real accumulated damage after opening a maintenance job, and one continuous scratch reveals then applies one repair exactly once.
- A real path reaches customer creation, Retention and Expansion; desktop, 390x844 and 320x568 remain usable.
- Founder tests, typecheck, lint, build, deterministic/smoke/balance validation and browser interaction QA pass, with any remaining balance limitation reported explicitly.

Validation evidence:

- `npm run validate`: passed, including 30 founder integration tests, deterministic and smoke simulation, typecheck, and lint.
- `npm run build`: passed; offline package contains 21 immutable files (`2888185a9bed`).
- `scripts/qa-tactile-founder.mjs`: passed desktop and 390px interaction coverage.
- `scripts/qa-tactile-touch.mjs`: passed native-touch coverage at 320px.
- Balance registry still reports 41 required unresolved values and `runtimeReady=false`; this repair does not promote provisional tuning.
