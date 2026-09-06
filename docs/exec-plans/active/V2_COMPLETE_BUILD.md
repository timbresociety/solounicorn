# ONE PERSON UNICORN V2 Engine Architecture and Complete Build Plan

- Status: ACTIVE
- Plan version: 1.1
- Created: 2026-09-06
- Owner: product and engineering
- Current milestone: parallel headless foundation and narrow golden vertical slice

This is the controlling execution plan for the V2 build. Every later Codex task must read this file before changing product code, identify the milestone and gate it advances, and leave this file more accurate than it found it.

The plan operationalizes, but does not replace:

1. `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` for product mechanics, economy, and deterministic game truth.
2. `one-person-unicorn-design-context-v2.2/design.md` for visual, interaction, responsive, motion, audio, copy, and accessibility truth.
3. `one-person-unicorn-design-context-v2.2/AGENTS.md` for the design implementation contract.
4. Repository and global `AGENTS.md` instructions for execution practice.

When this plan conflicts with a higher source, the higher source wins and this plan must be corrected in the same change. Provisional balance values in the canonical product document remain provisional here.

---

## 1. How every later Codex task uses this plan

Before implementation:

1. Read the canonical sections relevant to the selected milestone.
2. Read this plan's architecture invariants, semantic action contract, milestone, and completion gate.
3. Inspect the named affected files and current implementation.
4. State which milestone and acceptance criteria the task advances.
5. Do not broaden the task into a later milestone unless the dependency is necessary for correctness.

During implementation:

1. Keep simulation, content, presentation, and optional GenAI separate.
2. Add or update tests with the behavior, not as a later cleanup.
3. Store new tuneable numbers in a versioned balance pack. Do not bury them in components or reducers.
4. Record player intent as semantic actions. Never make pointer coordinates, viewport dimensions, animation timing, or wall-clock time authoritative.
5. Preserve unrelated user changes in the worktree.

Before reporting completion:

1. Run every acceptance test required by the milestone and the repository-wide checks affected by the change.
2. Generate the required simulation reports and screenshots.
3. Record evidence under the milestone's Evidence block.
4. Change a milestone to `COMPLETE` only when its gate is fully satisfied.
5. If a gate is blocked by unresolved balance, content, asset, or external-service decisions, leave it `IN PROGRESS` and name the blocker. A passing build is not a completion gate.

Allowed milestone states:

```text
NOT STARTED
IN PROGRESS
BLOCKED
COMPLETE
```

---

## 2. Product outcome

Build a deterministic, responsive, installable startup roguelike in which the player:

```text
does one function's work directly
-> creates and moves economic cohorts through the company
-> becomes unable to cover every queue
-> buys Scale and Autonomy
-> watches agents perform the same work
-> creates Complexity, Strain, and Context Rot
-> manages Operations and capital under time pressure
-> makes company-level decisions every quarter
-> reaches $1B valuation or receives an attributable failure
```

V2 is complete only when the engine supports the canonical breadth and the shipped content reaches the V2 targets, not when a single polished Marketing interaction exists.

### V2 completion definition

- Seven distinct one-pointer work functions are playable and economically connected.
- The same seed, starting state, semantic action log, balance version, and content version always produce the same economic outcome and final hash.
- A complete run supports Growth Mandate selection, active quarters, skill investment, agents, Complexity, Ops Capacity, Strain, Rot, debt, funding, quarterly Strategies, Relics, failure, unicorn, and post-unicorn continuation.
- The shipped catalogues contain 448 validated skill ranks, approximately 224 validated Relics, approximately 42 validated Strategies, multiple Founder Histories, and versioned culture packs.
- At least five clearly distinct viable unicorn paths survive simulation and human playtesting without a universal dominant strategy.
- Mobile portrait and desktop are separately composed views over identical simulation state.
- The game is installable, resumable, replayable, accessible, observable, and release-tested as a PWA.
- Optional GenAI changes presentation only and cannot change economic state, content eligibility, timing, or randomness.

### Explicit non-goals for the golden vertical slice

- Authoring the complete 448 / 224 / 42 content catalogues.
- Locking balance through taste or a single scripted playthrough.
- Production leaderboards or anti-cheat infrastructure.
- Final post-unicorn and secret-ending spectacle.
- Adding a rendering framework before a room prototype proves it is necessary.

---

## 3. Current baseline and migration posture

The current app is a responsive V1-style cockpit prototype concentrated in `app/page.tsx` and `app/globals.css`. It proves the Marketing swipe grammar, stable peripheral HUD, protected center, responsive composition, PWA shell, and visual direction. Its state transitions, timers, static economy values, and hard-coded content are presentation prototypes, not the V2 authoritative engine.

Preserve as reference:

- cockpit hierarchy and protected center;
- mobile and desktop compositions;
- Marketing object manipulation and keyboard alternative;
- current brand tokens, monogram use, and PWA metadata;
- reserved contextual 3D icon slots and the existing asset request;
- `artifacts/visual-qa/cockpit-*-final.png` as V1 visual reference only.

Replace or extract:

- React-local economic state;
- `window.setTimeout` as a gameplay clock;
- hard-coded Marketing signals and room state;
- viewport-coupled drag thresholds as economic truth;
- static ARR, valuation, quarter, queues, strain, and alert values;
- monolithic page and global stylesheet ownership.

Do not rewrite the prototype in one unreviewable patch. Build the headless engine alongside it, connect one selector/action seam, then migrate screen areas milestone by milestone.

---

## 4. Locked architecture decisions

### 4.1 Four conceptual layers

```text
VERSIONED BALANCE + CONTENT
             |
             v
DETERMINISTIC SIMULATION <--- SEMANTIC ACTION LOG
             |
             +----> DOMAIN EVENTS ----> REPLAY / ATTRIBUTION
             |
             v
PRESENTATION SELECTORS ----> DOM HUD + ROOM RENDERERS + AUDIO/MOTION
                                             |
                                             v
                                  OPTIONAL GENAI PRESENTATION
```

#### Deterministic simulation owns

- authoritative tick and quarter phase;
- ARR, cash, cohorts, queues, customers, churn, and expansion;
- agents, policies, processing, reliability, Complexity, Ops Capacity, Strain, and Rot;
- debt, interest, equity, founder ownership, Finance offers, and valuation;
- skill ranks, Strategies, Relics, eligibility, and effect resolution;
- seeded random draws, scheduled events, failure attribution, and result summaries.

#### Content owns

- work recipes and archetypes;
- market signals, customers, threats, incidents, and Finance archetypes;
- skill nodes, Relics, Strategies, Founder Histories, tutorials, and culture packs;
- semantic copy and asset references;
- declarative effects validated against a versioned schema.

#### Presentation owns

- raw pointer interpretation, hit areas, camera, animation, particles, and visual interpolation;
- responsive composition, HUD, alerts, rooms, trees, quarter close, result screens, and settings;
- audio, music, haptics, reduced-intensity equivalents, and local feedback timing;
- converting player input into semantic actions and rendering domain events.

#### Optional GenAI owns

- non-authoritative flavor, cosmetic variation, or presentation assets that have approved deterministic fallbacks.

It may not author live balance, choose outcomes, create eligibility, change a timer, or generate stateful content during a scored run.

### 4.2 Engine form

The engine is a pure TypeScript library with no React, DOM, Canvas, WebGL, browser globals, `Date.now`, `performance.now`, `Math.random`, network access, or storage access.

Authoritative transitions use:

```ts
step(state, orderedActionsForTick, context) -> {
  state: nextState,
  events: DomainEvent[],
  checksum: StateHash
}
```

The runtime adapter owns wall-clock accumulation and persistence. The UI reads immutable snapshots through selectors and sends semantic actions through a single dispatch boundary.

### 4.3 Time model

- Authoritative time is an integer simulation tick.
- Initial target is 10 ticks per logical second and 1,500 ticks per approximately 150-second quarter. Both are versioned balance values until pacing is locked.
- Animation frames may interpolate but may not advance state directly.
- The app pauses logical time when hidden, suspended, or restoring. There is no offline economic progression in V2 core.
- Resume continues from the saved tick. Time spent backgrounded never changes economic outcomes.
- Runtime catch-up is bounded to protect input and rendering; it processes every authoritative tick rather than skipping economic work.
- Test and simulation runtimes may advance ticks without real time.

### 4.4 Numeric units and rounding

Authoritative state does not use ambiguous units or uncontrolled floating-point arithmetic.

