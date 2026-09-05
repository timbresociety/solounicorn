# ONE PERSON UNICORN — Automation Protocol

Status: ACTIVE REPOSITORY WORKFLOW

Goal: let Codex or other coding agents work repeatedly and in parallel without reinterpreting product truth, inventing balance, duplicating context, or collapsing design/content quality.

## 1. Agent operating model

`AGENTS.md` is the entrypoint/map, not the full manual.

Every task chooses one primary lane and reads only the deeper authority relevant to that lane.

| Lane | Primary authority | Typical paths | Required skill/gate |
|---|---|---|---|
| product-canon | canonical product context | product canon/docs | explicit user request |
| build/infra | build + architecture | app/config/scripts/PWA | `$opu-build-guardian` |
| balance | balance spec + registry | `balance/`, simulation reports | `$opu-balance-guardian` |
| simulation | architecture + canon + balance dependencies | `simulation/` | `$opu-simulation-guardian` |
| gameplay/presentation | canon + build + design | `app/`, presentation assets | `$opu-design-guardian`, `$opu-visual-qa` |
| content | canon + content contract | `content/` | `$opu-content-guardian` |
| assets | design + reference map | asset outputs/requests | `$opu-asset-generation` / `$opu-asset-request` |

Tool/skill selection lives in `../SKILLS.md`.

Do not make a task “full product implementation” when it contains separable lanes.

## 2. Single-context topology

The repository deliberately has:

- one root `AGENTS.md`;
- one root `.agents/skills/` tree;
- one product canon;
- one build contract;
- one design canon;
- one content canon;
- one balance authority.

Do not create nested `AGENTS.md`, nested `.codex/skills`, versioned context packages, or copied “master prompts” inside feature folders.

When a domain rule changes, change its authority and make other files link to it.

`one-person-unicorn-design-context-v2.2/` is legacy reference storage only. Do not restore its old instruction hierarchy.

## 3. Write barriers

### Product canon

`ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` is read-only unless the user's current task explicitly changes product/system truth.

### Build/architecture canon

`docs/BUILD.md` and `ARCHITECTURE.md` change only when implementation architecture/product-form requirements genuinely change, not for a local workaround.

### Balance lock

An agent may move a registry entry to `candidate` only with reproducible evidence. Only an explicit product-owner request may set `status: "locked"`.

### Design canon

`docs/design/DESIGN.md` and `docs/design/REFERENCES.md` are read-only for ordinary feature implementation. Change only in an explicit design-system/reference-authority task.

### Content canon

`docs/content/CONTENT.md` is read-only for ordinary catalogue authoring. Change only when the content/writing system itself changes.

### Registered founder references

Do not silently replace, redraw or supersede an approved founder asset. A new canonical reference must be explicitly registered in `docs/design/REFERENCES.md`.

## 4. Preflight

Before writing code/content:

```bash
npm run contract:check
npm run balance:validate
```

Then:

1. identify primary lane;
2. list only the authority docs required;
3. inspect current paths to touch;
4. identify unresolved balance dependencies;
5. define acceptance checks;
6. invoke the relevant project skill(s);
7. create/update an exec plan when the task crosses domains or has meaningful phases.

Do not load every long document into working context unless needed.

## 5. Exec plans

Use `docs/exec-plans/active/` for work that:

- crosses architecture domains;
- spans multiple rooms/systems;
- is delegated to multiple agents;
- requires migration;
- needs quantitative calibration;
- has multiple meaningful checkpoints.

Copy `docs/exec-plans/TEMPLATE.md` and keep it current.

When complete, move it to `docs/exec-plans/completed/` and record validation evidence.

## 6. Parallel agent rules

Parallelize by disjoint ownership.

Good:

```text
Agent A -> simulation cohort model
Agent B -> Marketing presentation against an existing semantic action interface
Agent C -> final visible asset family
```

Bad:

```text
Agent A -> independently rewrite simulation state
Agent B -> independently rewrite the same simulation state
```

Do not have two agents promote values for the same balance surface simultaneously. Prefer isolated branches/worktrees for concurrent tasks.

## 7. Balance-dependent implementation

If a UI/mechanic needs an unresolved number:

- do not hardcode a plausible value into production logic;
- expose the dependency through a typed/configured boundary;
- use an explicit non-authoritative fixture/adapter;
- add/update the missing registry surface when appropriate;
- continue work that does not require pretending balance is locked.

## 8. Simulation changes

All economic changes require:

- seeded randomness only;
- invariants/accounting checks;
- determinism tests;
- no browser/UI dependency;
- no live GenAI resolution;
- no hidden numeric constants outside the balance contract.

Run:

```bash
npm run sim:smoke
npm run sim:determinism
npm run balance:validate
```

Candidate/locked quantitative work also requires the full simulator evidence defined by `../balance/BALANCE_SPEC_V2.md` once that surface exists.

## 9. Visible gameplay changes

For each room preserve:

```text
input
-> physical response
-> local resolution
-> semantic simulation action
-> consequence
-> visible causal feedback
-> next decision
```

Do not let presentation directly mutate ARR/Cash/Valuation.

Exercise the actual pointer gesture, not only a fallback action. Desktop and mobile both require inspection.

Routine alerts must use the alert-inbox/escalation model from `../design/DESIGN.md` rather than stealing the center.

## 10. Content changes

Content work must use `../content/CONTENT.md`.

Do not put balance formulas in copy/data. If a proposed Relic, Strategy, incident or archetype needs a new effect, route that dependency through simulation/balance first.

Runtime GenAI never determines mechanics/rewards.

## 11. Asset changes

Use registered founder references through `../design/REFERENCES.md` only.

Generate current-surface assets in small reviewed families. If final quality is not achievable, use the exact asset-request workflow instead of lowering the visual bar.

## 12. Completion sequence

Every task:

```bash
npm run validate
```

Production-ready integration:

```bash
npm run build
```

Visible tasks additionally:

- run the app;
- exercise real interaction;
- capture desktop/mobile;
- inspect relevant pressure states;
- test reduced motion/overflow/touch targets;
- perform `$opu-visual-qa`.

Balance-lock tasks additionally require quantitative evidence and:

```bash
npm run balance:lock-check
```

## 13. Failure behavior

Stop/report rather than guess when:

- product canon conflicts internally;
- a required balance value is unknown and cannot be isolated;
- the task requires changing product truth without user authority;
- a required registered final reference/asset is missing;
- validation fails because of the change.

Do not solve ambiguity by inventing product/economic truth or by resurrecting an older context package.

## 14. Automation-friendly task prompt

A good task contains:

```text
LANE:
GOAL:
ALLOWED PATHS:
AUTHORITY DOCS:
RELEVANT SKILLS:
DO NOT CHANGE:
ACCEPTANCE TESTS:
VALIDATION:
```

For broad work, point the agent to an active exec plan instead of pasting the whole product corpus into every prompt.