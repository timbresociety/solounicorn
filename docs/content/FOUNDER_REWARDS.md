# Founder reward catalogue, candidate 12

S12 implementation supplement to the [owner decisions](../exec-plans/active/2026-09-16-founder-revamp/DECISIONS.md). The root founder runtime is authoritative. Older V2 catalogue breadth and starter executable instructions do not override this bounded slice.

## Four build hypotheses

| Family | Run relics | Consumable | Actual consequence |
|---|---|---|---|
| Default alive | Ramen budget; Clean terms | Cancel the offsite | Lower base/unit overhead; earlier new invoice dates; one active month of overhead savings |
| Ship and sell | Signal ledger; It works on my machine | Read the diff | Lower acquisition stakes; improved shipped product fit; one active month of that fit benefit |
| Customers stay | Founder office hours; One backend, many upsells | Customer firebreak | Longer resolved-problem care; lower addon service overhead; resolve one selected live problem |
| Small team of agents | Leave a paper trail; Committed compute | Fresh context window | Slower routine context rot; lower compute cost; clear one selected function's rot |

These are playable packages, not demonstrated winning strategies. Every family has two relics and one consumable. Funding still creates no ARR; Product still creates trials; Retention only protects existing customers. No reward directly multiplies valuation or introduces rank-zero action randomness.

## Source and effect contracts

- `src/game/founder/rewards.ts`: stable item/effect IDs, family, target, trigger, units, plain effect sentence, duration, charge/stacking rule, downside, visible cue, locale and localization context. Original durable founder wording, no live generation or external content API.
- `src/game/founder/profile.ts`: all candidate magnitudes and caps. Reuses the legacy 35% acquisition saving, 50% shorter new collection delay, 25% base/unit overhead saving, 12 fit points and two-month care. New addon service, compute and routine rot reductions are **candidate 25%** reductions with narrowly specified targets. No production balance is locked.
- `src/game/founder/engine.ts`: settlement, actual expenses/output/rot, shared compute and Operations ticket upkeep, finite jobs and phase checks. UI consumes these selectors and dispatches semantic commands.
- The legacy registry's `relics.effectBudgets`, `relics.eligibilityGraph` and `strategies.effectModel` remain unresolved. S12 neither claims to finish that historical catalogue nor promotes its registry values. Separate timed Strategies are outside this packet.

## Selection and use

A quarter offers at most three seeded, relevant choices. Installed ranks bias family order; distinct families are preferred. The offer never contains two items with the same effect. Owned relics, active equivalent effects, full-charge items and irrelevant function rewards are excluded. The exact choices are persisted, including older saved offers. At most one choice applies, at no extra cash price; that choice consumes the quarter opportunity.

Relics are unique and last this run. Each consumable draft grants one charge, with a candidate cap of three held charges per item for new acquisition. Old saves with more charges retain them. Timed consumables last 600 active ticks, cannot refresh or stack an already active equivalent effect, and pause during draft/pause. Their effects end at `until`, including forecasted bill accrual. A relic and its matching legacy upgrade or temporary effect never multiply together. Permanent-equivalent effects prevent redundant consumable use.

Firebreak explicitly targets a live account/problem; stale problems and already churned customers cannot consume a charge. Context reset explicitly targets a function with rot; it neither removes strain nor cancels compute bills. Failed/paused/out-of-phase or empty uses are rejected without consuming anything. Charges, timers and relic ownership survive save/reload and replay. At an exhausted pool, skip remains available and leads to the normal paused Continue state.

## History and endings

A first valid unicorn sets its win timestamp once. Later continuation quarters cannot award another win. A quarter-boundary victory retains its reward draft for Continue. Failed runs before unicorn award no new permanent advantage; failure after a previous unicorn does not erase its earned success.

History is local and separate from run inventory and skill purchases. Pure helpers deduplicate the existing seed/win-timestamp identity, accept the old wins-array format and retry safely after storage failure. Each recorded win retains the existing candidate $150 starting-cash advantage, with no hidden cap or difficulty normalization. Starting a new company saves history first and replaces both local run slots, including the setup state; no user identity/background is inferred. Legacy duplicate entries are deduplicated, not counted as extra wins.

## Evidence and pending gates

`artifacts/qa/founder-revamp/S12/catalogue.json` exports all contracts. `founder-content.test.ts` covers every effect, all four families, fees, stacking, targeting, depletion, timer expiry, forecast expiry, migration, replay, depleted draft pools, continuation and one-time history. It includes synthetic seed 1212 paired states, 120 draft seeds and diagnostic funded unicorn states. They are not earned human runs. The root policy sweep separately exercises bootstrap/debt seeds 19, 77 and 84022; VC survives its S11 boundary suite.

Content QA checks clear effect sentences, sourced candidate numbers, explicit limitations, original naming and stable localization context. Browser/device/gesture/visual acceptance is deliberately pending. S13 owns further authored visual payoff; S15 must measure build viability, degenerate strategies, successful pacing and comprehension. Root build and headless results are recorded in the S12 validation artifact; no deployment is implied.