| Concept | Authoritative unit |
|---|---|
| Cash, debt, interest, checks | integer cents |
| ARR, new ARR, expansion ARR, churned ARR | integer annual dollars |
| Ownership and rates | integer basis points or parts per million, named by type |
| Time | integer ticks |
| Capacity, work, complexity, rot | integer fixed-point units with documented scale |
| Probability | integer parts per million |
| Valuation | integer dollars |

Every division has a named rounding rule. Currency, ARR, percentage, and multiplier types are branded TypeScript types at boundaries. State hashes serialize fields in a canonical order.

### 4.5 Randomness

- A fixed, test-vector-backed 32-bit integer algorithm produces every random draw.
- Draws are keyed by `seed + randomVersion + stream + entityId + ordinal`; systems do not consume one fragile global stream.
- Stream names are semantic, such as `marketing.signal.quality`, `agent.execution`, or `finance.offer`.
- Adding a visual effect or unrelated content item cannot reroll an existing economic event.
- Every consequential draw emits an inspectable domain event containing the stream key, ordinal, and normalized result, but not hidden future information.
- Seed, random version, balance version, and content version are stored with every run and replay.

### 4.6 System ordering

Every tick executes in a locked order:

1. validate and order semantic player actions;
2. resolve the currently controlled room action;
3. progress manual and agent work;
4. route cohorts and cross-function outputs;
5. resolve customer, churn, expansion, and collections effects;
6. resolve Operations obligations, reliability, retries, and Rot;
7. resolve Finance schedules, interest, offers, and cash obligations;
8. calculate derived pressure, failure candidates, and alerts;
9. close the quarter or run when a boundary is reached;
10. emit ordered domain events, causal ledger entries, and state hash.

System order is versioned. Collections and quarter-close formulas must have explicit boundary tests so a value cannot be counted twice or land in the wrong quarter.

### 4.7 Content and effect model

Common content is data, not ad hoc component logic. Schemas support:

- stable ID and schema version;
- player-facing name, mechanical description, tags, rarity, and asset key;
- eligibility predicates;
- costs and recurring costs;
- declarative effects;
- mutually exclusive or prerequisite IDs;
- culture-pack copy overrides that do not change mechanics;
- provenance and balance status: `CANONICAL`, `PROVISIONAL`, `CALIBRATION`, or `UNRESOLVED`.

The common effect vocabulary includes typed operations such as:

```text
ADD_CAPACITY
ADD_COMPLEXITY
ADD_OPS_CAPACITY
ADD_RECURRING_COST
MULTIPLY_THROUGHPUT
MODIFY_RELIABILITY
MODIFY_INFORMATION
MODIFY_QUEUE_LIMIT
MODIFY_RISK_DISTRIBUTION
ROUTE_OUTPUT
UNLOCK_POLICY
UNLOCK_CONTENT
ADD_ELIGIBILITY_TAG
MODIFY_FINANCE_TERMS
MODIFY_ROT_RATE
MODIFY_RECOVERY
```

Rule-changing content may use a registered, pure, exhaustively tested effect handler keyed by a stable ID. Arbitrary code or dynamic evaluation in content files is prohibited.

### 4.8 Persistence, replay, and migrations

- IndexedDB stores versioned snapshots, action-log chunks, settings, tutorial state, and meta progression.
- A save is committed at semantic action boundaries, milestone transitions, and a bounded interval, not every animation frame.
- Replay restores the exact balance and content versions or fails with a clear incompatibility message. It never silently substitutes current balance.
- Migrations are one-way, versioned, fixture-tested transformations.
- Competitive runs retain their complete semantic action log and final state hash.
- Telemetry is non-authoritative, consent-aware, and cannot feed back into a live run.

### 4.9 Rendering framework decision

React remains the product shell and DOM owner. DOM is preferred for metrics, menus, alerts, Finance, progression, accessibility text, and settings. Each tactile room may use DOM, Canvas 2D, or a rendering adapter according to measured need.

Phaser or another renderer is not the simulation owner and is not added for M0-M2. If a room prototype demonstrates a real need, an ADR must document bundle, accessibility, input, DPR, reduced-motion, lifecycle, and PWA costs. Any renderer consumes snapshots/events and emits semantic actions through the same boundary.

### 4.10 Performance isolation

The golden slice runs the engine on the main thread until profiling proves that a Worker is required. The API must remain serializable so a Worker adapter can be introduced without changing domain logic. The service worker caches assets only and never advances the simulation.

---

## 5. Authoritative state boundaries

The minimum run state is:

```text
RunHeader
  runId, seed, randomVersion, balanceVersion, contentVersion, schemaVersion
  founderHistoryId, growthMandateBps, startedAtMetadata

ClockState
  tick, quarterIndex, tickInQuarter, phase

EconomyState
  startingArr, newCustomerArrQTD, expansionArrQTD, churnedArrQTD
  endingArr, cash, burn, collections, valuation, growthMultiple

CohortState
  demand cohorts -> activated cohorts -> customer cohorts
  source, quality, requirements, segment, ARR, health, age, history

FunctionState[7]
  queue, capacity, manual work, agent work, unlocks, local risks

AutomationState
  agents, tier, policy, assignment, throughput, reliability, cost, rot

PressureState
  complexity contributions, ops capacity, strain, rot, incidents, retries

CapitalState
  debt instruments, interest schedule, stress, investor offers
  financing history, founder ownership, growth arrears, emergency bridge used

ProgressionState
  purchased skill ranks, active Strategy, owned Relics, eligibility tags

RunOutcomeState
  failure candidates, causal ledger, milestones, unicorn state, final result
```

Presentation-only state includes pointer coordinates, drag offsets, hover/focus visuals, animation progress, camera, particles, panel visibility, viewport, DPR, and local audio nodes. It must never be serialized into an authoritative run snapshot.

---

## 6. Semantic action contract

### 6.1 Envelope

Every authoritative player decision uses this envelope:

```ts
type SemanticAction = {
  actionVersion: 1;
  actionId: string;
  sequence: number;
  atTick: number;
  type: ActionType;
  payload: unknown;
};
```

Validation rules:

- `sequence` is monotonic and unique.
- `atTick` cannot target an already committed tick.
- IDs refer to entities visible and eligible at that tick.
- Invalid or duplicate actions return a deterministic rejection event and do not partially mutate state.
- Raw coordinates, viewport dimensions, frame timestamps, animation state, and localized strings never enter the action log.
- Presentation debounces high-frequency input into state-changing semantic actions.

### 6.2 Canonical action catalogue

| Domain | Semantic actions | Recorded meaning |
|---|---|---|
| Run | `run.select_mandate`, `run.select_history`, `run.start`, `run.continue_after_unicorn`, `run.abandon` | irreversible run-level choices |
| Attention | `attention.enter_function` | founder changes actively controlled function |
| Marketing | `marketing.triage_signal` | ignore, pursue, or aggressively pursue a specific signal |
| Product | `product.place_component`, `product.test_request`, `product.ship_request` | component-to-slot decision, verification, or early/verified ship |
| Monetization | `monetization.commit_price`, `monetization.select_model` | tap tick and optional pricing model for an activated cohort |
| Retention | `retention.set_priority`, `retention.clear_priority` | target whose threat receives founder intervention |
| Expansion | `expansion.merge_items`, `expansion.place_package_item`, `expansion.commit_package` | logical merge and account-fit package decision |
| Operations | `operations.reveal_cell`, `operations.choose_resolution`, `operations.accept_optimizer`, `operations.dismiss_optimizer` | evidence reveal and risk-bearing response |
| Finance | `finance.open_offer`, `finance.accept_offer`, `finance.counter_offer`, `finance.pass_offer`, `finance.draw_debt`, `finance.pay_interest`, `finance.pay_principal`, `finance.refinance`, `finance.ignore_obligation`, `finance.bridge_mandate_miss` | capital and obligation decisions |
| Skills | `skills.purchase_rank` | cash-funded rank purchase after eligibility validation |
| Agents | `agents.install`, `agents.upgrade`, `agents.assign`, `agents.set_policy`, `agents.approve_exception`, `agents.reset_line` | visible automation architecture decisions |
| Quarter | `quarter.choose_relic`, `quarter.choose_strategy`, `quarter.finish_investing`, `quarter.start_next` | paused quarter-close decisions |
| Settings | no economic actions | accessibility and presentation settings stay outside the economic log |

### 6.3 Continuous input normalization

