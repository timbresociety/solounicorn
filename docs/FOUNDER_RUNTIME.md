# Founder runtime: playable candidate

The active entry is `app/page.tsx` → `src/components/founder/FounderGame.tsx`. Simulation, commands, accounting, replay and saves live in `src/game/founder`. The previous V2 runtime and its original saved runs remain preserved.

## Authority and numerical status

Profile: **founder-candidate.5**. Current interaction corrections are detailed below. This is implemented candidate tuning, not locked balance or owner acceptance. Master reference values are imported from `solounicorn-master-context/engine/candidate_profile.json`; all gameplay economic state is owned by the headless engine. React owns transient pointer movement, scratch reveal presentation, sound and navigation rendering.

Current owner instructions supersede older positive-Luck and cash-zero rules:

- Raw Luck mean is `1 - .01 × exposed rank`. Standard deviation is `.16 × rank`, with 40% shared variance and 60% local variance. The shared shock changes every 200 ticks. Exposure can be switched off. Upside is capped by actual inputs; there is no unlimited money bet.
- Zero liquid cash at quarter close ends the run. An unpaid mandatory operating or debt bill also ends the run at its due timestamp.
- Valuation includes operating stability as well as ARR, growth and cashflow coverage. The extra operating factor is `1 / (1 + .15 × effective strain + .5 × worst rot)`. It multiplies the master's burn/forecast capital-quality factor. This directly implements the owner's requested stability contribution.

Pacing/content deviations from the reference are explicit:

- Acquisition targets three legible customer segments directly, at $1 / $3 / $10 per attempt, with finite monthly pools of 24,000 / 16,000 / 9,600. The smaller initial enterprise pool of 600 plateaued near $290M after 60 simulated minutes despite full upgrades. The larger pool restores a reachable $1B objective without converting funding or Demand directly into ARR.
- Starting cash is $1,500; a month is 600 ticks, a quarter 1,800 ticks, and each tick is 0.1 seconds.
- Product is a three-component physical assembly with fit derived from the acquired lead, Craft and the quality upgrade. This is not a claim that the reference's complete capability-development/fix-mode catalogue is ported.
- First-quarter opportunities and activated trials allow 600 ticks to learn the toy. Later qualified opportunities use 300 ticks.
- The six quarterly run upgrades have finite, nonduplicating effect IDs. Their cost is $150 × the reporting quarter. They affect acquisition cost, fit, care duration, overhead/unit upkeep, repair output or payment timing. They never set ARR or valuation.
- Successful founder history adds $150 starting cash per recorded successful run. Failed runs award no new permanent power. This is an explicit candidate winner benefit, not a claim to have authored the future relic catalogue.

## What is playable

Demand swipes create finite, expiring opportunities. Product assembly creates finite activated trials. Price-fit timing and price choice determine actual probabilistic subscription conversions. The current acceptance probability is visible. Retention targets real account cohorts with deadlines; its Craft batch limits protected accounts. Expansion merges a finite package for healthy accounts at least two months old, with two addon slots per account. Operations scratches expose and apply finite strain repairs or refresh the context of a named function.

All six functions have four ranks on each of Craft, Scale, Automate and Luck: **96 working skill ranks**. Scale changes units, buffers, coordination and upkeep. Automate actually consumes eligible inputs at the configured speed. Idle time cannot bank whole production attempts. Founder assembly reserves its in-progress request from agents. Installation takes five seconds; provisioning upkeep starts immediately. Duplicate stale rank purchases are rejected.

Automation can be switched off to stop compute charges and new work rot. Existing accumulated rot remains and requires repair. Operations capacity grows with its Scale and Craft. Seeded errors consume paid work and create pressure without booking output.

Finance shows accrued service, receivables, cash collected, operating margins, accrued bills, debt terms and equity consequences. A dated three-month forecast orders expected receipts before bills at identical timestamps, applies collection probability plus an 80% haircut, and assumes no speculative future customers. Debt uses 18% APR, six anniversary repayments and carried interest remainder. VC funds a once-per-run raise and starts recurring +50% ARR deadlines. Bootstrap and debt-only runs have no growth ultimatum.

