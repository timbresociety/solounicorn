# ONE PERSON UNICORN — Codex Rebuild Runbook

Do not ask one Codex turn to infer the visual system, redesign the shell, implement seven minigames, generate assets, and QA everything at once. Use staged passes with explicit acceptance gates.

## One-time setup

Inside Codex, install the official OpenAI frontend design skill:

```text
$skill-installer frontend-skill
```

The repository already exposes these project skills from `.agents/skills/`:

```text
$opu-design-guardian
$opu-visual-qa
$opu-asset-generation
$opu-asset-request
```

Trust the repository so `.codex/config.toml` loads the Playwright MCP configuration.

Before starting a fresh session, verify instruction discovery:

```text
List the instruction files and repo skills you loaded for this project. Do not modify code yet.
```

Expected project instruction source includes root `AGENTS.md`. Expected repo skills include the four OPU skills above.

## Required visual reference

Copy the approved whole-screen screenshot from the Design Direction Summary conversation to:

```text
one-person-unicorn-design-context-v2.2/references/visual/founder/canonical-game-shell-desktop.png
```

Attach that screenshot to the first visual-design turn as well. A text design system is not a substitute for a whole-screen visual guardrail.

## Pass 1 — shell composition only

Use a fresh Codex turn. Low or medium reasoning is preferred for this composition pass.

Prompt:

```text
$frontend-skill $opu-design-guardian

Read AGENTS.md, CODEX_REBUILD_BRIEF.md, the canonical product context, the relevant shell/attention/responsive sections of design.md, and the canonical desktop screenshot.

Do not preserve the current v0 composition. Do not implement all seven room mechanics yet.

Rebuild only the global shell and Marketing active-room composition so the first viewport reads as one authored game cockpit, not a dashboard. The active Marketing work object must dominate the center. The surrounding HUD/function switcher/alert-build context must feel calm, stable, and subordinate.

Use the screenshot as composition/hierarchy authority, while enforcing the latest interaction canon. Avoid dashboard-card mosaics, excessive rounded panels, neon terminal styling, pill soup, and static decision-form layout.

Run the app and use Playwright to capture desktop and mobile screenshots. Iterate until the screenshots pass AGENTS.md and CODEX_REBUILD_BRIEF.md. Do not report completion after the first rendered version.
```

Acceptance gate: approve the shell screenshot before expanding room implementation.

## Pass 2 — Marketing interaction

Use high reasoning if needed for gesture physics and state integration.

```text
$opu-design-guardian

Keep the approved shell. Replace Marketing's button-first implementation with the canonical swipe/triage interaction: left ignore, right pursue, up aggressively pursue. Use pointer gestures with translation, tilt, resistance, threshold feedback, release resolution, and accessibility alternatives. Preserve deterministic economic state. Do not redesign the shell.

Exercise the real gesture with Playwright or equivalent browser interaction, capture the resolved state, and run $opu-visual-qa.
```

## Pass 3 — one room at a time

Repeat the same pattern for Product, Monetization, Retention, Expansion, Operations, and Finance.

Do not batch all rooms into one visual-design turn. Each room must pass its canonical interaction test in `CODEX_REBUILD_BRIEF.md` before moving on.

## Pass 4 — assets

For only the assets visible in the approved shell/current room:

```text
$opu-asset-generation

Generate the required custom 3D asset family using native $imagegen and the canonical founder references. Integrate only assets that pass the intended-size silhouette test on the actual dark UI. If generation quality or usage becomes unreasonable, fall back to $opu-asset-request with exact destination paths instead of generic placeholders.
```

Do not generate the entire future library upfront.

## Pass 5 — responsive + pressure states

After the core rooms are real interactions:

```text
$opu-design-guardian $opu-visual-qa

Recompose the approved desktop cockpit for mobile portrait. Preserve the same state and interaction verbs. Collapse secondary chrome before shrinking the active room. Test normal, busy, and urgent alert states. Ordinary alerts must escalate without covering active gameplay.
```

## Pass 6 — final QA

```text
$opu-visual-qa

Run visual and interaction QA across desktop and mobile. Capture screenshots for normal operation and at least one high-pressure state. Exercise the real gestures. Compare against the canonical screenshot and design rules. Fix every failure you identify before reporting completion.
```

## Stop conditions

Codex must not call a pass complete when any of these remain true:

- the center is primarily a static card/form;
- a canonical tactile room verb is still a click-button substitute;
- the screenshot can be relabeled into a generic dark SaaS/admin dashboard;
- required final custom 3D art is represented by acronyms/emoji/stock icons without being explicitly marked as pending;
- only desktop was inspected;
- no screenshot-based visual iteration occurred.