- Marketing records the resolved lane, not the drag path.
- Monetization records the press tick against a simulation-owned timing band.
- Retention records only a changed priority target at a tick, not every pointer move.
- Product and Expansion record stable object IDs and logical slots/cells, not pixels.
- Operations records logical reveal cells and choice IDs.
- Keyboard, mouse, touch, pen, and trackpad that express the same intent must produce the same action.

### 6.4 Domain events are not player actions

The engine emits immutable events such as:

```text
DemandCreated
ActivationCreated
CustomerConverted
ArrAdded
ChurnPrevented
CustomerChurned
ExpansionBooked
CashChanged
QueueChanged
AgentWorked
AgentFailed
ComplexityChanged
StrainBandChanged
RotChanged
IncidentCreated
FinanceOfferCreated
DebtObligationDue
OwnershipChanged
QuarterClosed
GrowthMandateMissed
ValuationRerated
RunFailed
UnicornReached
```

Every economic delta includes a reason code, source entity IDs, originating action when applicable, and ledger category. Presentation uses these events for causality, motion, audio, alerts, and failure attribution instead of inferring causes from before/after numbers.

---

## 7. Target file architecture

Files are introduced only when their milestone begins. Names may change through a documented ADR, but layer boundaries may not.

```text
app/
  page.tsx
  layout.tsx
  manifest.ts
  pwa-registration.tsx

src/game/
  schema/
    ids.ts
    units.ts
    actions.ts
    events.ts
    state.ts
    content.ts
    balance.ts
  engine/
    create-run.ts
    step.ts
    system-order.ts
    scheduler.ts
    random.ts
    hash.ts
    invariants.ts
    systems/
      attention.ts
      cohorts.ts
      marketing.ts
      product.ts
      monetization.ts
      retention.ts
      expansion.ts
      operations.ts
      agents.ts
      finance.ts
      progression.ts
      quarter.ts
      valuation.ts
      failure.ts
  effects/
    registry.ts
    apply-effect.ts
    eligibility.ts
  runtime/
    game-runtime.ts
    browser-clock.ts
    action-log.ts
    replay.ts
    persistence.ts
    migrations/
  selectors/
    economy.ts
    rooms.ts
    alerts.ts
    progression.ts
    results.ts
  content/
    v2-golden/
    v2/
      recipes/
      customers/
      incidents/
      finance/
      skills/
      relics/
      strategies/
      histories/
      culture/
  balance/
    v2-golden.ts
    v2.ts
  testing/
    fixtures/
    bots/
    scenarios/
    sim-runner.ts
    reports.ts

src/components/game/
  GameShell.tsx
  EconomyHud.tsx
  FunctionNavigation.tsx
  AlertInbox.tsx
  CausalLedger.tsx
  rooms/
  progression/
  quarter/
  results/
  settings/

src/presentation/
  event-orchestrator.ts
  motion.ts
  audio.ts
  haptics.ts
  assets.ts

tests/
  unit/
  replay/
  integration/
  simulation/
  e2e/
  visual/
  accessibility/

scripts/
  simulate-v2.ts
  validate-content.ts
  verify-replay.ts
  capture-v2.ts

artifacts/
  simulation/v2/
  replays/v2/
  visual-qa/v2/

docs/
  architecture/decisions/
  balance/v2/
  exec-plans/active/V2_COMPLETE_BUILD.md
```

### Dependency direction

```text
schema <- balance/content <- effects <- engine <- runtime <- selectors <- UI
```

No dependency may point left-to-right and back again. Engine code may import schemas, balance, content interfaces, and pure effect handlers. It may not import runtime, selectors, React, components, CSS, or browser adapters.

---

## 8. Quality and evidence contract

### 8.1 Required package scripts by M1

```text
npm run typecheck
npm run lint
npm run test:unit
npm run test:replay
npm run test:integration
npm run test:e2e
npm run test:visual
npm run test:a11y
npm run sim:smoke
npm run sim:release
npm run validate:content
npm run build
```

Until a script's milestone begins, it may be absent. Once introduced, it is part of every affected completion gate. Use a lightweight TypeScript test runner and property testing only where it materially improves invariant coverage. Playwright remains the browser/E2E and screenshot tool.

### 8.2 Test layers

| Layer | Purpose | Gate |
|---|---|---|
| Unit | formulas, reducers, validation, rounding, eligibility, effect handlers | every change |
| Property/invariant | conservation, bounds, idempotency, invalid action behavior | engine changes |
| Replay | state hash equality across repeat, restore, viewport, and input device | engine/runtime changes |
| Integration | cross-function cohort and pressure chains | feature milestones |
| Simulation | pacing, viability, dominance, exploit detection, distributions | balance/content milestones |
| E2E | playable flows, persistence, PWA, failure/recovery | UI milestones |
| Visual | hierarchy, responsiveness, pressure, motion equivalents | design milestones |
| Accessibility | keyboard/pointer parity, labels, contrast, reduced effects | UI milestones |

### 8.3 Universal engine invariants

- No NaN, Infinity, negative cohort sizes, negative ARR components, ownership outside 0-100%, or probability outside 0-1,000,000 ppm.
- `ENDING_ARR = STARTING_ARR + NEW_CUSTOMER_ARR + EXPANSION_ARR - CHURNED_ARR` at quarter close.
- `NET_NEW_ARR = NEW_CUSTOMER_ARR + EXPANSION_ARR - CHURNED_ARR`.
- `VALUATION = ENDING_ARR x LOCKED_GROWTH_MULTIPLE` using the versioned rounding policy.
- Cash is not valuation. Debt, agents, Operations, luck, prestige, and ownership never directly multiply valuation.
- Marketing creates Demand, Product creates Activation, Monetization creates New Customer ARR, Retention only prevents churn, Expansion creates Expansion ARR, and Operations/Finance do not directly create ARR.
- Complexity changes only through explicit structural sources, never because ARR increased.
- Strain derives from Complexity / Ops Capacity; it does not directly change ARR.
- Every agent action represents the same underlying work objects available to founder play.
- One founder controls at most one function per tick.
- Viewport, DPR, orientation, render FPS, reduced effects, audio, and input device do not change a replay hash.
- Invalid actions are deterministic no-ops with a rejection event.
- Optional GenAI unavailable, slow, or different cannot change a run hash.

### 8.4 Simulation ladder

#### Per-pull-request smoke

- At least 5,000 seeded runs across all Growth Mandates and implemented bot families.
- Fixed seed manifest checked into `tests/simulation/fixtures/`.
- Compare invariant failures, crashes, terminal-state distribution, major metric percentiles, and replay hashes with the approved baseline.
- Distribution drift beyond an approved tolerance requires a balance report, not automatic snapshot replacement.

#### Milestone calibration

- At least 50,000 seeded companies.
- Stratify by Growth Mandate, bootstrap/debt/VC, Craft/Scale/Autonomy/Variance/balanced, cross-function builds, and exploit bots.
- Record median and percentile run length, quarter reached, ARR, valuation, cash, debt, ownership, Complexity, Strain, Rot, automation, failure type, and unicorn timing.

#### Release balance

- At least 100,000 seeded companies.
- At least 1,000 runs in each required mandate/build cell where feasible.
- Re-run the exact approved corpus on the release candidate and store config, commit, versions, raw summary, and generated report.
- Zero invariant or replay failures.
- Balance gates use locked targets only. Unresolved targets appear in the report and block balance lock rather than being invented by implementers.

#### Required adversarial bots

- ignore one function for the entire run;
- perfect Craft with minimal automation;
- buy maximum Scale without Operations;
- buy maximum Autonomy without Operations;
- maximize Operations and stall growth;
- expansion-loop spam;
- debt/refinance loop;
- repeated aggressive Marketing with no downstream capacity;
- early-shipping Product exploit;
- pause/resume and save/reload timing abuse;
- action duplication, out-of-order actions, and invalid entity IDs;
- seed fishing / content-order perturbation.

### 8.5 Human playtest gates

Simulation cannot approve fun, motor feel, clarity, humor, or replay desire. Each playable milestone requires a short structured playtest that records:

- what the player believed the current objective was;
- what action they believed was available;
- why they believed ARR/cash/pressure changed;
- whether they noticed the downstream queue or risk;
- whether switching attention felt consequential;
- whether a failure was attributable;
- whether they wanted to try a different build.

Do not lock interaction timing from automated bots alone.

---

## 9. Screenshot and visual evidence contract

