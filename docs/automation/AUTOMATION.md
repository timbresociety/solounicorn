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

Do not add `AGENTS.override.md` at any repository level, case variants of agent instruction filenames, or nested `.agents/skills/` trees. An override can prevent the canonical root map from loading. Personal/global instructions outside this repository remain outside this repository check.

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

## 15. Web / desktop startup and freshness

The portable handoff is the repository plus the current task record. Do not assume the other client can see this conversation, local memories, uncommitted changes, installed tools or screenshots.

### Local checkout

Before implementation, inspect:

```bash
git status --short --branch
git rev-parse HEAD
git branch --show-current
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
```

No upstream and detached HEAD are valid states to report, not reasons to invent a branch or silently switch one. Inspect the relevant working diff as well as committed files.

When remote access is available, fetch the relevant remote and compare the intended branch with its freshly fetched ref. A cached `origin/main` alone does not prove freshness. If access is unavailable, report the source SHA and say remote freshness is unverified; continue work that is valid against that snapshot.

For a supplied handoff commit, verify whether it is present in the current history and inspect subsequent changes to the task's authority files. An ancestor check is useful but does not prove that later commits preserved every correction.

Use the branch/worktree intended by the task. Preserve local edits. Do not reset, auto-stash, discard changes, merge an unrelated branch or change global configuration just to make a handoff match. If the checkout predates a required correction, resolve the source mismatch before dependent implementation.

After updating repository guidance, start a fresh desktop task or explicitly reread the changed instructions and re-ground the current task. Do not assume a running session has reloaded them.

### Web / GitHub-only access

Resolve the requested branch (or the repository's actual default branch) to a commit SHA once. Read authority and implementation files at that SHA. Recheck the branch before writing; reconcile intervening edits instead of overwriting them.

Remote access cannot verify the user's desktop checkout, local settings or uncommitted work. State that limit when relevant. A PR is a reviewable handoff; it is not proof that the desktop has adopted it.

### Startup readback

Keep this to a few lines:

```text
Source: repository, branch/ref, SHA; local changes and remote freshness if relevant.
Intent: the outcome requested now, grounded in the relevant authority sections.
Next: the concrete change and acceptance check; any material unresolved conflict.
```

Continue after the readback without asking the user to approve routine implementation choices. Re-run grounding when source authority changes or context is compacted.

## 16. Reconcile understanding without inventing decisions

Use the authority order in root `AGENTS.md`. Within that order, distinguish evidence:

| Evidence | Treatment |
|---|---|
| Current explicit user instruction | Defines the current task and may authorize a change to its relevant authority |
| Current canonical section / locked registry entry | Governs the corresponding domain |
| Code, run output, screenshot or CI result | Establishes only the behavior or check actually observed, at its recorded revision |
| Earlier explicit user correction | Find its current authority or record its provenance; resolve a material conflict with newer sources |
| Assistant draft, generated example, memory summary or inference | Retrieval hint or proposal; never silently promote it to an accepted decision |

For recurring misunderstandings, locate the correction and read its current governing section. The merged [context consolidation in PR #3](https://github.com/timbresociety/solounicorn/pull/3) and `../exec-plans/completed/2026-09-06-context-consolidation.md` explain the recent repairs; they are historical evidence, not a replacement canon.

| Drift to check when relevant | Current source |
|---|---|
| Work-function count, Product/Expansion gestures and Finance's role | `../BUILD.md` §7; `../design/DESIGN.md` §3; relevant product sections |
| Alert interruption and protected gameplay attention | `../design/DESIGN.md` §4 |
| Design references versus generated examples or missing images | `../design/REFERENCES.md` |
| Provisional numbers being described as final balance | `../../balance/v2/registry.json`; `../balance/BALANCE_SPEC_V2.md` |
| A documented V2 feature being reported as implemented | Actual code and run evidence; `../BUILD.md` §19 |

Load only the rows needed by the task. Do not import rules from another user project because its name, aesthetic or game genre resembles this one.

When evidence conflicts, cite the two sources, explain the concrete consequence, and resolve only the blocking choice. Do not silently choose whichever version is easiest to implement.

## 17. Write corrections back once

For each durable correction, record in the task's existing exec plan:

- source: the explicit user instruction (brief task-relevant excerpt or accurate summary), or commit/PR and authority section;
- status: accepted instruction, implementation decision or unapproved proposal;
- meaning and rationale: what changes in behavior and which interpretation it supersedes;
- destination: the existing authority section that owns the rule;
- verification: observable acceptance evidence when it has been implemented.

Update the owning authority only when the task authorizes that domain change under §3. Link from workflow notes; do not create another product/design master, personal-profile dump or copied chat transcript. If an old summary conflicts with an authoritative correction, stop using that summary as implementation guidance.

A task-level implementation choice does not become a product-owner decision just because an agent completed it. Unapproved proposals remain explicitly unapproved.

## 18. Resume and completion handoff

Maintain the resume checkpoint in `../exec-plans/TEMPLATE.md` for multi-step or cross-client work. It must identify the source revision, current request, relevant authorities, decisions and open questions, completed work with evidence, and the next executable step.

Before switching clients or ending unfinished work, update that checkpoint. Before resuming, compare it with the actual checkout and current request. Inspect relevant changes since its recorded source revision; do not replay already completed work or claim that stale checks cover new edits.

For a short task, put the same essential information in the PR/completion record without creating a new plan solely for ceremony.

Completion reports must distinguish:

- what was requested and what changed;
- checks actually executed, their result and source revision;
- implementation that remains incomplete;
- open proposals or unresolved balance;
- publication state: local changes, branch/PR, merged or deployed.

`npm run validate` establishes its named repository checks. It does not prove that the agent understood every requirement or that all gameplay is implemented. Never report a required-but-unrun check as passing.

### Client behavior references

Verified 2026-09-05 UTC: OpenAI documents separate ChatGPT web and local Codex memory stores, and recommends checked-in guidance for required rules. Codex discovers project instructions at session startup, with override files taking precedence. See [Memories](https://learn.chatgpt.com/docs/customization/memories) and [AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Check current documentation before making additional claims about a client's settings or sync behavior.
