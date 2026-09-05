# ONE PERSON UNICORN — Build Contract

Status: BINDING IMPLEMENTATION CONTRACT FOR V2

This file defines how the canonical product is built. It does not invent product mechanics or balance numbers.

Exact package versions are owned by `package.json`. Product/system behavior is owned by `../ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`. Quantitative implementation truth is owned by `balance/BALANCE_SPEC_V2.md` and `../balance/v2/registry.json`.

## 1. Product form

ONE PERSON UNICORN is a responsive installable PWA and deterministic roguelike business simulation.

It must work as the same game across:

- mobile portrait;
- mobile landscape;
- tablet;
- desktop browser;
- installed desktop PWA.

Minimum supported compact target: `320 × 568 CSS px`.

Mobile is a recomposition of the same simulation, never a miniaturized desktop dashboard.

## 2. Current technical baseline

Use the repository stack already declared in `package.json` and build configuration. Do not replace the framework, renderer, hosting path, TypeScript, or build tooling merely because another stack is familiar.

Current baseline includes:

- React + App Router presentation;
- TypeScript;
- Vite/vinext build path;
- PWA manifest + service worker;
- Cloudflare-compatible/OpenAI Sites hosting configuration;
- deterministic standalone simulation modules;
- Playwright browser automation through project Codex configuration.

`package.json` owns exact versions. If dependencies move, update the code and this description only when the architecture materially changes.

## 3. Non-negotiable dependency direction

```text
PRODUCT CANON
    ↓
BALANCE CONTRACT + LOCKED PARAMETERS
    ↓
DETERMINISTIC SIMULATION
    ↓
SEMANTIC ACTION / EVENT ADAPTER
    ↓
PRESENTATION
```

Additional one-way inputs:

```text
AUTHORED CONTENT ───────────────→ SIMULATION / PRESENTATION
DESIGN CANON ──────────────────→ PRESENTATION
OPTIONAL GENAI ────────────────→ WORDING / COSMETIC VARIATION ONLY
SEED + ACTION LOG ─────────────→ SIMULATION
```

Never reverse these dependencies.

React components, Canvas code, animation callbacks, audio callbacks, network responses, and LLM output do not own economic truth.

## 4. Simulation contract

For identical:

```text
seed
+ starting state
+ player action log
+ balance version
+ content version
```

the economic outcome must be identical.

Simulation owns:

- ARR and cohort flow;
- Cash;
- debt, interest and founder ownership;
- Growth Mandate resolution;
- valuation and growth multiple;
- queues and work throughput;
- skill effects;
- agent throughput/reliability;
- Complexity, Ops Capacity, Strain and Rot;
- Strategies and Relics;
- Finance resolution;
- quarter timing/state;
- seeded random resolution;
- failure attribution.

Simulation must run without React, DOM, Canvas, browser timing, viewport size, network availability, or live GenAI.

Never use `Math.random()` in economic simulation.

## 5. Presentation contract

Presentation owns:

- pointer/touch/mouse input;
- DOM rendering;
- Canvas/WebGL rendering;
- local physical feedback;
- animation;
- sound and haptics;
- responsive composition;
- accessibility;
- screenshots and visual QA.

Presentation emits semantic player intent. Simulation resolves consequences.

Bad:

```ts
onClick={() => setArr(arr * 1.2)}
```

Good:

```ts
dispatch({
  type: "MARKETING_OPPORTUNITY_PURSUED",
  opportunityId,
  intensity: "normal",
});
```

The adapter/simulation decides what changes.

## 6. DOM versus tactile renderer

Prefer DOM for stable semantic interface:

- ARR;
- valuation;
- Cash;
- quarter/time;
- crisis state;
- navigation;
- Finance terms;
- skill/relic descriptions;
- menus/settings;
- accessibility labels;
- tooltips;
- install/PWA affordances.

Use Canvas/WebGL or an equivalent tactile layer when the room needs physical manipulation, continuous spatial choreography, collision-like feedback, particles, or high-frequency object motion.

Do not put the entire product in Canvas because gameplay uses Canvas.

Do not force Canvas/WebGL when DOM + pointer events can deliver the physical interaction with better accessibility and lower complexity.

## 7. Canonical room interaction contracts

The presentation must preserve the product verbs exactly:

| Function | Canonical interaction | Required feel |
|---|---|---|
| Marketing | **Swipe / triage** | drag opportunities through visible thresholds; left ignore, right pursue, up aggressive pursue |
| Product | **Assemble / recipe** | move, snap, combine, verify and ship deterministic recipe components |
| Monetization | **Time your tap** | one-pointer timing against customer-specific price bands |
| Retention | **Aim / auto-fire** | prioritize moving churn threats; intervention executes automatically on the selected target |
| Expansion | **Merge + create custom package** | generate/merge modules, then fit the resulting package to an existing customer need |
| Operations | **Scratch / reveal + opt-in high-variance bets** | physically reveal evidence; optimization scratchers clearly show upside and downside |
| Finance | **Inspect / counter / commit time-sensitive capital decisions** | read terms quickly, accept/counter/pass, and handle debt obligations without pretending capital creates ARR |

A generic card with three buttons is not an acceptable substitute for a canonical tactile room merely because it is faster to implement.

Each room must implement this causal chain:

```text
INPUT
→ IMMEDIATE PHYSICAL RESPONSE
→ LOCAL RESOLUTION
→ SEMANTIC SIMULATION ACTION
→ SYSTEM CONSEQUENCE
→ VISIBLE CAUSAL FEEDBACK
→ NEXT DECISION
```

## 8. One active function at a time

The founder actively controls one work function at a time.