### 9.1 Storage and naming

Store required captures at:

```text
artifacts/visual-qa/v2/M{milestone}/
  {scenario}--{viewport}--{motion}.png
```

Use deterministic scenario fixtures. Record seed, tick, balance/content version, viewport, DPR, browser, reduced-motion/effects settings, and commit in a sibling JSON manifest.

Existing `artifacts/visual-qa/cockpit-*-final.png` files are reference images, not V2 acceptance evidence.

### 9.2 Required viewports

| ID | CSS viewport | Purpose |
|---|---:|---|
| mobile-min | 320 x 568 | canonical minimum |
| mobile | 390 x 844 | primary mobile portrait |
| mobile-landscape | 844 x 390 | orientation recompose |
| tablet-portrait | 768 x 1024 | intermediate composition |
| tablet-landscape | 1024 x 768 | intermediate composition |
| desktop | 1440 x 900 | primary desktop |

Every UI milestone captures `mobile` and `desktop`. Layout-shell, room-complete, and release gates capture all six. At least one relevant capture per milestone uses reduced motion/effects.

### 9.3 Golden screenshot suite

- run setup and Growth Mandate selection;
- each of seven active rooms in a decision-ready state;
- one causal action receipt with downstream consequence;
- agent performing visible work and agent failure evidence;
- Clean, Strained, and Runaway company states;
- alert inbox at Levels 0, 2, and 3 without center obstruction;
- Finance offer and debt obligation;
- skill tree with Craft / Scale / Autonomy / Variance distinctions;
- quarter Results equation, `WHAT CHANGED?`, Strategy, and Invest phases;
- attributable failure result;
- $1B crossing and post-event reorientation;
- settings with reduced motion, shake, flash/effects, particles, haptics, and audio channels;
- offline/installable PWA shell.

### 9.4 Visual gate questions

- Is the active verb obvious without a paragraph?
- Are ARR, valuation, cash, quarter, and crisis readable immediately?
- Is the center protected from ordinary alerts and tutorial copy?
- Does the periphery preserve function urgency and causal consequences?
- Does mobile recompose rather than shrink the desktop?
- Does high pressure remain legible and color-independent?
- Does motion explain causality and does reduced motion preserve the same information?
- Are custom contextual 3D assets used where required, with no flat icon, emoji, or stock-icon fallback?
- Is Ethereal reserved for apex rarity-bearing assets and rare brand/milestone moments?
- Does the screen remain recognizably ONE PERSON UNICORN without the wordmark?

---

## 10. Golden vertical slice definition

The golden slice proves one complete company quarter and entry into the next quarter using the production architecture. It is not a disposable prototype.

### 10.1 Required playable story

Using a fixed golden seed and `Fresh Founder`:

1. Select a 10% Growth Mandate and begin the first run.
2. Learn Marketing by swiping a signal and create a traceable Demand cohort.
3. Switch to Product, assemble a deterministic request, TEST, and SHIP it to create Activation.
4. Switch to Monetization, time a price decision, and create the first customer with explainable New Customer ARR and Cash consequences.
5. Reach quarter close and inspect the exact ARR equation, Growth Mandate result, multiple, and valuation rerating.
6. Spend Cash on one valid skill rank and begin Q2 with cohorts, customers, and purchased capability intact.
7. Save, reload, and replay the quarter to the same final state hash.

Retention, Expansion, agents, Operations, Finance, Relic selection, and Strategy selection are represented in the complete headless contracts and reducer vocabulary but are explicitly deferred from this first UI slice. They may not be substituted with generic button cards.

### 10.2 Golden content pack

Minimum representative content, not final breadth:

- Marketing data proving qualified, low-quality, and volatile shapes, with one authored signal in the slice;
- 3 Product recipes in data, with one complete drag/assembly recipe in the slice;
- 4 customer archetypes in data, with one customer-specific timing band in the slice;
- 28 first ranks, one in every branch/function combination, with one purchasable rank in the slice;
- representative Retention, Operations, agent, debt, Strategy, Relic, and Founder History entries for schema/effect proof only;
- one versioned culture pack whose presentation copy cannot change mechanical IDs.

### 10.3 Golden slice acceptance

- All required story beats arise through production systems and semantic actions, not debug-only component state.
- Every economic delta can be expanded to its causal ledger entry.
- The engine can run the same quarter headlessly, at real time, at accelerated test time, and from replay.
- Marketing, Product, and Monetization work with touch and mouse; keyboard/tap alternatives exist where appropriate.
- A 320 x 568 viewport preserves the active interaction, primary economy, quarter/crisis state, and function navigation.
- Golden desktop/mobile screenshots and a complete replay artifact are stored.
- Structural simulations and invariant tests pass; distributional 50,000-run balance evidence remains part of balance lock, not this interaction gate.
- Human playtests remain required before calling the slice comprehension-validated.

---

## 11. Milestone map

| Milestone | Outcome | Depends on | Status |
|---|---|---|---|
| M0 | Contracts, harness, architecture seams | none | IN PROGRESS |
| M1 | Deterministic kernel, actions, replay, persistence | M0 | IN PROGRESS |
| M2 | Economic spine and headless company simulation | M1 | IN PROGRESS |
| M3 | Marketing, Product, Monetization production loops | M2 | IN PROGRESS |
| M4 | Retention and Expansion production loops | M3 | NOT STARTED |
| M5 | Agents, Operations, Complexity, Strain, Rot | M2-M4 | NOT STARTED |
| M6 | Finance, capital structure, and obligations | M2, M5 | NOT STARTED |
| M7 | Quarter loop, progression, valuation, and failure | M3-M6 | NOT STARTED |
| M8 | Narrow golden vertical slice, onboarding, and authored presentation | M0-M3 and headless M7 quarter seam | IN PROGRESS |
| M9 | Quantitative balance lock | M8 | NOT STARTED |
| M10 | Full skills, Relics, Strategies, and content breadth | M9 | NOT STARTED |
| M11 | Meta progression, results, signaling, and endings | M9-M10 | NOT STARTED |
| M12 | Responsive, sensory, accessibility, performance, and PWA hardening | M8-M11 | NOT STARTED |
| M13 | Daily seeds and competitive services | M9, M11-M12 | NOT STARTED |
| M14 | Release candidate and V2 completion gate | M0-M13 | NOT STARTED |

---

## 12. Detailed milestones

### M0. Contracts, harness, and architecture seams

Outcome: establish enforceable layer boundaries and a migration seam before adding gameplay breadth.

Affected files:

- `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`
- `src/game/schema/*`
- `src/game/balance/v2-golden.ts`
- `src/game/content/v2-golden/*`
- `tests/unit/architecture.test.ts`
- `scripts/validate-content.ts`
- `docs/architecture/decisions/0001-deterministic-engine.md`
- `docs/architecture/decisions/0002-renderer-boundary.md`
- this plan

Semantic actions: define and runtime-validate the envelope and complete discriminated union. No gameplay reducer is required yet.

Acceptance tests:

- TypeScript rejects DOM/browser imports from engine paths through lint or boundary tests.
- Content and balance packs validate stable IDs, version fields, units, provenance, prerequisites, and effect vocabulary.
- Duplicate IDs, missing asset keys, unknown effect types, and unmarked numeric tuning fail validation.
- `npm run typecheck`, `npm run lint`, `npm run validate:content`, and `npm run build` pass.

Simulation tests: construct and validate 10,000 empty run headers across seed/version combinations; no gameplay claims yet.

Screenshots required: none.

Unresolved balance dependencies: all B01-B19 remain open; schemas must represent them without assigning silent defaults.

Completion gate:

- target file boundaries and dependency rules are tested;
- direct dependencies needed for test/schema validation are declared explicitly;
- ADRs record time, units, RNG, renderer, and persistence decisions;
- later tasks can name a semantic action and balance key without adding component-local truth.

Evidence:

```text
Status: IN PROGRESS
Commands: npm run typecheck; npm run lint; npm run validate:content; npm test; npm run build
Reports: tests/unit/architecture.test.ts; tests/unit/content-validation.test.ts; tests/unit/run-header.test.ts
Notes: Typed contracts, calibration schema, 44-action catalogue, 61-event vocabulary, boundary test, and ADRs exist. Full milestone gate remains open until every listed harness check is present.
```

### M1. Deterministic kernel, actions, replay, and persistence

Outcome: identical inputs produce identical state and can be saved, restored, and replayed.

