# ONE PERSON UNICORN — Architecture

Status: BINDING REPOSITORY ARCHITECTURE FOR V2

This document converts the canonical product direction into enforceable software boundaries. It does not invent game balance.

## 1. Dependency graph

```text
ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md
                |
                v
docs/balance/BALANCE_SPEC_V2.md
                |
                v
balance/v2/registry.json
                |
                v
        deterministic simulation
                |
                v
          presentation / PWA
```

Additional one-way inputs:

```text
authored content -----------------> simulation
design canon ---------------------> presentation
optional GenAI -------------------> wording / cosmetic presentation only
seed + action log ----------------> simulation
```

No presentation component owns economic truth.

## 2. Repository map

```text
AGENTS.md
  short agent navigation map

ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md
  canonical product/system behavior

ARCHITECTURE.md
  code boundaries and dependency rules

docs/
  maintained repository knowledge base
  balance/
  automation/
  exec-plans/
  product/

balance/v2/
  machine-readable parameter registry
  schema and, only after lock, runtime balance

simulation/
  deterministic economic/systems engine
  no React, DOM, browser APIs, live LLMs, or unseeded randomness

content/
  authored deterministic game content
  recipes, archetypes, Strategies, Relics, incidents, culture packs

app/
  PWA/presentation layer
  HUD, room surfaces, input, animation, accessibility, responsive composition

one-person-unicorn-design-context-v2.2/
  design canon and visual references

asset_requests/
  exact pending asset handoffs

fixtures/
  non-authoritative visual/test states only
```

The current `app/page.tsx` is legacy v0 presentation. It may temporarily contain state while migration is underway, but new economic logic must not be added there.

## 3. Product canon vs balance

The canonical context owns relationships such as:

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
x LOCKED_GROWTH_MULTIPLE
```

It also owns causal rules such as Marketing creating Demand rather than ARR.

The canonical file deliberately does **not** lock every numeric parameter.

Quantitative implementation truth is owned by:

```text
docs/balance/BALANCE_SPEC_V2.md
balance/v2/registry.json
```

Only registry entries marked `locked` may flow into production runtime balance.

## 4. Simulation boundary

Simulation code must be:

- deterministic;
- pure or explicitly state-transition based;
- testable without a browser;
- independent of viewport;
- independent of animation timing;
- independent of network availability;
- independent of live GenAI output.

Simulation owns:

- ARR and cohort flow;
- Cash, debt, interest and ownership;
- Growth Mandate resolution;
- growth multiple and valuation;
- queues and work throughput;
- customer health/churn/expansion;
- skill-tree effects;
- agent throughput/reliability;
- Complexity, Ops Capacity, Strain and Rot;
- Strategies and Relic effects;
- seeded random resolution;
- quarter timing/state;
- failure attribution.

## 5. Presentation boundary

Presentation owns:

- DOM/canvas/WebGL rendering;
- pointer/touch/mouse input mapping;
- animation and motion;
- sound/haptics;
- responsive composition;
- visual hierarchy;
- accessibility equivalents;
- screenshots and visual QA.

Presentation emits semantic player actions into simulation and renders resulting state.

Bad:

```text
onClick={() => setArr(arr * 1.2)}
```

Good:

```text
dispatch({
  type: "MARKETING_SIGNAL_PURSUED",
  opportunityId,
  intensity: "normal"
})
```

The simulation resolves consequences.

## 6. Content boundary

Content is deterministic authored data, not balance code.

Content may define product recipes, customer archetypes, incidents, Strategies, Relics, Founder Histories, culture packs, and fictional flavor templates.

Content may reference locked effect IDs/parameters. It must not invent hidden economic formulas in copy or components.

## 7. Optional GenAI boundary

Runtime GenAI may generate fictional names, surface wording, jokes/flavor, and cosmetic variants.

Runtime GenAI may not generate probabilities, ARR effects, valuation, financing math, debt terms, skill effects, agent reliability, reward amounts, or simulation state transitions.

The authored deterministic game must remain fully playable with GenAI disabled.

## 8. Balance lifecycle

Parameter states:

```text
missing
-> calibration / provisional
-> candidate
-> locked
```

`candidate` means simulation evidence exists but product-owner approval is still required.

`locked` means safe for production implementation for the declared balance version.

`runtimeReady` is false until every parameter marked `requiredForRuntime` is locked.

Do not create a fake complete runtime file to unblock UI work. Use fixtures for presentation instead.

## 9. Version identity

A replayable economic result is identified by:

```text
seed
balanceVersion
contentVersion
startingState
playerActionLog
```

Persist those identifiers with run data once persistence is implemented.

## 10. Testing layers

Every economic change should have:

1. unit/invariant tests;
2. determinism tests;
3. seeded simulation regression;
4. distribution/balance analysis when quantitative;
5. human playtest for feel/clarity when interactive.

Visual changes additionally require desktop and mobile screenshot inspection.

## 11. Automation boundary

Agents should work in isolated worktrees/branches when parallelized.

Avoid multiple agents modifying the same authority layer simultaneously.

Cross-layer tasks need an active exec plan under `docs/exec-plans/active/`.

CI is the minimum merge gate, not the product-quality ceiling.
