# Evidence-backed gap register

Read against [DECISIONS.md](DECISIONS.md). Source inspection is not a reproduction of every reported defect. The earlier browser audit is historical evidence in this conversation; no browser was used for this planning pass.

| Gap | Evidence / status | Required closure | Tasks |
|---|---|---|---|
| G01 Competing repo directions | `docs/index.md` pointed to removed V2 canon; old active plan pointed outside repo; guardian skills still reference V2. Confirmed file inspection. | Routing repaired now at main entries; migrate remaining validators/guidance without deleting history. | S00 |
| G02 Supplied starter leaks into root tooling | Root TS includes `**/*.ts(x)`; contract checker rejects nested AGENTS except master; starter includes its own AGENTS and archived copy. Static integration risk after folder addition, not a fresh test result. | Explicitly scope reference-pack scanning, compilation and lint. Keep founder coverage; no blanket ignore of real runtime. | S00 |
| G03 Validation does not mean active product correctness | Earlier `npm run validate`: 30 founder tests passed, then Next generated route-type errors; lint not reached. V2 registry reported runtimeReady=false and 41 required unresolved entries. | Reproduce under current root toolchain, repair generated-type workflow, distinguish founder/reference/legacy checks. | S00 |
| G04 Invisible failed pricing | Owner observed in-range tap with no ARR. `pricingQuote` still returns chance; `work` samples sale; `drawBatch` has independent error roll at Luck 0. Confirmed possible path, exact user attempt not replayed. | Deterministic non-ticket action at rank 0; attributed variance at higher ranks; authoritative result drives metric feedback. | S01, S02 |
| G05 State machine insufficient for revised rounds | Company has status + paused + report choices; quarter currently increments and continues. | Explicit settlement/draft/resume permissions, persistent draft offers, no reward duplication or catch-up time. | S01, S05 |
| G06 Window/job ownership | Recipe, board and tickets already have saved state; engine/UI job lifecycles must be audited together. No claim all state is decentralised. | Per-job identity, reservation, cancellation, expiry and agent handoff contracts; regression fixtures from actual failures. | S01, S04, S08–S10 |
| G07 Negative Luck / baseline random work | Profile and resolver contradict latest owner direction. | Function-level deterministic baseline, positive advanced EV with larger variance; named Operations exception; measure caps and realised outcome. | S02, S06, S09, S10, S15 |
| G08 Work-dashboard feel and cognitive load | Owner feedback. Earlier mobile capture showed Product ingredients/test controls below the initial workbench viewport; pricing screen arrival hid offer context until scrolling. | Laptop-centred authored play, concise cues, usable mobile composition, real gesture acceptance. | S03, S04, S13, S14 |
| G09 Wrong Retention and Operations verbs | Current bank damage and repair-only ops sheet; owner requests problem squashing and paid selective/random scratch tickets. | Replace these interactions and migrate their saved state deliberately. | S07, S09 |
| G10 Progression lacks toy transformation | Current axes primarily implemented through ranks/units/rates. Full visual and experiential mapping to new toys is unproven. | Every purchased rank changes output, playable capacity, automation stage or disclosed variance with meaningful cost/pressure. | S06–S10 |
| G11 Shallow roguelike build content | Current finite strategy IDs and capability draft fallback; full relic/consumable interactions not implemented. | Distinct typed effects, coherent build packages, constrained offer pools and durable inventory. | S05, S12 |
| G12 Environment follows ranks | Existing `tier`/STAGES differs from requested valuation milestones and persistent world. | High-quality garage/laptop baseline and visibly earned environment evolution. | S03, S13 |
| G13 Financing semantics need revision | Existing VC schedules +50% ARR, debt amortises; owner describes no-growth quarters and interest/principal pressure. Exact cash boundary unresolved. | Resolve narrow O02/O03 then implement disclosed terms, phases and failure feedback. | S11 |
| G14 Pacing and play evidence are narrow | Current policy buys agents immediately, fills recipes directly and tests 3 seeds × bootstrap/debt. Useful engine evidence, not an ordinary-player run. | Broader policies, explicit speedrun vs first-time cohorts, human comprehension and gesture-driven end-to-end play. | S15 |
| G15 PWA/accessibility/performance/streamer completion unproven for revamp | Existing infrastructure is reusable; changed viewport, assets, saves and effects need new evidence. | Offline/update recovery, keyboard parity, reduced motion, late-load metrics, spectator-readable run summary. | S13–S15 |

## Disposition map

| Existing surface | Planned treatment |
|---|---|
| Root package, `app/`, manifest and service worker | Retain; fix build boundaries and integrate revamp here. |
| `src/game/founder/{model,engine,profile,save,toys}.ts` | Adapt behind explicit versioned contracts; split only where necessary for ownership/testability. Preserve integer money, seeded replay and useful accounting. |
| `FounderGame.tsx`, `ToyRooms.tsx`, founder/toys CSS | Incrementally extract per-room components and HUD; keep one functioning app throughout. |
| `tests/integration/founder-*`, QA scripts | Retain useful assertions; distinguish old-mechanic tests, fixtures, policy simulations and authorized browser evidence. |
| `src/game/engine`, V2 balance/docs | Retained legacy evidence, not authority for new rules. Remove only proven dead runtime/build references in S00/S14. |
| `solounicorn_exec/` | Preserve user-supplied reference starter. Its compact seams are guidance; it is not the second shipping app. |
| `solounicorn-master-context/` | Preserve reference detail and provenance; latest owner delta wins. |