Affected files:

- `src/game/engine/create-run.ts`, `step.ts`, `system-order.ts`, `scheduler.ts`, `random.ts`, `hash.ts`, `invariants.ts`
- `src/game/runtime/action-log.ts`, `replay.ts`, `game-runtime.ts`, `browser-clock.ts`, `persistence.ts`, `migrations/*`
- `tests/unit/random.test.ts`, `scheduler.test.ts`, `units.test.ts`
- `tests/replay/kernel-replay.test.ts`, `save-restore.test.ts`, `viewport-parity.test.ts`
- `scripts/verify-replay.ts`
- PWA update behavior in `public/sw.js` if version retention requires it

Semantic actions: `run.select_mandate`, `run.select_history`, `run.start`, `attention.enter_function`, and deterministic rejection behavior for the full catalogue.

Acceptance tests:

- Fixed RNG test vectors pass across browser and Node runtimes.
- Repeating, saving/restoring, and accelerated stepping produce identical per-tick hashes.
- Duplicate, stale, future-invalid, and out-of-order actions are deterministic no-ops.
- Hidden/resume time does not advance the run.
- Old save fixtures migrate or fail explicitly; no silent reset.
- Engine bundle contains no browser, storage, React, wall-clock, or unseeded-random calls.

Simulation tests: 10,000 random valid/invalid action traces with zero invariant or replay mismatches.

Screenshots required: save-incompatible and restored-run user messages at mobile and desktop once UI exists; may be deferred to M8 but fixtures cannot be deferred.

Unresolved balance dependencies: tick rate and quarter duration are versioned `CALIBRATION`, not locked.

Completion gate: a checked-in replay fixture reaches 10,000 ticks, survives at least three save/reload boundaries, and matches its final golden hash in Node and Chromium.

Evidence:

```text
Status: IN PROGRESS
Commands: npm run test:replay; npm test
Replay fixture/hash: artifacts/replays/v2/golden-q1-to-q2.json
Notes: Fixed RNG vectors, deterministic rejection, save compatibility, accelerated stepping, canonical hashing, and exact replay pass. The 10,000-tick multi-reload Chromium gate remains open.
```

### M2. Economic spine and headless company simulation

Outcome: cohorts flow through the canonical bridge and quarter economics remain explainable without UI.

Affected files:

- `src/game/engine/systems/cohorts.ts`, `valuation.ts`, `failure.ts`
- `src/game/schema/state.ts`, `units.ts`, `events.ts`
- `src/game/selectors/economy.ts`, `results.ts`
- `src/game/testing/bots/*`, `sim-runner.ts`, `reports.ts`
- `scripts/simulate-v2.ts`
- `tests/unit/cohorts.test.ts`, `valuation.test.ts`, `cash.test.ts`
- `tests/integration/economic-bridge.test.ts`, `quarter-accounting.test.ts`

Semantic actions: use test-only intent adapters to drive existing action types; do not invent generic `addArr` or `setCash` player actions.

Acceptance tests:

- Demand cannot skip Product/Monetization into New Customer ARR.
- Product creates Activation only from eligible Demand and completed/early-shipped recipes.
- Monetization converts Activation into customer ARR once.
- Retention can reduce pending churn but cannot create positive ARR.
- Expansion is separately attributed and capped by a versioned rule.
- Operations and Finance never create ARR directly.
- Quarter and valuation equations reconcile exactly at every close.
- Cash collections, costs, debt, and ARR remain distinct ledgers.

Simulation tests: 50,000 seeded headless companies using simple scripted policies; report queue flow, conservation, ARR bridge, cash, and terminal causes. Balance distribution is observational until targets are locked.

Screenshots required: none; store machine-readable and Markdown reports under `artifacts/simulation/v2/M2/`.

Unresolved balance dependencies: B01-B06, B15-B16, B19.

Completion gate: zero accounting/invariant failures and every ARR/cash mutation has a reason-coded causal ledger entry.

Evidence:

```text
Status: IN PROGRESS
Commands: npm run test:integration; npm test
Simulation report: distributional report intentionally deferred to balance lock under the v1.1 narrow-slice scope.
Invariant totals: 10,000 empty run headers plus the golden economic bridge pass with zero invariant failures.
Notes: Demand -> Activation -> Customer ARR conservation and reason-coded ARR/Cash ledgers are tested. Full all-system distribution coverage remains open.
```

### M3. Marketing, Product, and Monetization production loops

Outcome: founder input creates the complete Demand -> Activation -> Customer ARR chain through three distinct tactile interactions.

Affected files:

- `src/game/engine/systems/marketing.ts`, `product.ts`, `monetization.ts`, `attention.ts`
- `src/components/game/rooms/MarketingRoom.tsx`, `ProductRoom.tsx`, `MonetizationRoom.tsx`
- corresponding room presentation adapters and selectors
- `src/game/content/v2-golden/marketing.ts`, `recipes.ts`, `customers.ts`
- unit, integration, E2E, visual, and accessibility tests for all three rooms
- extract relevant styles from `app/globals.css`

Semantic actions:

- `attention.enter_function`
- `marketing.triage_signal`
- `product.place_component`, `product.test_request`, `product.ship_request`
- `monetization.commit_price`, `monetization.select_model`

Acceptance tests:

- ignore/pursue/aggressive Marketing outcomes depend on revealed signal state and downstream capacity, not direction alone;
- low-quality Demand retains provenance into later churn pressure;
- Product recipe correctness, wrong-piece delay, TEST, VERIFIED, and SHIP EARLY consequences are deterministic;
- Monetization timing bands are customer-specific and simulation-owned;
- switching rooms changes founder attention while inactive systems continue;
- input animation never blocks the next valid semantic action longer than the rule requires;
- touch, mouse, and keyboard-equivalent actions produce the same replay hash.

Simulation tests: at least 50,000 runs spanning signal quality, early-ship frequency, pricing accuracy, queue capacity, and attention-switch policies. Detect raw-demand maximization and early-ship dominance.

Screenshots required: decision-ready, action consequence, queue-pressure, and mastered/tutorial-decayed states for each room on mobile and desktop; all six viewports for each final room composition.

Unresolved balance dependencies: B01-B04, B07, B19.

Completion gate: a novice can create their first customer through Point -> Do -> Prove without a center-screen tutorial modal and can explain each cohort transition in playtest.

Evidence:

```text
Status: pending
Commands:
Simulation report:
Screenshots:
Playtest notes:
```

### M4. Retention and Expansion production loops

Outcome: existing customer value can be defended or expanded through distinct, bounded decisions.

Affected files:

- `src/game/engine/systems/retention.ts`, `expansion.ts`
- `src/components/game/rooms/RetentionRoom.tsx`, `ExpansionRoom.tsx`
- content for threats, needs, generators, merge chains, packages, and caps
- corresponding selectors, tests, scenarios, and styles

Semantic actions:

- `retention.set_priority`, `retention.clear_priority`
- `expansion.merge_items`, `expansion.place_package_item`, `expansion.commit_package`

Acceptance tests:

- Retention intervention follows priority, severity, required work, ARR at risk, and time to churn;
- saved ARR is reported as churn prevented, never positive ARR;
- ignoring or misprioritizing threats creates attributable churn;
- Expansion merges are deterministic by logical cell/object ID;
- package quality and semantic fit affect Expansion ARR and possible churn pressure;
- a customer cannot generate unbounded Expansion ARR;
- no precision unavailable to a thumb is required.

Simulation tests: threat-priority sweeps, customer-size tradeoffs, merge economy conservation, package-fit distributions, and exploit bots attempting infinite expansion or churn-save farming.

Screenshots required: multi-threat priority decision, saved/lost customer, merge board, good/poor package, and capped-account state on mobile and desktop; all six viewports for final rooms.

Unresolved balance dependencies: B05-B06, B07, B19.

Completion gate: cohort history can trace one customer from Demand through Activation, conversion, threat resolution, and expansion without duplicated or unexplained ARR.

Evidence:

```text
Status: pending
Commands:
Simulation report:
Screenshots:
Playtest notes:
```

### M5. Agents, Operations, Complexity, Strain, and Rot

Outcome: automation visibly performs founder work, scales throughput, and creates a controllable but dangerous operating machine.

Affected files:

- `src/game/engine/systems/agents.ts`, `operations.ts`
- `src/game/effects/*`
- `src/components/game/rooms/OperationsRoom.tsx`
- `src/components/game/agents/*`, `AlertInbox.tsx`, `CausalLedger.tsx`
- content for agent tiers, policies, obligations, optimizers, incidents, and evidence
- pressure/alert selectors and all related tests

Semantic actions:

- `agents.install`, `agents.upgrade`, `agents.assign`, `agents.set_policy`, `agents.approve_exception`, `agents.reset_line`
- `operations.reveal_cell`, `operations.choose_resolution`, `operations.accept_optimizer`, `operations.dismiss_optimizer`

Acceptance tests:

- agents consume and produce the same canonical work objects as founder actions;
- throughput, reliability, recurring cash cost, Complexity, and Rot exposure are separate values;
- every Complexity point has a structural source and removal behavior;
- Strain band changes derive from Complexity / Ops Capacity and affect the canonical consequence categories;
- Rot rises from autonomous operation/handoffs/risk and falls only through explicit recovery;
- Corrupted lines reset through a visible, attributable process;
- obligations are existing problems; optimization scratchers are informed opt-in risks with visible upside/downside;
- repeated alerts coalesce and follow escalation Levels 0-4 without ordinary center interruption.

Simulation tests: Craft-only, Scale-heavy, Autonomy-heavy, Operations-heavy, no-Ops, max-Ops, and Variance optimizer policies across at least 50,000 runs. Test each Strain/Rot boundary and agent reliability distribution.

Screenshots required: founder vs agent work, first install, agent success, agent failure evidence, each Strain band, Rot states Fresh/Context Rot/Corrupted, obligation, optimizer risk, and alert Levels 0/2/3 on mobile and desktop.

Unresolved balance dependencies: B07-B12, B17-B19.

Completion gate: player can explain why automation increased throughput, what burden it added, why an agent failed, and what Operations action repairs the underlying pressure.

Evidence:

```text
Status: pending
Commands:
Simulation report:
Screenshots:
Playtest notes:
```

### M6. Finance, capital structure, and obligations

Outcome: Finance is an active seventh function that changes cash, debt, and ownership without directly changing ARR or valuation.

Affected files:

- `src/game/engine/systems/finance.ts`
- `src/components/game/rooms/FinanceRoom.tsx`
- content for investor/lender archetypes, offers, covenants, debt, and obligations
- Finance selectors, alerts, tests, and scenarios

Semantic actions:

- `finance.open_offer`, `finance.accept_offer`, `finance.counter_offer`, `finance.pass_offer`
- `finance.draw_debt`, `finance.pay_interest`, `finance.pay_principal`, `finance.refinance`, `finance.ignore_obligation`
- `finance.bridge_mandate_miss`

Acceptance tests:

- offer chance responds strongly to growth and negatively to debt stress/financial weakness according to the versioned formula;
- counter outcomes use a seeded draw and visible investor interest;
- accepted funding changes cash and ownership/dilution only;
- debt changes cash, principal, interest schedule, and stress, never direct ARR;
- ignored interest capitalizes exactly once and creates visible future pressure;
- future offers reflect financing history and growth deceleration;
- emergency bridge is once per run, creates no fake ARR, records arrears, and adds the arrears to the next target.

Simulation tests: bootstrap, debt, VC, mixed capital, refinance-loop, ignored-interest, weak-company offer, high-growth bootstrap decline, and emergency bridge policies across every Mandate.

Screenshots required: inbound offer in peripheral alert, opened QTE, accept/counter/pass, debt draw, interest obligation escalation, capitalization consequence, ownership change, and emergency bridge on mobile and desktop.

Unresolved balance dependencies: B13-B16, B19.

Completion gate: Finance histories reconcile cents, basis points, schedules, and ownership across save/reload/replay, and no Finance action mutates ARR directly.

Evidence:

```text
Status: pending
Commands:
Simulation report:
Screenshots:
Playtest notes:
```

### M7. Quarter loop, progression, valuation, and failure

Outcome: active play resolves into a clear company-level decision epoch and either continues, bridges, wins, or fails for attributable reasons.

Affected files:

- `src/game/engine/systems/quarter.ts`, `progression.ts`, `valuation.ts`, `failure.ts`
- `src/game/effects/eligibility.ts`
- `src/components/game/quarter/*`, `progression/*`, `results/*`
- golden skills, Relics, Strategies, and Founder History content
- quarter/relic/strategy/failure selectors and tests

Semantic actions:

- `skills.purchase_rank`
- `quarter.choose_relic`, `quarter.choose_strategy`, `quarter.finish_investing`, `quarter.start_next`
- `run.continue_after_unicorn`

Acceptance tests:

- approximately 150 seconds is a balance value, not a UI timer;
- quarter close freezes active work and presents the exact ARR equation, growth vs Mandate, multiple, and valuation;
- Mandate changes difficulty/category only and never RNG, rewards, or spawn rates;
- Relic options are contextual, eligibility reasons are visible, and choices are permanent for the run;
- Strategy duration/effects are distinct from skills and Relics;
- skill purchases cost cash, enforce prerequisites, and have no arbitrary purchase-count limit;
- valuation multiple changes are visible and explainable;
- failure output names cause, onset, bottleneck, build, and contributing decisions;
- $1B triggers a checkpoint and allows continuation.

Simulation tests: quarter-boundary accounting, Mandate comparison, skill/relic/strategy effect composition, eligibility graph, emergency bridge arrears, failure attribution, and unicorn continuation.

Screenshots required: all four quarter-close phases, Mandate miss, bridge, each major failure family, valuation rerating, $1B checkpoint, and Q2 resumed state on mobile and desktop.

Unresolved balance dependencies: B07, B15-B19.

Completion gate: a golden replay completes Q1 and begins Q2 with exact accounting, valid progression choices, and a stable final hash.

Evidence:

```text
Status: IN PROGRESS
Commands: npm run test:replay; npm run test:integration
Replay/hash: artifacts/replays/v2/golden-q1-to-q2.json
Simulation report: structural tests only; balance distributions remain open.
Screenshots: artifacts/visual-qa/v2-desktop-quarter-close.png
```

### M8. Narrow golden vertical slice, onboarding, and authored presentation

Outcome: integrate M1-M7 into the production-quality playable story in Section 10.

Affected files:

- `app/page.tsx`, `app/globals.css`
- `src/components/game/GameShell.tsx`, HUD, progressive navigation, causal ledger, Marketing, Product, Monetization, quarter close, skill purchase, and Q2 continuity surfaces
- `src/presentation/event-orchestrator.ts`, `motion.ts`, `audio.ts`, `haptics.ts`, `assets.ts`
- `src/game/runtime/*`, selectors, golden content/balance/scenarios
- `tests/e2e/golden-quarter.spec.ts`, `tests/visual/golden-slice.spec.ts`, `tests/accessibility/*`
- `scripts/capture-v2.ts`
- `asset_requests/pending/*` and `public/assets/*` as required

Semantic actions: the full catalogue in Section 6 must be emitted only through the production dispatch seam. Tutorial state remains non-economic but references semantic outcomes.

Acceptance tests:

- Section 10's complete story is playable without debug controls;
- Point -> Do -> Prove teaches each newly relevant system in decision order;
- ordinary receipts never steal the center; the quarter transition uses the center only after active work pauses;
- each P2+ event has one lead sensory channel and a reduced-intensity equivalent;
- causal receipts connect local input to downstream queue/economy/pressure changes;
- mobile/desktop share replay hashes and different compositions;
- save/reload, offline app launch after first load, update notice, and incompatible-save messaging work;
- no required UI icon uses a flat, emoji, stock, or unrelated placeholder asset.

Simulation tests: exact scripted golden and structural failure replays now; minimum 50,000 golden-pack runs at balance lock.

Screenshots required: the full golden screenshot suite in Section 9 across required viewports, with manifests and reduced-motion samples.

Unresolved balance dependencies: golden pack may retain explicitly labeled calibration values, but no unresolved value may be hidden. M8 can be interaction-complete before M9 balance lock.

Completion gate:

- all Section 10 acceptance criteria pass;
- five structured human playtests are complete;
- visual QA has no open severity-1/2 issues;
- build, unit, replay, integration, E2E, visual, accessibility, content, and simulation smoke checks pass.

Evidence:

```text
Status: IN PROGRESS
Commands: npm run typecheck; npm run lint; npm test; npm run build
Golden replay/hash: artifacts/replays/v2/golden-q1-to-q2.json
Simulation report: balance lock and large-run distribution work intentionally remains open.
Screenshots/manifest: artifacts/visual-qa/v2-desktop-marketing.png; v2-desktop-quarter-close.png; v2-mobile-marketing.png; v2-mobile-product.png; v2-mobile-320x568.png
Playtest notes: browser path verified at 1440x900, 390x844, and 320x568; human comprehension study remains open.
Open issues: final balance, remaining four room presentations, full content breadth, 50k report, and five human playtests are deferred by the user's requested slice boundary.
```

### M9. Quantitative balance lock

Outcome: replace provisional calibration with versioned, evidence-backed V2 balance for the full-run expansion.

Affected files:

- `src/game/balance/v2.ts`
- `src/game/testing/bots/*`, scenario manifests, simulation runner and reports
- `tests/simulation/*`
- `docs/balance/v2/*`
- canonical product document only when the founder explicitly approves a changed product rule

Semantic actions: no new generic actions. Bot policies must use the same public semantic actions as players.

Acceptance tests:

- every locked target is represented by a named, versioned balance key with units and provenance;
- simulation bots use the public semantic action API and cannot mutate state directly;
- approved distribution thresholds are executable regression assertions;
- a changed balance key invalidates the prior config hash and report baseline.

Simulation tests:

- run at least 100,000 seeded companies across the full required matrix;
- zero invariant/replay failures;
- Craft-only unicorn by Q16 is below 5% if the canonical provisional target is approved as the locked target;
- at least five distinct build families are viable under approved viability criteria;
- no generalist automatically dominates and no function is safely ignorable without an explicit replacement system;
- financing accelerates viable builds without becoming mandatory;
- Autonomy is powerful and materially dangerous without Operations;
- higher Variance tiers widen both tails much more than mean value;
- pause, save, reload, expansion, debt, early-ship, and content-order exploits fail to improve outcomes improperly;
- every locked constant links to a report, playtest finding, or canonical rule.

Screenshots required: balance review dashboard/report charts, not product UI screenshots.

Unresolved balance dependencies: all B01-B19 must be resolved, deliberately deferred outside V2, or approved as calibration with a named follow-up. Any dependency that affects the complete run blocks M9.

Completion gate: founder/product owner approves `docs/balance/v2/LOCK.md` containing version, targets, corpus, conclusions, accepted asymmetries, known risks, and exact config hash.

Evidence:

```text
Status: pending
Commands:
100k report/config hash:
Balance lock:
Approved exceptions:
```

### M10. Full skills, Relics, Strategies, and content breadth

Outcome: expand the validated engine to canonical V2 catalogue breadth without duplicating hard-coded logic.

Affected files:

- all `src/game/content/v2/*` catalogues
- registered special effects and eligibility handlers
- content validators, content fixtures, copy/asset manifests
- `docs/balance/v2/content-coverage.md`

Semantic actions: no content-specific UI action types unless the content introduces a genuinely new canonical decision grammar. Prefer stable choice IDs through existing actions.

Acceptance tests:

- exactly 448 unique skill ranks: 64 per function, 4 branches x 4 subbranches x 4 tiers;
- approximately 224 Relics match the approved catalogue allocation and every gated Relic explains eligibility;
- approximately 42 Strategies include duration, eligibility, tradeoff, and simulation coverage;
- multiple Founder Histories alter options/weights but never directly multiply valuation;
- culture packs can change copy/presentation without changing mechanics or run hash;
- rule-changing content changes rules/routing/timing/risk/capacity/causality rather than devolving into percentage-only filler;
- every asset reference exists or has a precise pending asset request; no fake icon fallback;
- all player-facing copy is mechanically clear first and authored second.

Simulation tests: coverage for every effect, pairwise interaction for tags/branches, targeted tests for all special handlers, eligibility reachability, dead-content detection, and 100,000-run catalogue simulation.

Screenshots required: representative skill branch per function, Relic rarity/eligibility families, Strategy choices, Founder History selection, and culture-pack swap on mobile/desktop.

Unresolved balance dependencies: content-specific tuning discovered during expansion reopens M9 for the affected version; it cannot be silently accepted.

Completion gate: content validator reports zero missing, unreachable, duplicate, untested, unowned, or mechanically undefined entries and the release simulation matrix passes.

Evidence:

```text
Status: pending
Commands:
Coverage report:
Simulation report:
Screenshots:
```

### M11. Meta progression, results, signaling, and endings

Outcome: make runs comparable, failures replayable, and mastery visible without permanent raw-power creep.

Affected files:

- meta progression state/content/selectors/components
- results, achievement, daily-seed local mode, build-label, and ending systems
- run archive/replay browser
- tests and visual scenarios

Semantic actions:

- run setup selections, replay selection, post-unicorn continuation, and meta unlock choices where choices exist;
- meta menus do not mutate an active run's economic state.

Acceptance tests:

- meta unlocks emphasize options, histories, Relics, Strategies, culture packs, challenges, cosmetics, and knowledge, not permanent ARR multipliers;
- Fresh Founder is the standardized comparison baseline;
- results identify valuation, unicorn time, quarter, Mandate, ownership, debt, automation, build label, and attributable failure;
- daily seed definition is UTC, versioned, and reproducible locally;
- $10M/$100M/$1B/$10B/$100B/$1T signaling respects P0-P4 hierarchy;
- the $1T ending remains hidden until achieved and cannot alter pre-ending economics.

Simulation tests: meta state cannot contaminate standardized runs; result/build classification is deterministic; every failure family and milestone is reachable by a fixture.

Screenshots required: run setup, history, local daily seed, run archive, replay details, each failure family, major valuation milestones, build summary, and secret ending after unlock.

Unresolved balance dependencies: B19 covers post-unicorn pacing. Final achievement content and build-label classifier thresholds require owner approval but must not alter core valuation truth.

Completion gate: a new profile, progressed profile, and Fresh Founder competitive profile produce correct and isolated run configuration hashes.

Evidence:

```text
Status: pending
Commands:
Fixtures/replays:
Screenshots:
Playtest notes:
```

### M12. Responsive, sensory, accessibility, performance, and PWA hardening

Outcome: ship the same trustworthy game across target viewports and capability levels.

Affected files:

- all game components and room renderers
- `src/presentation/*`
- `app/layout.tsx`, `app/manifest.ts`, `app/pwa-registration.tsx`, `app/globals.css`
- `public/sw.js`, manifests, icons, audio/assets
- Playwright device, visual, accessibility, offline, and performance tests

Semantic actions: unchanged across input devices and accessibility settings.

Acceptance tests:

- all six required viewports pass without clipping primary state or requiring orientation;
- touch targets are practically at least 44 x 44 CSS px and Canvas targets have equivalent usability;
- keyboard/pointer access, visible focus, labels, and replayable instructions work where appropriate;
- reduced motion disables tilt, sweeps, shake, and non-essential particles while preserving state feedback;
- screen shake, flash/effects, particles, haptics, alert intensity, music, SFX, UI, alert, and voice channels expose independent applicable controls;
- critical information is never color/audio/haptic/motion-only;
- active interaction targets 60 FPS on supported hardware, input-to-feedback and long-task budgets are recorded, and degradation affects presentation before simulation;
- install, first load, offline relaunch, update, save durability, and recovery work;
- `/`, `/manifest.webmanifest`, `/sw.js`, `/icon-192.png`, and `/icon-512.png` return successfully in production build preview.

Simulation tests: replay hash parity across viewport, DPR, render FPS throttling, reduced effects, offline mode, and resume.

Screenshots required: full Section 9 suite across all viewports, standard and reduced effects, plus installed standalone window captures.

Unresolved balance dependencies: none beyond any B01-B19 issue reopened by parity testing. Minimum supported browsers/devices and final performance budgets are non-balance decisions that require approval from profiling evidence before this gate closes.

Completion gate: zero severity-1/2 visual/accessibility/PWA issues, all parity hashes match, production build passes, and device QA matrix is signed off.

Evidence:

```text
Status: pending
Commands:
Device/performance report:
Screenshots/manifest:
PWA checks:
```

### M13. Daily seeds and competitive services

Outcome: make comparable runs shareable and rankable without allowing server uncertainty to affect local simulation truth.

Affected files:

- competitive run manifest, submission client, leaderboard UI, verification service, storage schema, rate limits, and deployment config
- privacy/security documentation and tests
- replay verification scripts

Semantic actions: active gameplay catalogue remains unchanged. Submission is an out-of-run external action containing run manifest, compressed action log, final hash, and client version.