Quarter reports and seeded build choices run alongside the next quarter. Only an explicit pause, backgrounding, failure or first unicorn checkpoint stops time. A $1B win is checked after bills and VC obligations. Continuation keeps ordinary costs and risks active.

## Persistence and UI

The new save slot is separate from V2. Saves contain profile version, complete state, checksum and semantic command history. Replays regenerate the same company from seed, inherited wins, recorded commands and integer ticks. Corrupt/incompatible saves are rejected instead of silently filled with invented economic defaults. Paused unchanged snapshots are not written repeatedly. Winning history is saved immediately and awarded idempotently.

The workspace progresses through Garage, Assisted, Swarm, Executive and Ethereal, based on installed ranks. Materials and typography change, followed by agent telemetry, detailed operating pressure and a trailing ARR chart. Critical bills and churn/VC deadlines do not require purchasing a HUD unlock.

Mobile uses its own composition with persistent core metrics, reachable Skills/Finance controls and a fixed causal receipt. Pointer cancellation/blur/resize reset local gestures. Keyboard alternatives support swiping, component placement, pricing, account targeting, merging and evidence reveal. Reduced motion removes decorative movement without changing economic outcomes. Sound is optional, synthesized and local.

Production builds generate a versioned offline asset manifest. The service worker installs the document and all hashed JavaScript/CSS/font assets together, so first-session offline recovery does not depend on a lucky second visit. New workers wait for a session boundary.

## Evidence and limits

Run `npm run test:founder` for accounting/replay/automation/failure/upgrade tests and six complete policy trajectories. Run `node scripts/qa-founder-game.mjs` against the local server for real gestures and responsive checks. Browser fixtures distinguish isolated diagnostic pressure states from an earned full-run winner. Results, screenshots and policy trajectories are in `artifacts/qa/founder`.

The benchmark policy is a deterministic, mechanically proficient player. Its win time is not a measured human learning time. Successful and failed trajectories demonstrate reachability and real cashflow pressure, not universal balance or equally competitive builds. The complete 244-metric reference model, narrative/relic breadth, commissioned art/audio and physical-device acceptance remain outside this candidate. No publication, deployment or owner acceptance is implied.

## Tactile rebuild, 2026-09-10

Active profile is now **founder-candidate.3**. This owner's interaction request supersedes the diagnostic-only Operations, fixed-pair Expansion and radar-button Retention described earlier. These mechanics remain candidate tuning.

- **Demand:** directional gesture lock, pointer cancellation, stable card identity and direct tracking. Demand agents yield the active station while the founder reads/swipes, then resume when the founder switches functions. Monetisation agents likewise yield the active offer. Other functions keep simulating.
- **Product:** nine deterministic client briefs across three segments; six ingredients; three- or four-step recipes. Incorrect ingredients can be placed, tests mark mismatches, any edit invalidates the test, and only a correct tested build can ship. An assembled manual job remains reserved from agents. Content IDs and recipe meanings live in `src/game/founder/toys.ts`.
- **Monetisation:** a 2.4-second bouncing power meter with a central 28% sweet spot. The normalized visible needle position is recorded as the semantic timing input; the engine owns conversion and outcomes. CSS interpolation, pointer latency, and reduced-motion display cannot silently judge a different needle position than the one submitted. Inputs outside [0,1] are rejected.
- **Retention:** persistent damage per account bank; baseline three deliberate hits, minus one hit per two Craft ranks (minimum one). Final impact resolves actual care through the existing resolver, cost, batch and failure rules. Hits cannot duplicate damage. Care protects ARR, never manufactures cash. Shattering is presentation.
- **Expansion:** 16 persistent board cells, matching feature family and tier required to merge, empty-cell moves, and tier-3 / tier-4 orders for first / second addons. Eight tier-1 pieces start each order. Up to eight more pieces can be supplied, capped at eight units of feature mass per family to prevent stranding an order. Merging stops at the requested tier. Only both requested suites can fulfill an order; the existing finite addon price/service economics remain unchanged. An active manual board is reserved from Expansion automation.
- **Operations:** optional six-patch vendor audit. Each card costs $3; each seeded patch has 48% chance of a $6 credit and 52% chance of a $6.50 penalty. Scratch 12% to inspect, lift, then reveal 60% to apply. Inspection never settles cash. Claimed cells settle once. Discard leaves covered cells unclaimed. Three cards per quarter plus one per Operations Scale rank prevents unbounded free cash fishing. Positive patches also apply finite existing repair capacity. Ordinary maintenance and automated maintenance remain available independently of cards. Cards are optional and agents do not gamble with them.
- Full-card expected net cash = 6 × (.48 × 600 − .52 × 650) − 300 = **−600 cents/card**. Perfect selective play has expected net +1428 cents/card before finite repair value. This is intentional player skill upside, bounded by the quarterly card count; it is not a balance-lock claim. A revealed unaffordable penalty is an unpaid mandatory obligation and ends the run.
- Vendor credits/penalties adjust cash, period net operating expense and lifetime net cost. They do not enter subscription earned revenue, collections, or ARR. `operationsNet` separately records their lifetime net cash effect including card fees.
- **Quarter close:** choices appear automatically after an active pointer gesture finishes. The founder can defer and reopen them; the clock keeps running. The six nonduplicating run strategies retain their costs. Once that pool has fewer than three options, seeded next-rank capability offers fill the draft at their normal skill-tree prices. Already-purchased offers cannot charge again. A founder can explicitly pass a quarter to preserve cash; only a fully mastered company has no upgrades left.
- **HUD:** installed ranks unlock the existing five visual stages, now with explicit Craft, lane and agent instruments; live telemetry is also visible on phones. Custom generated ceramic bank and stackable feature-module assets are part of the offline package.

