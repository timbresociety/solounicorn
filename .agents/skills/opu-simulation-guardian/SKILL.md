---
name: opu-simulation-guardian
description: Use when implementing or refactoring ONE PERSON UNICORN deterministic simulation, state transitions, seeded randomness, replayability, economic invariants, cohorts, queues, agents, Complexity, Rot, Finance, or quarter resolution.
---

1. Read `AGENTS.md`, `ARCHITECTURE.md`, the relevant canonical product sections, and `docs/balance/BALANCE_SPEC_V2.md`.
2. Check every quantitative dependency in `balance/v2/registry.json`.
3. Simulation must run without React, DOM, Canvas, browser timing, network access, or live GenAI.
4. Never use `Math.random()`. Random economic resolution must come from an explicit seed.
5. Keep replay identity explicit: seed + starting state + action log + balance version + content version.
6. Presentation emits semantic actions; simulation resolves consequences. Do not let UI handlers directly mutate ARR, Cash, Valuation, debt, ownership, Rot, or economic rewards.
7. Do not bury numeric balance constants in simulation source. Locked values belong in runtime balance; unresolved values are explicit calibration inputs.
8. Add or update invariants for every accounting relationship touched.
9. Add deterministic regression coverage for every new stochastic path.
10. Run `npm run sim:smoke`, `npm run sim:determinism`, `npm run balance:validate`, and `npm run validate`.
11. Do not claim balance correctness from smoke tests. Distributional balance requires the quantitative simulator and human playtests.