Acceptance tests:

- daily seed is derived from UTC date, ruleset, balance version, and content version;
- server replays submitted semantic actions using the authoritative engine and rejects hash/state mismatch;
- offline runs remain playable and clearly unranked until a valid submission succeeds;
- retries are idempotent; rate limiting and payload bounds exist;
- no secret, personal account inference, or live LLM call affects a score;
- leaderboard categories distinguish Mandate and standardized configuration;
- service outage cannot corrupt or block local runs.

Simulation tests: replay-verification corpus and daily-seed parity against the approved release simulation config.

Security/service tests: tampered action/state/version payloads, duplicate submissions, oversized logs, invalid seed/date, replay bombs, rate limits, and compatibility windows.

Screenshots required: daily challenge setup, pending/offline submission, verified result, rejected/incompatible result, and category leaderboard on mobile/desktop.

Unresolved balance dependencies: none; competitive categories consume the locked balance/version manifest. Hosting/storage choice, authentication model, privacy/retention policy, anti-cheat threshold, and operating budget are external-service decisions requiring explicit approval before infrastructure mutation or production deployment.

Completion gate: threat model reviewed, verification service replays the release corpus correctly, staging load test passes, and production deployment is separately authorized.

Evidence:

```text
Status: pending
Architecture approval:
Commands/tests:
Staging report:
Deployment authorization:
```

### M14. Release candidate and V2 completion gate

Outcome: prove the complete V2 product against canonical mechanics, design, quality, and operational requirements.

Affected files: any release-blocking file, release notes, manifests, balance/content locks, final evidence index, and this plan. No unrelated refactor enters the release candidate.

Semantic actions: action version and compatibility policy are frozen for the release candidate.

Acceptance tests:

- every prior milestone is `COMPLETE` with linked evidence;
- clean install executes typecheck, lint, unit, replay, integration, E2E, visual, accessibility, content validation, production build, and PWA checks;
- exact 100,000-run release corpus has zero invariant/replay failures and satisfies the approved balance lock;
- full human run from new profile to unicorn is completed on mobile and desktop;
- save/reload/update/offline/replay/failure/post-unicorn paths pass;
- complete content counts and eligibility coverage pass;
- all required screenshots are current, manifested, and reviewed;
- no required asset slot contains a prohibited fallback;
- known issues include severity, player impact, workaround, and explicit ship/defer decision;
- deployment/publish/push remain separate external actions requiring explicit authorization.

Simulation tests: rerun the exact approved 100,000-company corpus on the release commit, verify every final state hash expected by the locked fixture set, and compare all locked distribution gates without updating baselines.

Screenshots required: final golden suite and store/launch assets derived from approved product states.

Unresolved balance dependencies: none. No dependency that alters canonical V2 mechanics, scoring, deterministic replay, accessibility, or core presentation may remain open.

Completion gate: product owner signs the release evidence index; only then may the plan status change from ACTIVE to COMPLETE.

Evidence:

```text
Status: pending
Release commit:
Quality report:
100k simulation report/config hash:
Screenshot manifest:
Known issues:
Product sign-off:
```

---

## 13. Unresolved balance dependency register

Later tasks must use these IDs in code comments, balance metadata, test names, reports, and blocker notes. A task may add evidence or a proposed value, but may not mark an item resolved without the required simulation and owner decision.

| ID | Dependency | Current status | Evidence required | Blocks |
|---|---|---|---|---|
| B01 | Manual founder capacity and attention-switch cost | UNRESOLVED | action-rate playtests plus bot sensitivity | M9 |
| B02 | Growth Unit scaling, including provisional two-thirds curve | PROVISIONAL | Craft-only and full-build simulation across ARR scales | M9 |
| B03 | Seven work-function output equations and units | UNRESOLVED | unit model, boundary tests, 50k+ sim | M3-M9 |
| B04 | Queue generation, expiry, capacity, and backlog pressure | UNRESOLVED | queue stability and attention-switch simulation | M3-M9 |
| B05 | Customer health and churn generation | UNRESOLVED | cohort survival distributions and threat playtests | M4-M9 |
| B06 | Expansion cap / diminishing-return rule | UNRESOLVED; old 8% is calibration only | exploit simulation and account-level explanation | M4-M9 |
| B07 | 448 rank cost curves and effect magnitudes | UNRESOLVED | economy curves, purchase timing, branch viability | M9-M10 |
| B08 | Complexity contribution by Scale, Autonomy, routing, and integrations | UNRESOLVED | contribution ledger and build comparison | M5-M9 |
| B09 | Ops Capacity base/progression | UNRESOLVED | pressure-band occupancy and Ops investment simulation | M5-M9 |
| B10 | Strain thresholds and penalties | PROVISIONAL categories/numbers | boundary tests, reliability/incident distributions, playtests | M5-M9 |
| B11 | Rot generation, state penalties, and recovery | UNRESOLVED; state names provisional | long-run autonomy/Operations simulation | M5-M9 |
| B12 | Agent install/cost/throughput/reliability ladder | CALIBRATION only | founder-vs-agent throughput, cash, pressure, and failure simulation | M5-M9 |
| B13 | Finance offer probability and investor interest | UNRESOLVED | growth/debt/cash sensitivity and offer-frequency simulation | M6-M9 |
| B14 | VC terms, counter odds, dilution, controls/covenants | UNRESOLVED | capital-path simulations and ownership outcomes | M6-M9 |
| B15 | Debt APR, step-ups, refinance, stress, and emergency bridge terms | UNRESOLVED | debt-loop exploits and survival distributions | M6-M9 |
| B16 | Growth multiple bands | CALIBRATION eligible | growth/valuation pacing and comprehension playtests | M7-M9 |
| B17 | Approximately 42 Strategy effects/durations | UNRESOLVED | strategy reachability, tradeoffs, dominance simulation | M9-M10 |
| B18 | Approximately 224 Relic effects, rarity, and eligibility graph | UNRESOLVED | reachability, interaction, tail-risk, catalogue coverage | M9-M10 |
| B19 | Quarter duration and full-run pacing by Mandate | PROVISIONAL approximately 150s/quarter | complete-run timing, fatigue, comprehension, and simulation | M8-M9 |

Resolution record format:

```text
ID:
Decision:
Balance version:
Evidence:
Approved by/date:
Regression thresholds:
```

---

## 14. Completion gate summary

No task, milestone, golden slice, or V2 release is complete merely because code compiles.

### Task complete

- selected acceptance criteria pass;
- affected deterministic tests and replay fixtures pass;
- required screenshots/simulation artifacts exist;
- this plan's status/evidence is updated;
- unresolved dependencies are explicit;
- no unrelated user work is overwritten.

### Golden vertical slice complete

- M0-M8 are complete;
- Section 10's full story is production-wired;
- all seven functions and the Macro loop are represented authentically;
- 50,000-run report, replay hash, screenshot suite, and five playtests exist;
- remaining work is catalogue/balance breadth rather than architectural rescue.

### V2 complete

- M0-M14 are complete;
- canonical content breadth, deterministic and balance locks, responsive/PWA/accessibility, results/meta, and approved competitive scope pass;
- release evidence is signed;
- deployment and external push occur only with separate explicit authorization.

---

## 15. Decision and change log

Append entries. Do not rewrite history.

| Date | Decision | Reason | Affected milestones |
|---|---|---|---|
| 2026-09-06 | Adopt a pure TypeScript deterministic engine with semantic actions and presentation adapters | Required for replay, simulation, responsive parity, and renderer independence | M0-M14 |
| 2026-09-06 | Keep React/DOM as the product shell; defer any room renderer dependency until measured need | Current stack is sufficient for the shell and architecture must not make rendering authoritative | M0-M8 |
| 2026-09-06 | Define the golden slice as one complete Q1-to-Q2 company story containing all seven functions, automation pressure, Finance, and quarter close | Proves the causal product rather than polishing an isolated minigame | M2-M8 |
| 2026-09-06 | Treat every numerical tuning dependency not canonically locked as versioned provisional or unresolved | Prevents illustrative values from becoming silent product truth | M0-M10 |
| 2026-09-06 | Narrow the first UI slice to Mandate -> Marketing -> Product -> Monetization -> first ARR -> quarter close -> skill -> Q2 while completing the full headless semantic model in parallel | New user direction prioritizes the production architecture and one causal interaction loop before the remaining room presentations | M0-M8 |
