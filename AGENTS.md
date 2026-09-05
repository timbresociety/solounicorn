# ONE PERSON UNICORN — Agent Map

This file is the repository-level map for Codex and other coding agents. Keep it short. Read deeper documents only when the task touches them.

## Authority order

1. The user's current explicit request.
2. `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` — canonical product/system behavior.
3. `ARCHITECTURE.md` — layer boundaries, dependency direction, determinism contract.
4. `docs/balance/BALANCE_SPEC_V2.md` + `balance/v2/registry.json` — quantitative authority and lock status.
5. `one-person-unicorn-design-context-v2.2/design.md` + `references/visual/INDEX.md` — visual/interaction authority.
6. `CODEX_REBUILD_BRIEF.md` — current presentation rebuild acceptance criteria.
7. `docs/automation/AUTOMATION.md` + active exec plan — task execution protocol.
8. Relevant skill under `.agents/skills/`.

Do not treat `app/page.tsx`, `app/globals.css`, screenshots of v0, or old calibration numbers as authority.

## Critical balance rule

`ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` intentionally contains `PROVISIONAL`, `CALIBRATION REFERENCE`, `CALIBRATION-ELIGIBLE`, illustrative, and `NOT YET LOCKED` values.

Never silently promote those into production balance.

- Product canon defines **what the systems do**.
- `docs/balance/BALANCE_SPEC_V2.md` defines **how numbers become implementation truth**.
- `balance/v2/registry.json` defines the current machine-readable status of each quantitative surface.
- Only entries with `status: "locked"` may be treated as production balance.
- `candidate`, `provisional`, `calibration`, and `missing` values may be used only in simulation/calibration work or clearly non-authoritative UI fixtures.
- Do not create or consume `balance/v2/runtime.json` until `runtimeReady` is true.
- A coding agent may promote evidence-backed values to `candidate`; only an explicit product-owner request may promote them to `locked`.

Use `$opu-balance-guardian` for balance work and `$opu-simulation-guardian` for deterministic simulation work.

## Architecture rules

Dependency direction:

`PRODUCT CANON -> BALANCE -> SIMULATION -> PRESENTATION`

Additional inputs:

`CONTENT -> SIMULATION`
`DESIGN CANON -> PRESENTATION`
`OPTIONAL GENAI -> PRESENTATION/WORDING ONLY`

Never reverse these dependencies.

Economic state, probabilities, ARR, cash, valuation, debt, cohort flow, agent reliability, skill effects, strategies, Relics, Complexity, Rot, and seeded randomness belong outside React presentation code.

Runtime GenAI must never determine economic outcomes.

## Task lanes

Choose one primary lane before editing:

- **product-canon** — changes to product/system truth. Requires explicit user intent.
- **balance** — equations, parameter values, simulation calibration, registry status.
- **simulation** — deterministic engine, state transitions, invariants, seeded RNG.
- **gameplay/presentation** — room interaction rendering, HUD, responsive UI, motion, accessibility.
- **content** — authored recipes, archetypes, Relics, Strategies, culture packs.
- **infra** — build, CI, tooling, repository harness.

If a task crosses lanes, create/update an exec plan in `docs/exec-plans/active/` before broad edits.

## Mandatory preflight

Before implementation:

1. State the primary lane.
2. Read only the relevant authority docs from the list above.
3. Inspect the current code paths you will touch.
4. Check `balance/v2/registry.json` before using any economic number.
5. Define acceptance tests before changing code.
6. For visible work, identify the exact canonical interaction verb and inspect relevant visual references.
7. For cross-layer work, create an active exec plan.

## Gameplay interaction contracts

The seven canonical verbs are not optional:

- Marketing — swipe / triage.
- Product — assemble / recipe.
- Monetization — time your tap.
- Retention — aim / auto-fire.
- Expansion — merge / custom package.
- Operations — scratch / reveal + explicit high-variance bets.
- Finance — active time-sensitive capital decisions.

Do not replace tactile mechanics with generic button-card UI for convenience.

## Presentation hard constraints

ONE PERSON UNICORN is a tactile game cockpit, not a SaaS dashboard, crypto terminal, analytics console, or static decision form.

The active work object owns the perceptual center. Persistent economy/navigation state forms a calm peripheral frame. Mobile is recomposed, not shrunk desktop.

Use `$opu-design-guardian` for visible changes and `$opu-visual-qa` before completion.

## Determinism

For identical:

`seed + starting state + player action log + balance version + content version`

the economic outcome must be identical.

No `Math.random()` in simulation code. No live LLM output in economic resolution.

## Completion gates

Run:

```bash
npm run validate
```

For production/balance-lock work also run:

```bash
npm run balance:lock-check
```

For visible work also:

- run the app;
- exercise the real gesture;
- inspect desktop and mobile;
- capture screenshots;
- fix failures before reporting completion.

Do not report completion because the app merely builds.

## Repository navigation

Start at `docs/index.md`.

Long-running or multi-agent work must use `docs/exec-plans/`.
