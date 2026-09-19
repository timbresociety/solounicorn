# Owner decisions for the founder revamp

Recorded 2026-09-16 from the current conversation. These are an owner-instruction delta to the supplied reference packs, not a replacement PRD. Implementation has not happened merely because a decision appears here.

## Authority

1. Latest explicit user instruction, including later answers to the open items below.
2. Confirmed decisions in this file, with their recorded provenance.
3. `solounicorn-master-context` for detailed mechanics not overridden here; its numbers remain candidate/reference values.
4. `solounicorn_exec/context` for compact interaction, taste and execution guidance consistent with the above.
5. Existing code and historical implementation notes as evidence of current behaviour.

The executable starter is a teaching fixture. Neither its reducer nor its install/orchestration instructions authorize replacing or launching the root app. Preserve both supplied folders. Do not run their embedded prompts automatically.

## Confirmed direction

| ID | Owner decision | Replaces or constrains |
|---|---|---|
| D01 | First valid $1B **valuation** wins; ARR drives it, cash is spendable currency. | Earlier ambiguous references to $1B ARR. |
| D02 | Quarters are roguelike rounds. Pause for the draft and allow breaks between quarters. | Continuous simulation while choosing quarter rewards. |
| D03 | Six connected toys: profile sorting Demand, cooking/recipe Product, precision-bar Monetisation, problem-squashing Retention, merge/package Expansion, scratch-ticket Operations. | Piggy-bank Retention, repair-only Operations, generic forms/buttons. |
| D04 | Each function has Craft, Scale, Automate and Luck trees. Craft increases output per unit; Scale expands the minigame; Automate progressively performs the actual toy, ultimately fully; Luck increases output variance and eventually slightly positive expected output. | Pure label/stat upgrades and old negative-EV Luck direction. |
| D05 | Luck rank 0 on a work function must not introduce action variance. The player must understand why purchased variance changed a result. | Base hidden work-error/conversion rolls and the assistant's universal promise that Luck cannot cancel a hit. |
| D06 | Feedback uses metric rolling/popping, colour and visual cues; brief helper cards on first encounter with a mechanic. | A compulsory literal step-by-step animation tutorial. |
| D07 | Operations tickets are random even at Luck 0 (explicit owner exception, clarified 2026-09-16). Higher Luck widens variance; positive expected net ticket outcomes support automation and scale. Pay ticket price; scratch partially; assess; selectively finish positive outcomes on a worthwhile card, or abandon a net-negative card and lose its price. Automated ticket resolution fully scratches everything and accepts the ticket's net outcome. | Repair-only sheets, free tickets, or agents cherry-picking positives. |
| D08 | Persistent founder environment. Score metrics on top; navigation left; active upgrades, consumables, skills, strain, compute and bills on right; laptop play area in centre. | SaaS dashboard composition and ranks-only cosmetic progression. |
| D09 | Start in a shabby garage with a battered ThinkPad-like business laptop. Environment/equipment progress at valuation milestones including $10K, $50K, $100K, $500K and $1M, continuing toward unicorn. Use original artwork. | Polished initial executive environment or laptop artwork that makes touch play tiny. |
| D10 | React, TypeScript, desktop/mobile installable PWA. More coherent 2.5D assets, icons, animation and satisfying game feedback; low reading/cognitive load. | Framework migration, a literal work dashboard, or a brainless idle clicker. |
| D11 | Run relics, consumables, deliberate skills and earned founder history are distinct. Quarterly choices create builds and combinations. | Six generic upgrades as the finished roguelike catalogue. |
| D12 | Bootstrap has cash survival pressure; VC additionally risks failure for a quarter without growth; debt requires managing interest and principal cashflow. Scale/automation amplify operational pressure. | Universal bootstrap growth deadline and inherited +50% VC target assumed without review. |
| D13 | Target 30–45 active minutes for ordinary successful runs and 15–20 for skilled speedruns, excluding paused breaks. Contextual founder/AI humour and spectator-readable outcomes/builds. | Treating headless optimal-policy wins as human pacing validation. |

D01–D03 include the user's explicit answers to the three clarification questions. D05–D08 include the latest numbered corrections. The remaining rows record the preceding product descriptions and accepted directions.

