# ONE PERSON UNICORN — Automation Protocol

Status: ACTIVE REPOSITORY WORKFLOW

Goal: let Codex or other coding agents work repeatedly and in parallel without reinterpreting the product, inventing balance, or collapsing design quality.

## 1. Agent operating model

`AGENTS.md` is a map, not the full manual.

Every task chooses one primary lane and reads only the deeper docs relevant to that lane.

| Lane | Primary authority | Typical paths | Required skill/gate |
|---|---|---|---|
| product-canon | canonical context | canonical + product docs | explicit user request |
| balance | balance spec + registry | `balance/`, `simulation/`, reports | `$opu-balance-guardian` |
| simulation | architecture + canon + locked balance | `simulation/` | `$opu-simulation-guardian` |
| gameplay/presentation | canon + design | `app/`, assets | `$opu-design-guardian`, `$opu-visual-qa` |
| content | canon + locked effect contracts | `content/` | deterministic content checks |
| infra | architecture + this file | CI/scripts/config | `npm run validate` |

Do not make a task “full product implementation” when it contains separable lanes.

## 2. Write barriers

### Product canon

`ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` is read-only unless the user's task explicitly changes product truth.

### Balance lock

A coding agent may move a registry entry to `candidate` with evidence. Only an explicit product-owner request may set `status: "locked"`.

### Design canon

`one-person-unicorn-design-context-v2.2/design.md` is read-only for ordinary feature implementation. Change only in an explicit design-system task.

### Whole-screen canonical reference

Do not silently replace an approved reference with a generated interpretation.

## 3. Preflight

Before writing code:

```bash
npm run contract:check
npm run balance:validate
```

Then identify lane, list authority docs read, inspect relevant current paths, identify unresolved balance dependencies, define acceptance checks, and create an exec plan if the task crosses layers or needs multiple phases.

Do not load every long document into working context unless necessary.

## 4. Exec plans

Use `docs/exec-plans/active/` for work that crosses architecture layers, spans multiple rooms/systems, is delegated to multiple agents, requires migration, needs quantitative calibration, or has multiple meaningful checkpoints.

Copy `docs/exec-plans/TEMPLATE.md` and keep it current.

When complete, move it to `docs/exec-plans/completed/` and record validation evidence.

## 5. Parallel agent rules

Parallelize by disjoint ownership.

Good:

```text
Agent A -> simulation cohort model
Agent B -> Marketing presentation using an existing semantic action interface
Agent C -> visual assets
```

Bad:

```text
Agent A -> redesign all simulation state
Agent B -> independently redesign all simulation state
```

Do not have two agents promote balance values for the same surface simultaneously. Prefer worktrees/branches for concurrent tasks.

## 6. Balance-dependent implementation

If a UI/mechanic needs an unresolved number:

- do not hardcode a plausible value into production logic;
- expose the dependency through a typed/configured boundary;
- use a clearly marked fixture for presentation/testing;
- add or update the missing registry surface;
- continue work that does not require pretending the balance is locked.

## 7. Simulation changes

All economic changes require seeded randomness only, invariants, determinism checks, no browser/UI dependency, no live GenAI, and no hidden constants outside the balance layer.

Run:

```bash
npm run sim:smoke
npm run sim:determinism
npm run balance:validate
```

For candidate/locked balance work, run the full quantitative simulator once implemented and attach the report.

## 8. Visible gameplay changes

For each room, define:

`input -> physical response -> local resolution -> simulation action -> consequence -> next decision`

Do not let presentation directly edit ARR/Cash/Valuation.

Run the real pointer gesture, not merely a fallback button. Desktop and mobile both require inspection.

## 9. Completion sequence

Every task:

```bash
npm run validate
```

Visible tasks additionally run the app, exercise interaction, capture desktop/mobile, and perform `$opu-visual-qa`.

Balance lock tasks additionally run:

```bash
npm run balance:lock-check
```

and attach quantitative evidence.

## 10. Failure behavior

Stop and report rather than guessing when product canon conflicts internally; a required balance value is missing and the task cannot be isolated from it; a task requires changing product truth without explicit authority; a required visual reference is absent; or validation fails because of the change.

Do not solve ambiguity by inventing product or economic truth.

## 11. Automation-friendly task prompt

A good task contains:

```text
LANE:
GOAL:
ALLOWED PATHS:
AUTHORITY DOCS:
DO NOT CHANGE:
ACCEPTANCE TESTS:
VALIDATION:
```

For broad work, point the agent to an active exec plan instead of pasting the entire product corpus into every prompt.
