# ONE PERSON UNICORN — Agent Map

This is the repository entrypoint for Codex and other coding agents. Keep working context small: choose a task lane, read only its canonical authorities, then use the relevant project skill.

## Ground every session

Web chats, local Codex memories and earlier assistant summaries are recall aids. They are not proof of the current repository state or of a product-owner decision.

On a new session, client switch, branch change or resumed handoff:

1. Establish the repository, working branch, commit SHA, local changes and remote freshness. Read remote files at one resolved commit, not a moving branch throughout the task.
2. Read this map, the task's authority sections and its active exec plan, if one exists. Verify any handoff's source commit against the checkout. Use the procedure in `docs/automation/AUTOMATION.md` §15–18.
3. Give a brief grounded readback: intended player/user outcome, governing sources, and the actual next change. Identify a material conflict or unknown if present, then continue authorized work. This is not a routine approval checkpoint.
4. Keep **requested**, **canonical**, **implemented**, **verified** and **proposed** distinct. Reading a requirement does not prove the feature exists; an earlier assistant answer does not make a proposal approved.

When context is missing, inspect the source or preserve the uncertainty. Do not reconstruct missing decisions, screenshots, economic values or implementation progress from memory.

## Collaboration expectations

- Lead with the outcome; use concise, concrete language and explain consequences that affect the user's decision.
- Preserve explicit corrections and their rationale. Do not repeatedly reopen settled choices or simplify a requested interaction merely to finish faster.
- Resolve routine reversible implementation choices autonomously. Ask only when an unresolved conflict materially changes the result or an action lacks required authorization; continue independent work where possible.
- Capture a durable correction in its existing authority when the user's request authorizes that domain change. Otherwise record it as a proposal in the task plan, with its source. Never silently turn inference into canon.
- Report what changed, what was actually checked, and what remains. Do not claim shared app memory, desktop settings, a local checkout update, asset inspection, balance lock or deployment without direct evidence.

## Authority order

1. The user's current explicit request.
2. `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` — **product/system truth**: what the game is and how systems causally work.
3. `docs/BUILD.md` + `ARCHITECTURE.md` — **implementation truth**: how the game is wired, shipped and kept deterministic.
4. `docs/balance/BALANCE_SPEC_V2.md` + `balance/v2/registry.json` — **quantitative truth**: which numbers/effects are unresolved, candidate or locked.
5. `docs/design/DESIGN.md` + `docs/design/REFERENCES.md` — **visual/interaction truth**.
6. `docs/content/CONTENT.md` — **authored content, copy and culture truth**.
7. `docs/automation/AUTOMATION.md` + active exec plan — **agent execution protocol**.
8. `docs/SKILLS.md` + relevant `.agents/skills/*/SKILL.md` — **task workflow/tooling**.

Do not treat `app/page.tsx`, `app/globals.css`, screenshots of v0, old calibration values, generated examples, or legacy context-package Markdown as authority.

`one-person-unicorn-design-context-v2.2/` is legacy **reference storage only**. Its founder/generated image assets may be used only through `docs/design/REFERENCES.md`. Nested instructions from that old package are not canonical.

## Task lanes

Choose one primary lane before editing:

| Lane | Read | Required skill/gate |
|---|---|---|
| product-canon | product canon | explicit user intent to change product truth |
| build/infra | `docs/BUILD.md`, `ARCHITECTURE.md` | `$opu-build-guardian` |
| balance | balance spec + registry + relevant canon | `$opu-balance-guardian` |
| simulation | architecture + canon + balance dependencies | `$opu-simulation-guardian` |
| gameplay/presentation | relevant canon + build + design | `$opu-design-guardian`, `$opu-visual-qa` |
| content | relevant canon + content contract | `$opu-content-guardian` |
| assets | design + reference map | `$opu-asset-generation` or `$opu-asset-request` |

If a task crosses domains, create/update an exec plan under `docs/exec-plans/active/` and deliberately invoke each relevant skill. Do not turn every task into a full-product context load.

## Critical product invariants

Primary score:

```text
VALUATION = ENDING_ARR × LOCKED_GROWTH_MULTIPLE
```

