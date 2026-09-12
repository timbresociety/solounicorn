# Context v4 full product and repository rebuild

Status: PROPOSED — planning only; no production code or existing canon has been removed.

## Goal

Replace the current product, interaction, content, balance, design, and engineering baseline with the canonical source pack at:

`/Users/deepsheth/Downloads/solounicorn-context-v4`

The finished product is a responsive, installable React/TypeScript PWA: a deterministic one-person AI-company roguelike whose score is Valuation, operating achievement is ARR, and spendable currency is Cash. It progresses from manual work through autonomy, keeps one active work function at a time, and permits continuation after the $1B milestone.

## Authority and interpretation

1. The user's request makes the v4 pack the governing product source for this rebuild.
2. Within that pack, `CONTEXT.md`, `BALANCE.md`, `DESIGN.md`, `GAME_DESIGN.md`, `CONTENT.md`, `ENGINEERING.md`, `SCREENS.md`, `DECISIONS.json`, and the three `data/*.json` files own their named domains.
3. Pack execution guidance (`AGENTS.md`, `TERMINAL_AGENT.md`, templates, and the delivery graph) is planning input, not a replacement for platform safety instructions or an assertion that the live repository is complete.
4. Confirmed decisions are implemented as requirements. Recovered direction and working defaults are implemented as explicitly labeled review-build defaults. Optional/unverified material, including the $1T ending, remains disabled.
5. The current root `AGENTS.md`, V2 canon, balance registry, legacy design docs, and existing code cease to be product authority after adoption. They remain migration evidence until deliberately removed or archived in an approved implementation task.

## Current-state assessment

The repository already has a React/Vinext PWA, a headless deterministic engine, semantic actions, replay/save infrastructure, and an early cockpit/room presentation. It is not a clean slate and contains unrelated dirty changes. Rebuild work must begin from a protected baseline, not overwrite those changes. The v4 pack itself confirms that it is not a completed engine, final asset library, full 448-rank catalogue, or pre-balanced economy.

## Non-negotiable rebuild contracts

- Customer pipeline: Marketing → Demand; Product → Activation; Monetisation → New Customer ARR; Retention → prevents Churn; Expansion → existing-account ARR; Operations → reliability/capacity/cash. Finance manages cash, debt, equity and investments, never a mandatory motor-skill room.
- Exact, deterministic ledgers: ARR bridge, cash/debt/ownership reconciliation, seeded event ordering, replay identity, fixed units and no `Math.random()` or presentation-owned economic state.
- Seven function identities: six tactile interactions (swipe, assemble, time tap, aim/auto-fire, merge/package, scratch/reveal) plus a deliberate Finance management surface.
- Protected central work object, calm stable perimeter, non-modal alert aggregation, independently composed touch-first mobile UI.
- Skill trees, strategies, relics, and Founder History stay separate; automation uses the same work resolver as the founder.
- PWA/offline, pause/save/recovery, accessibility, reduced motion, and explicit phase permissions are product features, not polish.

## Migration strategy

Do not delete the repository up front. Create a versioned v4 domain layer beside the legacy V2 implementation, prove parity at each boundary, switch the app only after an increment passes its acceptance gates, then remove superseded V2 code and documents in a dedicated, reviewable cleanup change. This protects the dirty worktree and avoids losing replay, PWA, or test infrastructure that remains useful.

## Delivery sequence

### M0 — Adopt v4 and establish a safe seam

1. Snapshot the live checkout, identify owners for every dirty file, and establish a rebuild branch/worktree before changes.
2. Copy the source pack unchanged into a repository-owned canonical location, verify its manifest/checker, and add one short root routing bridge. Do not duplicate or paraphrase its authorities into competing docs.
3. Write a V2-to-v4 gap map for product rules, architecture, actions/events, saves/replays, PWA, visual surfaces, content, tests, and assets. Classify each existing module as retain, adapt, replace, or delete-later.
4. Define v4 versioned contracts for state, semantic actions, events/reasons, effects, content, candidate balance profiles, save/replay headers, and phase permissions.
5. Update repository validation so it checks v4 contracts without pretending the v4 parameter inventory is production runtime balance.

Exit evidence: source integrity report; file-level migration map; no unclear ownership of existing dirty files; contract schemas and compatibility decision; real commands recorded.

### M1 — First complete playable quarter

1. Build the fixed-unit, seeded customer/cohort engine with stable transaction IDs and the required ARR/cash bridges.
2. Implement ordered simulation time, active/pause/settlement/allocation/failure/unicorn permissions, replay/save parity, and recovery for incompatible or corrupt saves.
3. Deliver the smallest causal loop: Marketing opportunity → Product recipe → Monetisation conversion → Retention threat → Expansion opportunity, with one Operations obligation and Finance cash purchase.
4. Implement real Desktop + mobile interaction surfaces for the six physical verbs and Finance inspection/commit, all producing the same semantic action contracts.
5. Deliver setup, active cockpit, quarter result, allocation, failure, and unicorn-continuation surface scaffolding with authored fallback content.