Other functions continue to operate through queues, timers and agents. The build must preserve this attention constraint rather than rendering seven simultaneously playable mini-panels.

At scale, inactive functions communicate only the information needed to decide whether the founder should switch attention.

## 9. Responsive composition

### Desktop

Use width for stable peripheral awareness:

- compact global economy/survival instrumentation;
- work-function navigation;
- queue/agent/alert context;
- build/skill/relic context when relevant;
- a dominant active gameplay surface.

The center owns perceptual weight.

### Mobile portrait

Preserve in this order:

1. active gameplay size and thumb usability;
2. valuation/ARR/Cash/quarter/crisis legibility;
3. current causal feedback;
4. room switching and urgency;
5. secondary build/context surfaces.

Collapse secondary chrome before shrinking the gameplay object.

Use drawers, bottom rails, sheets and compact stacks where necessary. Do not change simulation rules or logical hit windows by viewport.

### Safe areas

Respect all `env(safe-area-inset-*)` values.

## 10. Pointer and input contract

All canonical gameplay must work with one pointer:

- touch;
- mouse;
- pen;
- trackpad-derived pointer.

No core mechanic may require:

- hover;
- right-click;
- keyboard shortcut;
- multi-touch;
- pixel precision unavailable to a thumb.

DOM target guideline: `44 × 44 CSS px` minimum. Canvas hit areas must provide comparable practical touchability.

Keyboard/accessibility alternatives may supplement the primary gesture; they do not replace it.

## 11. Rendering and timing independence

Visual resize, device pixel ratio, browser zoom, orientation, installed-window size, animation frame rate, reduced motion, or presentation-quality fallback must never reroll or change authoritative game state.

Logical game timing belongs to simulation clocks/state transitions, not CSS animation completion.

Target smooth presentation at approximately 60 FPS on normal supported hardware. When a device is constrained, reduce particles, reflection quality, post-processing, background motion and other cosmetic cost before compromising input or simulation.

## 12. PWA and network behavior

The installable shell, manifest and service worker are first-class product requirements.

The deterministic authored game must remain playable when optional GenAI is unavailable. Network loss must not change an already-resolved economic outcome.

Optional online services may enrich wording, sync, analytics or future meta systems, but must sit behind explicit adapters and failure states.

Do not make a live model call part of a quarter-resolution critical path.

## 13. State and persistence

When run persistence is implemented, persist enough identity to reproduce the run:

```text
seed
balanceVersion
contentVersion
startingState/player setup
action log or equivalent deterministic event history
```

Persist presentation preferences separately from economic state.

Never persist viewport-derived values as simulation truth.

## 14. Progressive unlocks

First-run UX should reveal systems in need-to-know order rather than database order.

Canonical teaching progression starts with manual work and ARR/Cash, then introduces Retention/Operations, Scale, agents, Complexity/Rot, Expansion, Finance, debt/funding, strategy and Relics as the player gains a reason to care.

Do not expose all seven work functions, 448 skill ranks, Finance systems and roguelike layers on the first screen.

## 15. Balance safety during implementation

`balance/v2/registry.json` is a status registry, not production runtime configuration while `runtimeReady` is false.

For unresolved numeric dependencies:

- keep the semantic interface real;
- use explicit fixtures/adapters for presentation;
- mark fixture values as non-authoritative;
- never bury a plausible number in a component;
- never promote a provisional/calibration value to production truth silently.

Only `locked` registry values may become production balance.

## 16. Content safety during implementation

Content data may select effect IDs and locked parameters. It may not implement a second hidden economy.

Runtime GenAI may generate cosmetic/original wording only within the boundary in `content/CONTENT.md`.

The game must remain mechanically complete with GenAI disabled.

## 17. Accessibility requirements

At minimum support:

- WCAG-AA-oriented text contrast;
- color-independent state cues;
- reduced motion;
- screen-shake/flash/effect controls where used;
- practical touch targets;
- legible text scaling;
- accessible equivalents for pointer interactions where feasible;
- visual equivalents for important audio/haptic cues;
- replayable/on-demand instructions;
- no essential information conveyed only by sound, motion, haptics or hue.

Reduced-motion mode changes presentation, never rules.

## 18. Performance and instrumentation rules

Instrument performance before introducing a large runtime dependency to solve a local interaction problem.

Avoid adding a general-purpose 3D engine merely to render 3D-looking bitmap icons. Use runtime 3D only when the gameplay/scene benefits materially from real 3D geometry, lighting or camera behavior.

Keep financial HUD/layout work out of high-frequency render loops where possible.

Aggregate repeated cosmetic effects under heavy load instead of emitting dozens of full animation/audio packages per frame.

## 19. Migration rule for current v0

The existing `app/` is implementation evidence, not design or economic authority.

Preserve useful infrastructure and working interfaces. Replace presentation patterns that:

- resemble a generic SaaS/admin/crypto dashboard;
- turn tactile rooms into static cards/buttons;
- directly mutate economic state in React;
- make mobile a shrunken desktop;
- use placeholder abbreviations/flat icons as final visual assets.

Do not preserve a v0 pattern solely because it already exists.

## 20. Required validation

Every change:

```bash
npm run validate
```

Production-ready integration:

```bash
npm run build
```

Visible work additionally requires:

- run the actual app;
- exercise the actual canonical gesture;
- inspect desktop and mobile portrait;
- inspect normal and pressure states when relevant;
- capture screenshots;
- test reduced motion/overflow/touch targets;
- run `$opu-visual-qa` or the same checks manually.

Balance-lock work additionally requires the quantitative evidence defined in `balance/BALANCE_SPEC_V2.md` and:

```bash
npm run balance:lock-check
```

A successful build is necessary, not sufficient, for completion.
