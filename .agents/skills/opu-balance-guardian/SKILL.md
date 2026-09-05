---
name: opu-balance-guardian
description: Use for ONE PERSON UNICORN quantitative balance, economic formulas, skill costs/effects, agent economics, Growth Multiples, Finance terms, Complexity/Rot tuning, Strategies, Relics, or simulation calibration.
---

1. Read `AGENTS.md`, `ARCHITECTURE.md`, relevant canonical sections, `docs/balance/BALANCE_SPEC_V2.md`, and `balance/v2/registry.json`.
2. Identify every registry key the task touches before changing code.
3. Never treat canonical values marked provisional, calibration, illustrative, calibration-eligible, or not-yet-locked as production truth.
4. Keep economic formulas and values outside React/presentation code.
5. Use seeded deterministic simulation only. Never use live GenAI or unseeded randomness for economic outcomes.
6. A balance agent may move a value from `missing/calibration/provisional` to `candidate` only with reproducible quantitative evidence.
7. Do not set `status: locked` unless the user's current request explicitly authorizes locking that balance.
8. Candidate evidence must state run count, seed strategy, build/mandate mix, before/after metrics, exploit checks, and known regressions.
9. Preserve canonical causality: Marketing/Product/Retention/Operations/Finance cannot be made direct ARR generators contrary to product canon.
10. Run `npm run balance:validate`, `npm run sim:smoke`, `npm run sim:determinism`, and the relevant full simulator/regression suite.
11. Run `npm run balance:lock-check` only when the task claims production balance is fully locked.
12. If a required quantity remains unknown, leave it unresolved and expose the dependency rather than inventing a plausible number.