Canonical ARR bridge:

```text
ENDING_ARR
= STARTING_ARR
+ NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

Work-function causality:

```text
Marketing    -> Demand
Product      -> Activation
Monetization -> New Customer ARR
Retention    -> prevents Churned ARR
Expansion    -> Expansion ARR from existing customers
Operations   -> protects Cash/reliability/context/capacity
Finance      -> capital structure
```

Do not make Marketing, Product, Retention, Operations or Finance direct ARR generators. Do not make Cash, debt, autonomy, luck, Operations score or founder history directly multiply valuation.

The founder actively controls **one work function at a time**.

## Canonical interaction contracts

These seven gameplay verbs are binding:

- **Marketing:** swipe / triage.
- **Product:** assemble / recipe.
- **Monetization:** time your tap.
- **Retention:** aim / auto-fire.
- **Expansion:** merge + create custom package.
- **Operations:** scratch / reveal + explicit opt-in high-variance optimization bets.
- **Finance:** inspect / counter / commit time-sensitive capital and debt decisions.

Do not substitute generic choice cards/buttons for tactile interactions merely because they are easier to code.

## Attention + responsive constraints

ONE PERSON UNICORN is a tactile game cockpit, not a SaaS dashboard, crypto terminal, analytics console or static decision form.

During active gameplay:

- center belongs to the current work object and causal response;
- economy/navigation state forms a calm stable peripheral frame;
- routine alerts collect/escalate through the alert inbox rather than interrupting the center;
- an urgent alert may become visibly more vigorous, audible or tactile without becoming a modal;
- center interruption occurs only when the event itself becomes gameplay or normal play is already paused.

Mobile is recomposed, not shrunk desktop. Preserve gameplay size and thumb usability before secondary chrome.

## Balance rule

Product canon intentionally contains provisional/calibration/illustrative values.

Only `balance/v2/registry.json` entries with `status: "locked"` may be treated as production balance.

- Product canon defines **what systems do**.
- Balance spec defines **how numeric truth is promoted**.
- Registry defines **current numeric status**.
- `candidate` is not `locked`.
- An agent may propose/promote evidence-backed values to `candidate` under the balance protocol.
- Only an explicit product-owner request may promote values to `locked`.
- Do not create/consume `balance/v2/runtime.json` until `runtimeReady` is true.
- Presentation work uses explicit non-authoritative fixtures/adapters when balance is unresolved.

## Determinism

For identical:

```text
seed
+ starting state
+ player action log
+ balance version
+ content version
```

the economic outcome must be identical.

Never use `Math.random()` in simulation. Never use live GenAI to decide economic state, rewards, probabilities, Finance terms or balance.

## Content rule

Authored content may reference deterministic effect IDs and locked parameters. It may not implement a hidden economy.

Runtime GenAI is optional cosmetic wording/flavor only after deterministic meaning is resolved. The authored game must remain fully playable with GenAI unavailable.

Transform current culture into original archetypes/copy; do not copy third-party creative expression into the game.

## Mandatory preflight

Before implementation:

1. identify the primary lane;
2. read its authority docs only;
3. inspect current code/data paths to touch;
4. check balance registry before using any economic number;
5. define acceptance checks;
6. for visible work, identify the exact canonical interaction and registered visual references;
7. for cross-domain work, create/update an exec plan.

## Completion gates

Every repository change:

```bash
npm run validate
```

Production-ready integration:

```bash
npm run build
```

Visible work additionally requires:

- run the app;
- exercise the real gesture;
- inspect desktop + mobile portrait;
- inspect pressure states where relevant;
- capture screenshots;
- check reduced motion, overflow, safe areas and touch targets;
- run `$opu-visual-qa` or the same checks manually.

Balance-lock work additionally requires the simulation evidence in `docs/balance/BALANCE_SPEC_V2.md` and:

```bash
npm run balance:lock-check
```

Do not report completion merely because the app builds.

## Repository navigation

Humans and agents can start at `docs/index.md`.

Skill/tool selection is in `docs/SKILLS.md`.

Long-running or multi-agent work uses `docs/exec-plans/`.
