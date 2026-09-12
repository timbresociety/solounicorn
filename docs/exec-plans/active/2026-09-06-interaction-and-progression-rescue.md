# Interaction and Progression Rescue

## Objective

Restore a coherent, smooth golden-slice loop after quarter close: each of the seven canonical rooms remains directly playable, and Investment exposes a navigable per-function skill tree rather than one hard-coded Marketing purchase.

## Scope and boundaries

- Preserve deterministic simulation and semantic action ownership.
- Use the existing calibration-only golden content. This work must not claim the unresolved 448-rank production catalogue or locked balance.
- Keep all seven canonical gestures intact. Improve presentation input mapping only where it is causing reliability or continuity failures.
- Do not change economic constants, balance registry status, or unrelated UI styling.

## Acceptance checks

1. Quarter close progresses through Results, What Changed, Next Quarter Strategy, and Invest without conflating permanent skills with global situational decisions.
2. What Changed and Strategy choices are resolved only through deterministic semantic actions, expose eligibility and duration/tradeoffs, and never mutate economic state in React.
3. Quarter close shows all seven function trees, four branch entries each, rank state, cash cost, and deterministic purchase feedback.
4. Any eligible golden rank can be purchased during the Invest phase; purchases do not have an arbitrary count cap.
5. Active-room input maps cleanly to semantic actions and gives immediate, legible feedback without double dispatches or dead-end routing.
6. Desktop, 390x844, and 320x568 preserve usable tree navigation and each canonical gesture.
7. Determinism, replay, validation, build, and visual interaction QA pass.

## Work log

- 2026-09-06: Created after inspection identified that the simulation has all 28 golden calibration skill entries and `SKILL_RANK_PURCHASED`, while the quarter-close UI hard-codes only `skill.marketing.craft.1`.
- 2026-09-06: Added the missing macro-layer scope after confirming that Strategies, Relics, and their semantic actions existed in the engine but were not staged or rendered at quarter close.