## State and presentation consequences derived from those decisions

These are implementation requirements, not additional balance constants:

- Quarter settlement and due failures precede the reward choice; rewards cannot rescue an already failed obligation retroactively.
- Draft state, offers, selections and unfinished jobs survive reload. A pause consumes no simulation time and creates no catch-up obligations.
- A manual action and an agent action operate on the same finite job and authoritative resolver. Reserve a job once; reject stale/duplicate completion.
- Score animation renders a committed result. It never changes ARR, cash, timing success, risk samples or reward ownership.
- Outside the explicit Operations ticket exception, at Luck 0, identical visible work conditions and player action have a deterministic outcome without hidden action rolls. A timing hit must not secretly pass through the old independent sale/error lottery. Purchased Luck may worsen a nominally good action; show the base result and attributed Luck delta concisely.
- World generation and already-known customer/operating conditions are distinct from action variance. A seeded replay alone does not satisfy D05: random per-attempt failure is still variance even if reproducible.
- Active play continues in other functions while the founder works. Draft pause is an explicit engine phase, not a UI modal that accidentally freezes some systems.
- Mobile retains the same HUD roles using compact rails and accessible drawers. The laptop screen gets usable touch area; a decorative keyboard cannot consume the play space.

## Open items: local gates, not reasons to stop the whole plan

| ID | Decision needed | Affected task | Proposed handling until resolved |
|---|---|---|---|
| O01 RESOLVED | Tickets are random at Luck 0; variance increases with Luck, and net-positive outcomes support automation/scale. | S09 | Use a named ticket RNG stream, sample each ticket once, and persist its outcomes. Quantitative payout tables remain candidate tuning. |
| O02 RESOLVED | Fail only when a mandatory payment cannot be settled. Exactly zero cash alone is survivable, including quarter close. | S01 phase contract, S11 finance | Owner selected the recommendation; named policy is now owner-approved. |
| O03 RESOLVED | New debt pays monthly interest, with principal due at the disclosed term end and early payoff available. New VC assesses the first full game quarter after funding; eligible ARR must close above its opening baseline. | S11 finance | Owner confirmed these rules; see the detailed answers below. Existing accepted legacy financing remains preserved and labeled. |

Ticket prices, payout tables, reward counts, rank costs, time constants and late-stage milestone thresholds are candidate tuning work. Do not promote old illustrative numbers into canon. Four purchasable ranks per axis (96 total across six functions) is the planned initial scope retained from the existing candidate; each needs an actual implemented effect. Broader subbranch/catalogue expansion is outside this delivery unless requested.

## Recommendations that are not owner-approved mechanics

- Lock visual milestone unlocks by highest earned valuation so equipment does not flicker or regress when valuation moves; current distress can still affect environment cues. Validate this reversible presentation choice in S13.
- Keep non-ticket skill checks deterministic at rank 0 and apply explicit Luck effects after the base resolver at higher ranks. Do not reintroduce independent hidden lotteries under renamed variables.
- Assess Operations manual selective-play EV separately from whole-ticket automated EV, including ticket cost, repair utility, time, capacity and downside tails. For Operations, measure expected net ticket outcome after its purchase price and separately measure agent/upkeep costs. Net-positive ticket EV must enable viable automation, but does not imply guaranteed survival or unlimited zero-time ticket supply.

## S11 owner answers (2026-09-18)

- O02: owner selected mandatory-payment failure only. Cash of exactly zero does not itself end a run, including at quarter close; inability to settle a mandatory payment does.
- O03 debt: owner requested rolling interest-only debt and a repayment tenure, then explicitly confirmed principal is due at term end with early repayment available throughout. No forced monthly principal amortisation for new loans.
- O03 VC: owner selected the first full game quarter after funding. Ignore the partial funding quarter, capture eligible ARR at the opening of the first assessed full quarter, and fail if its close is flat or below that opening. Subsequent quarters compare to their own opening (the preceding close). No inherited +50% target for new VC.
- Existing six-month tenor, 18% nominal APR, borrowing capacity/eligibility and equity amount/dilution remain candidate tuning. No numerical balance is locked by these answers. Previously accepted saved financing terms must be explicitly preserved as legacy terms during migration.
