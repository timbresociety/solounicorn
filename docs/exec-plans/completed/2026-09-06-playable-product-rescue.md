# Playable Product Rescue

- Status: COMPLETED
- Primary lane: gameplay/presentation
- Supporting lanes: build/infra, simulation
- Started: 2026-09-06

## Outcome

Turn the current narrow demo into a coherent, replayable golden company loop that can be started cleanly, completed across all seven canonical work functions, closed as a quarter, resumed into the next quarter, failed deliberately, and restarted without developer intervention.

This rescue does not claim V2 content or balance completion. The repository balance registry remains the authority and the current golden pack remains explicitly calibration-only.

## Product failures being addressed

- saved games restore after the setup screen flashes, with no user-facing restart path;
- the causal guidance stops after first ARR even though Retention, Expansion, Operations, and Finance are available;
- the old 90-second calibration closes Q1 before a first-time player can reasonably complete the seven-function circuit;
- Q2 routes into a dead-end proof screen and then reuses an already-resolved Marketing opportunity;
- missed Growth Mandates have no legible failure/restart presentation;
- quarter-close presentation omits Expansion and Churn from the canonical ARR bridge;
- local validation currently fails on a lint error already fixed on the remote branch.

## Acceptance checks

1. No setup-to-restored-run flash.
2. A visible New Run control safely clears the local slot and creates a deterministic fresh run.
3. The real Q1 gestures work in order: Marketing swipe, Product assembly, Monetization timing, Retention aim, Expansion merge/package, Operations reveal/resolve, Finance inspect/commit.
4. Causal guidance and stage routing lead the player through all seven functions.
5. Quarter close renders the full canonical ARR bridge.
6. A successful quarter enters a fresh playable Marketing opportunity in the next quarter while preserving company state and progression.
7. A missed mandate produces a clear run-failure screen with a restart path.
8. `npm run validate`, `npm test`, and `npm run build` pass.
9. Browser QA covers desktop, 390x844, and 320x568, including reduced motion, overflow, console errors, PWA routes, and at least one real canonical gesture.

Q1 uses a deterministic assisted-onboarding duration of two calibrated quarters. Q2 onward uses the approximately 150-second calibration target. This is explicitly pacing calibration, not locked balance.

## Scope boundary

This is a production-quality golden loop over the existing calibration fixture, not the full M9-M14 release candidate. It does not silently lock unresolved economics, author the full content catalogues, or claim final balance.

## Completion evidence

- Browser-played the real Q1 loop from setup through all seven work functions and quarter close, then began Q2 on a fresh Marketing signal.
- Inspected desktop at 1280x720 and mobile portrait at 390x844 and 320x568 with no document overflow or browser console errors.
- Confirmed responsive touch targets and the repository's reduced-motion treatment.
- Confirmed `/`, `/manifest.webmanifest`, `/sw.js`, and `/icon-192.png` return HTTP 200 from the local runtime.
- `npm test`: 10 files and 15 tests passed, including deterministic replay, Q2 continuity, and explicit missed-mandate failure.
- `npm run validate`: repository contract, balance validation, simulation smoke/determinism, typecheck, and lint passed.
- `npm run build`: Vinext production build passed.
- Post-QA fix: resolved Finance offers are removed from the active queue, so Pass and Counter advance into the visible quarter-close countdown without requiring Accept Capital.
