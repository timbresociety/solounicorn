# S11 validation scenarios

All money is integer cents; game time is 0.1-second ticks. The dedicated finance suite uses seeded diagnostic states, not earned human runs. Owner browser/computer-use prohibition remains in force.

## State and accounting coverage

- Exactly zero cash survives until an unpaid mandatory obligation, including quarter close. Same-tick receipts precede loan and operating payments; later receipts and financing cannot rescue a terminal failure.
- Interest-only loan: immutable accepted rate and dates; monthly fractional-cent carry; principal only at maturity; exact funded settlement versus one-cent shortfall; six-month schedule matches forecast and payment math.
- Early payoff: full remaining principal plus prorated accrued interest, no fee; only interest enters expenses; outstanding bills disappear; optional unaffordable repayment survives; duplicate or stale repayment cannot debit twice.
- VC: funding creates cash and dilution, never ARR; partial funding quarter is exempt; baseline captures the next full-quarter opening; flat/down fails, growth passes; boundary acceptance, recurring reviews and eligible versus contractual ARR are explicit.
- Due failures precede rewards and unicorn checks. Loan and VC warnings precede assessment. Draft and pause freeze schedules; explicit Continue resumes them.
- Save/reload/replay: preserve accepted legacy amortisation and VC targets; migrate financing before reconstructing missing historical report metadata; rebase historical actions under the new profile.

## Policy harness correction and limits

The existing policy could choose an owned relic because it checked legacy upgrades. It now uses authoritative draft availability, removes redundant out-of-phase draft attempts, and rejects a stalled phase/clock. This changes the test policy's quarter choices, so pre-S11 versus post-S11 results are not a controlled balance comparison.

The unchanged 27,000-tick horizon represents 45 active game minutes. Surviving without winning is explicitly horizon-censored. The harness yields to the Node event loop every 50 policy iterations to keep Vitest's worker heartbeat alive; it neither skips game ticks nor alters the engine. Per-seed wall time is diagnostic and varies by machine.

Initial validation and a focused policy run were interrupted during diagnosis. A subsequent synchronous diagnostic sweep completed in about 205 seconds but failed the obsolete all-runs-must-terminate assertion and reported a Vitest heartbeat timeout. Those logs are retained; final validate.log and validation.json supersede them.

The fixed policy covers bootstrap/debt seeds 19, 77 and 84022; VC boundary scenarios are in the dedicated finance suite. Full human pacing, viable build distribution, interface readability and device input are still pending. The 18% APR and six-month term remain candidate tuning. Legacy balance registry: 41 unresolved required values, runtimeReady=false.

## Integrated result

89 Founder tests passed. The aggregate validation then exited 2 on a test-harness optional lookup; adding the undefined guard fixed typechecking. Lint subsequently found two test-local let declarations that should be const; corrected them and reran typecheck/lint successfully. These test-only static fixes do not change the completed seeded trajectories, so the four-minute sweep was not repeated. Production build passed. Final evidence records these separate outcomes rather than claiming a clean aggregate command exit.
