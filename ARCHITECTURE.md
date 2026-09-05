# ONE PERSON UNICORN — Architecture

Status: BINDING REPOSITORY ARCHITECTURE FOR V2

This document defines enforceable software boundaries. `docs/BUILD.md` defines implementation/product-form requirements. Neither document invents game balance.

## 1. Dependency graph

```text
ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md
                |
                v
docs/balance/BALANCE_SPEC_V2.md
                |
                v
balance/v2/registry.json / locked runtime balance
                |
                v
        deterministic simulation
                |
                v
       semantic action/event adapter
                |
                v
          presentation / PWA
```

Additional one-way inputs:

```text
authored content -----------------> simulation / presentation through approved contracts
design canon ---------------------> presentation
optional GenAI -------------------> wording / cosmetic presentation only
seed + action log ----------------> simulation
```

No presentation component, content file, viewport state or runtime model call owns economic truth.

## 2. Repository map

```text
AGENTS.md
  short agent navigation map

ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md
  canonical product/system behavior

ARCHITECTURE.md
  dependency and software boundaries

docs/
  BUILD.md
    implementation, PWA, responsive and integration contract
  SKILLS.md
    project-agent skill/tool map
  balance/
    quantitative lifecycle/authority
  design/
    DESIGN.md
    REFERENCES.md
  content/
    CONTENT.md
  automation/
    agent execution protocol
  exec-plans/
    active/completed cross-domain work

balance/v2/
  machine-readable parameter registry/schema
  runtime balance only after lock

simulation/
  deterministic economic/systems engine
  no React, DOM, browser APIs, live LLMs or unseeded randomness

content/
  authored deterministic game content/data

app/
  PWA/presentation layer
  HUD, room surfaces, input, animation, accessibility, responsive composition

.agents/skills/
  project workflows/gates; never a second product/design canon

one-person-unicorn-design-context-v2.2/
  legacy reference storage only
  registered visual assets are interpreted through docs/design/REFERENCES.md

asset_requests/
  exact pending final-asset handoffs

fixtures/
  non-authoritative visual/test states only
```

Do not add nested `AGENTS.md` files or nested skill trees. Repository-root `AGENTS.md` and `.agents/skills/` are the only agent instruction entrypoints.

The current `app/page.tsx` is legacy v0 presentation. It may temporarily contain migration state, but new economic logic must not be added there.

## 3. Product canon versus balance

Product canon owns causal relationships such as:

```text
ENDING_ARR
= STARTING_ARR
+ NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

and:

```text
VALUATION
= ENDING_ARR
× LOCKED_GROWTH_MULTIPLE
```

It also owns rules such as Marketing creating Demand rather than ARR.

Product canon deliberately does not lock every numeric value.

Quantitative implementation truth is owned by:

```text
docs/balance/BALANCE_SPEC_V2.md
balance/v2/registry.json
```

Only registry entries marked `locked` may flow into production runtime balance.

## 4. Simulation boundary

Simulation must be:

- deterministic;
- pure or explicitly state-transition based;
- testable without a browser;
- independent of viewport and DPR;
- independent of animation timing/FPS;
- independent of network availability;
- independent of live GenAI output.

Simulation owns:

- ARR/cohort flow;
- Cash, debt, interest and ownership;
- Growth Mandate resolution;
- growth multiple and valuation;
- queues and work throughput;
- customer health/churn/expansion;
- skill-tree effects;
- agent throughput/reliability;
- Complexity, Ops Capacity, Strain and Rot;
- Strategies and Relics;
- Finance resolution;
- seeded random resolution;
- quarter timing/state;
- failure attribution.

## 5. Presentation boundary

Presentation owns:

- DOM/Canvas/WebGL rendering;
- pointer/touch/mouse mapping;
- local physical feedback;
- animation and motion;
- sound/haptics;
- responsive composition;
- visual hierarchy;
- accessibility equivalents;
- screenshots/visual QA.

Presentation emits semantic player actions and renders resolved state.

Bad:

```text
onClick={() => setArr(arr * 1.2)}
```

Good:

```text
dispatch({
  type: "MARKETING_OPPORTUNITY_PURSUED",
  opportunityId,
  intensity: "normal"
})
```

The simulation resolves consequences.

## 6. Content boundary

Canonical writing/content behavior is defined in `docs/content/CONTENT.md`.

Content is deterministic authored data, not balance code.

It may define recipes, archetypes, incidents, Strategies, Relics, Founder Histories, tutorials and culture packs and may reference approved semantic effect IDs/locked parameters.

It must not invent hidden economic formulas, probabilities, reward magnitudes or state transitions.

## 7. Design boundary

Canonical visual/interaction behavior is defined in `docs/design/DESIGN.md`.

Reference images are interpreted only through `docs/design/REFERENCES.md`.

Design may specify input, composition, affordance, motion, feedback, audio/haptics and accessibility. It may not rewrite product causality or balance.

The canonical seven interactions are Product truth; visual analogy cannot change them.

## 8. Optional GenAI boundary

Runtime GenAI may generate fictional names, surface wording, original cosmetic flavor and other explicitly non-authoritative presentation variants.

Runtime GenAI may not generate or decide probabilities, ARR effects, valuation, financing math, debt terms, skill effects, agent reliability, reward amounts, eligibility, or simulation transitions.

The deterministic authored game must remain fully playable with GenAI disabled or offline.

## 9. Balance lifecycle

Parameter states:

```text
missing
-> calibration / provisional
-> candidate
-> locked
```

`candidate` means reproducible evidence exists but product-owner approval is still required.

`locked` means safe for production implementation for the declared balance version.

`runtimeReady` remains false until every parameter marked `requiredForRuntime` is locked.

Do not create a fake complete runtime file to unblock presentation. Use fixtures/adapters.

## 10. Version identity

A replayable economic result is identified by:

```text
seed
balanceVersion
contentVersion
startingState
playerActionLog
```

Persist these identifiers with run data when persistence is implemented.

Presentation preferences are separate and must not affect replay identity.

## 11. Testing layers

Economic/system changes require as appropriate:

1. unit/invariant tests;
2. determinism tests;
3. seeded regression;
4. distribution/balance analysis for quantitative changes;
5. human playtest for feel/clarity where interactive.

Visible changes additionally require actual gesture QA and desktop/mobile screenshot inspection under `docs/design/DESIGN.md`.

Build/PWA changes additionally require the gates in `docs/BUILD.md`.

## 12. Automation boundary

Agents work by disjoint domain ownership when parallelized.

Avoid multiple agents modifying the same authority surface simultaneously.

Cross-domain tasks require an active exec plan under `docs/exec-plans/active/`.

Project skills live at `.agents/skills/` and are workflows/gates. They point to authority rather than duplicating it.

CI is the minimum merge gate, not the product-quality ceiling.
