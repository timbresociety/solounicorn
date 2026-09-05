# ONE PERSON UNICORN — Visual/Gameplay Rebuild Runbook

This runbook is for the current presentation rebuild lane. Repository-wide automation rules live in `docs/automation/AUTOMATION.md`.

Do not ask one Codex task to infer visual direction, redesign the shell, implement seven minigames, generate assets, rebalance the economy, and QA everything at once.

## One-time preflight

```bash
npm run contract:check
npm run balance:validate
```

In Codex, verify that root `AGENTS.md` and project skills are discovered.

Relevant repo skills:

```text
$opu-design-guardian
$opu-visual-qa
$opu-asset-generation
$opu-asset-request
$opu-simulation-guardian
$opu-balance-guardian
```

For visual/gameplay tasks, balance registry status is read-only.

## Required visual reference

Approved reference destination:

```text
one-person-unicorn-design-context-v2.2/references/visual/founder/canonical-game-shell-desktop.png
```

A text design system is not a substitute for a whole-screen composition guardrail.

## Pass 1 — shell composition

Read `AGENTS.md`, relevant canonical sections, `ARCHITECTURE.md`, `CODEX_REBUILD_BRIEF.md`, relevant shell/attention/responsive design sections, and the canonical desktop reference.

Rebuild only the global shell and Marketing active-room composition.

Do not preserve current v0 composition. Do not alter balance or implement all seven rooms.

Acceptance: approve desktop and mobile shell screenshots before expanding room implementation.

## Pass 2 — Marketing interaction

Implement canonical swipe/triage:

- left ignore;
- right pursue;
- up aggressively pursue;
- pointer gestures;
- translation/tilt/resistance;
- visible thresholds;
- release resolution;
- accessibility alternative.

The gesture emits a semantic simulation action. It does not directly mutate ARR/Cash/Valuation in UI code.

If the economic consequence depends on unresolved registry values, use an explicit fixture/adapter and keep it non-authoritative.

Exercise the real gesture and run `$opu-visual-qa`.

## Pass 3 — one room at a time

Repeat for Product, Monetization, Retention, Expansion, Operations, and Finance.

Each room must pass its acceptance test in `CODEX_REBUILD_BRIEF.md` before the next is considered complete.

Do not batch all room interactions into one generation.

## Pass 4 — assets

Generate only assets visible in the approved shell/current room. Use `$opu-asset-generation`.

If final quality cannot be reached sensibly, use `$opu-asset-request` with exact destination paths rather than lowering the bar.

## Pass 5 — responsive + pressure states

Recompose for mobile portrait from the same semantic state/action model.

Test normal, busy, and urgent/crisis states. Ordinary alerts may escalate but must not cover active gameplay.

## Pass 6 — integration

Once presentation actions are stable, connect them to deterministic simulation adapters. Use `$opu-simulation-guardian`.

Do not hide provisional balance values in adapters. Keep unresolved numeric dependencies explicit.

## Pass 7 — final QA

```bash
npm run validate
npm run build
```

Then run real gestures on desktop and mobile, capture normal + high-pressure screenshots, check reduced motion/overflow/touch targets, and compare against canonical reference.

Use `$opu-visual-qa` and fix failures before reporting completion.

## Stop conditions

Do not call a pass complete while any remain true:

- center is primarily a static card/form;
- canonical tactile verb is a click substitute;
- screenshot resembles generic dark SaaS/admin/crypto UI;
- presentation directly owns economic truth;
- unresolved balance was silently hardcoded;
- final required custom art is still a fake placeholder;
- only desktop was inspected;
- no screenshot iteration occurred;
- `npm run validate` fails.
