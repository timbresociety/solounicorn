# S13–S15 local candidate acceptance

Updated 2026-09-20. This report separates implemented code, engine evidence, art, browser/device checks and human acceptance. No deployment is authorized or performed.

## Candidate delivered

- S13: original six-room environment atlas; $10K/$50K/$100K/$500K/$1M progression, candidate $10M/$100M/$1B labels; persisted peak prevents regression. Distress remains visible. Independent sound/motion preferences, OS reduced motion, metric feedback and copyable local run receipt.
- S14: production start aligned with the existing Next build (Vinext dev preserved); fresh content-hashed offline worker generated from a stable template; complete public assets and hashed chunks; atomic cache installation and no forced worker activation. IndexedDB atomic checkpoint slots with a stale-tab revision guard, preserved legacy data, explicit export/recovery, localStorage fallback only when IndexedDB is absent. Interrupted transactions preserve the prior durable save. Native confirmation dialog and focus/safe-area styling. Simulation cloning shares immutable event records while isolating mutable work and accounting state; invoice lookups avoid repeated linear scans.
- S15: resumable seeded policy matrix; candidate final Craft batch increases from 16 to 32, consuming the same finite real inputs. Early ranks, score formulas and financing rules are unchanged. Candidate.12 saves rebase into candidate.15 with owned ranks, rewards and accepted financing intact. No locked balance values were changed.

## Experimental design

Nine policy cases: manual/hybrid/automation crossed with bootstrap/debt/VC. Each uses the same 30 seeds, 15000–15029, up to 27,000 ticks (45 active minutes). Luck 0/4, selective/automatic Operations, first/repeat founders and four reward-family preferences are distributed across cases. This is a stratified policy suite, **not** a full factorial experiment; secondary variables are confounded. Family preference does not guarantee a specific draft. Seeds cover world/collection/ticket variation; identical financial failures are reported rather than treated as 30 independent human observations.

Policies use semantic commands and actual finite jobs, one manual gesture per 1 second (hybrid) or 2 seconds (manual/automation fallback). They know recipe solutions and hit pricing centers perfectly. Automation policies still need a manual startup before they can buy agents. Commands for navigation, purchases and quarter choices are additional, disclosed in action counts. Pure manual means no agents, not no skills. No synthetic cash, ARR, ranks or time jumps are inserted. Pauses/drafts add no active time. These policies cannot establish human enjoyment, comprehension or 30–45 minute human pacing.

A first matrix exposed an overinvesting bootstrap policy: it bought upgrades before first collections and failed its first bill. Policy version 2 delays bootstrap purchases until collection and keeps a reserve before acquisition. Unchanged debt/VC version-1 evidence is reused; bootstrap cases alone are rerun. Both original and corrected evidence remain available. This is an adaptive policy correction, not extra starting cash or a relaxed death rule.

## Calibration provenance

The prior hybrid-debt seed15000 reached $278M at 45 minutes (Craft16). Paired Craft64 reached $1B in 11.8 minutes, Craft32 in 44.0 minutes and Craft40 in 42.75 minutes. Retain the smallest successful tested increase, Craft32, for the 30-seed suite. These are exploratory single-seed comparisons with nonlinear progression, not a statistically independent proof of the chosen value. Full tail and matrix evidence governs the candidate assessment. The starting point, alternative pilots and final profile signatures are saved under S15.

Touchpoint: `P.craft_batch_by_rank`, overriding the supplied candidate profile only; final-rank descriptions updated for Demand/Product/Monetisation/Retention/Expansion. Operations Craft retains its separately defined repair multiplier. Legacy `balance/v2/registry.json` is untouched; its 41 unresolved required entries and `runtimeReady=false` remain.

## Acceptance gates

| Area | Status | Evidence / limit |
|---|---|---|
| S00–S12 functional contracts | Headless regression required | Existing per-slice evidence and final validation log |
| S13 environments/milestones/receipt | Implemented; visual acceptance pending | presentation tests, original atlas and asset manifest |
| S13 final icon family | **Open** | Two opaque icon generations rejected; exact alpha handoff in asset_requests/pending/founder-function-icons.md |
| S13 later milestone art | Candidate reuse | Later milestones reuse sky studio; distinct final art not claimed |
| S14 transactional saves/recovery | Headless verified | interruption, migration, stale-tab and aborted-transaction tests |
| S14 offline packaging | Headless verified | mocked Cache API plus actual build-file existence; no browser offline reload claim |
| S14 responsive/gestures/focus | Implemented; unverified | Desktop/phone/tablet/landscape/installed PWA and physical input checks owner-disabled |
| S14 performance | Headless measured | long-log fixture and per-policy command percentiles; physical frame/input timing pending |
| S14 unlimited continuation | Open stress limit | Audit history retained; IndexedDB reduces quota pressure. No claim of bounded total history or infinite-run performance |
| S15 accounting/effects/ticket tails | Headless verified | regression and ticket-tail distributions; modeled utility is not cash |
| S15 full-run reachability/builds | Measured candidate | matrix-summary.json includes wins, failures, censored runs, trajectories and all nine policies |
| S15 ordinary pacing | **Pending human observation** | Policy times alone cannot establish ordinary-player pace |
| S15 skilled pacing | Engine evidence only | Winning runs within and outside target retained; no UI speedrun claim |
| Human comprehension/fun/stream readability | **Pending** | No human or browser playthrough performed |
| Owner acceptance/release | **Pending** | No finished-product, deployment or production-balance claim |

## Reproduction / recovery

The matrix is opt-in and skipped by ordinary `npm test`; `npm run balance:founder-matrix` defaults to 30 seeds for each declared policy and resumes matching policy/profile evidence. `MATRIX_POLICY=0` selects one case, `MATRIX_OFFSET=0 MATRIX_SEEDS=30` selects its seed range. Delete/move a result only when intentionally repeating it; do not mix profile signatures. `npx vitest run tests/simulation/founder-ticket-tails.test.ts` regenerates Operations distributions. `npm run validate`, `npm run build`, then `npm run pwa:check` are final gates. Browser scripts remain disabled.

Next acceptance work is targeted desktop/mobile/offline/gesture review once authorized, finishing icon alpha, physical frame/input measurement and genuine human runs. Preserve every supplied source pack and all current save formats. No source-pack re-audit is necessary.

## Measured final matrix

See [results](../../../../artifacts/qa/founder-revamp/S15/RESULTS.md) and machine-readable matrix-summary.json. Final total: 122 wins, zero failures, 148 censored at 45 minutes. Pure-manual cases have no wins in this horizon, so manual-only viability remains open. Hybrid bootstrap successful median is 15.5 minutes; automated successful medians lie around 32–40 minutes. Sixteen policy runs finish in 15–20 minutes. Earlier policy-v1 failures are retained and the ordinary regression continues to exercise mandatory-payment deaths. Survival-only censored runs are never classified as successes.