Exit evidence: one recorded/replayed quarter; exact ledger and boundary tests; actual pointer gesture recordings at 320×568, 390×844, 844×390, 768×1024, and 1440×900; save/background/cancel/double-submit tests.

### M2 — Automation and meaningful build construction

1. Add agents that resolve the same underlying jobs as the founder, including visible costs, capacity, reliability, and automation causality.
2. Add Operations capacity, strain, rot, remediation, and clearly disclosed high-variance optimization bets. Demonstrate both sustainable and overloaded configurations.
3. Add a curated, enabled progression slice: one complete four-rank subbranch in each enabled branch category, two distinct relics, and two strategies. Register effects centrally and keep unimplemented blueprint ranks/triggers disabled.
4. Establish scoped candidate balance profiles, deterministic policy sweeps, declared scenarios/horizons, exploit checks, and human-playtest scripts. Do not claim the 448-slot horizon is authored or balanced.

Exit evidence: founder/agent parity; manual-versus-automation comparison; overload/recovery scenario; build-choice replay set; candidate-profile report with known uncertainty.

### M3 — Replayable run to and beyond unicorn

1. Complete all seven function identities and their queues, offers, risks, progression gates, and causal feedback.
2. Implement Finance schedules: affordability, recurring costs, debt draw/repayment/default, simple equity/dilution, and optional instruments only when their scheduling rules exist.
3. Add Founder History, progressive unlocks, curated build paths, contextual deterministic event envelopes, authored/offline narrative fallbacks, and failure attribution.
4. Build full-run and censored-run harnesses, preserve version-pinned save migrations, and validate no enabled content refers to an unimplemented effect.

Exit evidence: reproducible run reports across distinct build families; cash/debt/equity and cohort reconciliation; full-loop interaction walkthrough; transparent remaining content/balance gaps.

### M4 — Release candidate

1. Select and explicitly declare the enabled release catalogue subset. Expand only content whose effects, prerequisites, localization context, and balance profile are complete.
2. Produce original final asset families from the v4 briefs, with a transparent fixture/final-asset boundary. Do not copy reference executions or ship generated examples as final art.
3. Finish PWA/offline/update recovery, accessibility, audio/haptics controls, reduced motion, performance under a declared late-run load, and device/browser testing.
4. Run broad balance experiments against five viable build-family targets, report policy, seed coverage, censored outcomes, exploits and human playtest findings separately from owner acceptance.

Exit evidence: release manifest; source/asset provenance; complete validation/build and device evidence; balance report; named limitations; owner-acceptance status kept separate from engineering completion.

## Workstreams and dependency order

| Workstream | Starts | Depends on | Owns |
|---|---:|---|---|
| Canon adoption and migration map | M0 | protected checkout | source bridge, V2 disposition |
| Contracts and deterministic engine | M0/M1 | canon adoption | units, state/actions/events, scheduler, replay/save |
| Candidate balance | M1 | engine interfaces | scoped profiles, invariants, simulations |
| Content | M1 | effect/action contracts | IDs, recipes, offers, relics, strategies, tutorials |
| Gameplay presentation | M1 | semantic contracts | rooms, cockpit, responsive/a11y feedback |
| Automation and Operations | M2 | base work resolver | agents, capacity, strain, rot |
| Finance depth | M1/M3 | exact ledgers and phases | purchases, schedules, debt/equity |
| Release hardening | M4 | complete enabled scope | final assets, PWA, performance, QA |

## Validation gates

Every increment: `npm run validate`.

Integration increments: `npm run build`, deterministic replay/save tests, balance/profile validation, and source-pack integrity check.

Visible increments: actual gesture exercise, screenshot/recording review at the five v4 fixtures, pressure/failure states, reduced-motion, safe-area, overflow, touch-target, and accessibility review.

Economic increments: fixed-unit ledger invariants, transaction idempotence, same-input replay, exact deadline ordering, cash/debt/equity and cohort reconciliation, candidate-profile simulation evidence. Balance claims must state profile version, seeds, policy, horizon, scenario coverage, sample size, censoring, exploits, and human-playtest status.

## Explicit exclusions until separately authorized

- Immediate deletion of current code, docs, or dirty changes.
- The optional $1T ending, emergency post-miss debt rescue, and unimplemented financing instruments.
- Cloud accounts, sync, leaderboards, telemetry, live GenAI dependency, or any network requirement for core play.
- Treating reference images, generated examples, unapproved defaults, or 448 blueprint slots as finished/licensed/shippable content.
- Declaring visual direction, enjoyment, balance, or owner acceptance proved solely by builds, simulations, or screenshots.

## First implementation task after plan approval

Execute M0/T00 only: preserve the dirty tree, import and integrity-check the source pack, add the root routing bridge, and produce the retain/adapt/replace/delete-later map. No mechanics or presentation rewrite occurs in that task.

## Completion record

Created: 2026-09-07

Repository changes made by this planning task: this plan only.