Candidate.2 checkpoints preserve company finances, customers, ranks, clock and old command provenance. Only the retired partial recipe/package work resets. Migration stores a replay baseline; new commands replay against that baseline rather than reinterpreting old gestures under new rules.

Validation entry points: `npm run validate`, `npm run build`, and `node scripts/qa-tactile-founder.mjs`. The latter replaces the old fixed-pair/radar/diagnostic room gesture assumptions. Asset prompts are recorded in `docs/assets/2026-09-10-founder-toys.md`.

## Operations repair correction, 2026-09-11

Owner instruction supersedes the cashflow audit in candidate.3. Active profile: **founder-candidate.4**. The maintenance scratch sheet is now the manual repair mechanic: one strain patch and one context patch for each of six functions. Inspection at 12% exposes the intervention without applying it; finishing 60% applies that patch exactly once. A patch removes up to one Operations Craft batch of existing repair output (0.5 strain or 0.008 rot per point), including the maintenance strategy multiplier. No fees, rewards, penalties or quarterly limits. A new sheet has the existing five-second manual cadence. All values remain candidate tuning.

Separate manual repair buttons are removed. Agents yield while the founder is working on an active Operations sheet and resume on leaving; ordinary automated repair remains intact. Persistent load above capacity continues generating strain and is explicitly shown on the sheet. Saves from candidate.3 retain finances and previous cashflow history, retire the open gambling card, and begin a new replay baseline. Candidate.2 migrations pass through the existing migration first.

## 2026-09-13 gameplay interaction correction

Active profile is **founder-candidate.5**. Manual room gestures no longer acquire a hidden post-action lock. Agent throughput continues to use the candidate manual-seconds rates, while stale IDs, queue capacity, cash and semantic eligibility still reject invalid work. Operations keeps a visible five-second maintenance cadence so repair sheets cannot be replayed for infinite zero-time output.

Monetisation now gives every activated cohort a stable seeded target window. The marker bounces continuously and the submitted tap is scored against the exact highlighted customer window. Window position cannot reroll from navigation, resize, reload or frame rate. Product and Expansion pointer drags use frame-coalesced movement, stable pointer capture, live drop-target highlighting and the existing tap-then-place alternative. Operations exposes only current damage and accepts a continuous scratch from reveal through application; untouched repair patches are not shown as arbitrary rewards.

Candidate.4 saves preserve company state, financial history and previous commands, then establish a candidate.5 replay baseline because the timing resolver changed. Interaction and deterministic regression evidence do not establish full-run balance; the profile remains candidate-only.
