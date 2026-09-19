# S10: six-function automation integration

Status: implemented and headless-validated; visual/device acceptance and the packet's separate Sol review remain pending. No browser, computer-use, publication or deployment was performed. S11 has not started.

## Implemented boundary

- The scheduler uses the same eligibility projection as the HUD: installed capability, enabled state, deployment, founder ownership, finite input, downstream queue capacity, ticket supply and attempt affordability. Monetisation commitment remains cash-neutral; its price preview now uses the actual Craft-limited batch.
- Product fills persisted recipe slots, verifies the recipe, then ships through the same engine work resolver as the founder. Full-recipe work time is distributed over the ingredient steps plus test and ship. There is no autonomous lead-to-trial shortcut.
- Demand, pricing, customer problem response, merging/serving and whole-ticket settlement retain their real finite inputs and shared outcome resolvers. All 96 ranks are installed and replayed by the integration test.
- The scheduler snapshots lead/trial identities before running rooms. Newly created downstream work cannot run until the next tick. Credit is a fractional step in [0, 1); blocked/disabled/installing rooms clear it rather than banking effort.
- Opening Product/Expansion/Operations transfers current agent work to the founder. Opening Demand/Monetisation pauses that room's agents. Retention agents can work on other unreserved problems. Leaving hands work to installed, enabled agents; enabling/installing agents offscreen also releases old founder reservations. Partial recipe/board/ticket contents persist.
- Serving an Expansion slot allows a later new board, while replaying the old Serve remains stale. New customer problems reopen the account's care lifecycle. A firebreak clears both the threat and associated problem. Splitting a cohort gives the finite remainder a fresh ID so the consumed portion's terminal job cannot strand it.
- Agent-triggered terminal failure stops the tick before monthly/quarter reward or victory logic. Purchased-Luck Product rework keeps its verified recipe available for another attempt and explains the failed output in the event log.

## Pressure and cost contract (candidate tuning)

Existing load is the sum of each function's scaled unit load, enabled automation coordination load, lane-pair overhead and incident load. Operations scale/craft determine coordination capacity.

- Per-tick strain change: `(load - capacity) / 600`, floored at zero. Capacity is the explicit threshold: below it existing strain drains; above it strain accumulates.
- Overload: `max(0, load / capacity - 1) + strain / capacity`.
- Coordination pace: `1 / (1 + 0.35 * overload²)`.
- S10 per-function agent pace: `coordination pace / (1 + 2 * function rot)`. Rot 1 triples that routine's duration. This is a candidate coefficient, not locked balance.
- Rot rises only on performed agent steps, using the existing base/rank rates and overload factor. Product normalizes by recipe step count. Waiting does not earn output or new execution rot.
- Rank-zero non-ticket work still has no error lottery. Purchased Luck retains seeded variability; Operations retains its documented random-ticket exception. Operations patches apply real strain/rot/incident recovery, and spare coordination capacity drains strain.
- Enabled agents incur recurring compute even while their queues are empty or a founder takes over. Disabling stops compute and new execution rot; installed Scale still has lane upkeep/load. No time or bills accrue in paused phases.

HUD values distinguish installed agents, installed lanes and currently eligible active capacity. Each room displays its engine status and running pace; the monthly compute sum excludes disabled agents. Scope signals stop when the scheduler is not running that function. These changes have not been visually inspected.

## Evidence

- `validate.log`: repository contract, balance registry check, simulation smoke/determinism, **72/72 Founder tests**, typecheck and lint passed. The new S10 suite contains **14 tests**.
- `build.log`: production build and offline package passed, 24 immutable files, build `68334b566820`.
- `pressure.json`: matched diagnostic fixtures, seed 1010. At 600 ticks controlled compute is 18,000 cents/month and strain is zero; overextended compute is 198,000 cents/month, strain is 100.97, and its initial customer churns. Disabling agents and purchasing Operations capacity lowers the backlog to 89.77 by tick 1200. These funded fixtures are not earned runs and do not certify pacing, fun or balance.
- `baseline.json`: starting checkout identity, dirty files and pre-S10 file hashes. `S10.patch` isolates the implementation and handoff from that snapshot. It must not be replaced with a reset of the mixed existing worktree.
- `validation.json`: final identities, command outcomes, versions and outstanding acceptance.

Versions: `founder-state.1` / `founder-candidate.10` / `founder-content.candidate.5` / save envelope 2. Candidate.9 saves preserve finances, ownership, partial work, paid tickets and incident ledgers; scheduler history is archived/rebased and old effort credit cleared. Older supported migrations still flow through this boundary.

## Remaining acceptance / next task

Browser/computer-use remains disabled by the owner. Desktop/mobile/compact/landscape layout, gestures, reduced motion, window lifecycle and subjective pacing remain pending. The assigned Terra/Sol tiers were not activated in this inherited task; no independent Sol contention review is claimed. The legacy balance registry remains `runtimeReady=false` with 41 required unresolved entries.

S11 starts only on continuation, with narrow owner decisions O02 (cash-death boundary) and O03 (debt repayment and VC baseline/first assessment) before dependent finance changes. Existing due-obligation, debt and VC rules were preserved in S10.
