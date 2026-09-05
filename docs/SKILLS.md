# ONE PERSON UNICORN — Agent Skills + Tooling Map

Status: BINDING AGENT CAPABILITY MAP FOR V2

Project skills live only under repository-root `.agents/skills/`.

Do not create nested `.codex/skills`, nested `AGENTS.md` files, or self-contained context packages inside the repository. They create competing instruction scopes and stale copies of product truth.

## 1. Required project skills

| Skill | Use when | Primary authorities |
|---|---|---|
| `$opu-build-guardian` | implementation architecture, PWA, state boundaries, responsive integration, infra/build/tooling | `docs/BUILD.md`, `ARCHITECTURE.md` |
| `$opu-simulation-guardian` | deterministic engine, state transitions, cohorts, queues, agents, Finance, Complexity/Rot | `ARCHITECTURE.md`, product canon, balance contract |
| `$opu-balance-guardian` | equations, numeric values, costs/effects, probability, pacing, calibration | balance spec + registry + simulator |
| `$opu-design-guardian` | any visible UI/UX/gameplay/motion/audio/icon/brand change | product canon, `docs/design/DESIGN.md`, `docs/BUILD.md` |
| `$opu-visual-qa` | before declaring visible work complete | design canon + actual running app/screenshots |
| `$opu-content-guardian` | Relics, Strategies, recipes, incidents, Founder Histories, culture packs, tutorials, player-facing copy | product canon, `docs/content/CONTENT.md` |
| `$opu-asset-generation` | authored icon/object/brand artwork needed for the current implemented surface | design canon + reference map |
| `$opu-asset-request` | final visual/audio asset cannot be produced at required quality in current environment | design/content canon + exact implementation slot |

A skill is a workflow/gate, not a competing source of product truth.

## 2. Skill combinations by task

### Visible gameplay feature

Use:

```text
$opu-build-guardian
+ $opu-design-guardian
+ $opu-visual-qa
```

Add `$opu-simulation-guardian` when the feature changes/consumes deterministic state.

Add `$opu-balance-guardian` only if quantitative values/effects change.

Add `$opu-asset-generation` when final authored visuals are required; fall back to `$opu-asset-request` rather than shipping weak substitutes.

### Economic/system feature

Use:

```text
$opu-simulation-guardian
+ $opu-balance-guardian when quantitative
```

If it becomes player-visible, also use build/design/visual QA.

### Authored content

Use:

```text
$opu-content-guardian
```

Add balance/simulation guardians if the content proposal needs a new effect or changes an effect contract. Content work may not invent the effect locally.

### PWA/build/infra/refactor

Use:

```text
$opu-build-guardian
```

Add relevant domain guardian whenever the refactor crosses a domain boundary.

### Design-only system work

Use:

```text
$opu-design-guardian
+ $opu-visual-qa when implemented
```

Design-system changes require explicit user intent because `docs/design/DESIGN.md` is binding authority.

## 3. Required tool baseline

### Repository-native shell + validation

Agents must use the repository scripts rather than replacing validation with ad-hoc checks.

Minimum completion gate:

```bash
npm run validate
```

Production-ready integration:

```bash
npm run build
```

### Browser automation

Playwright is the primary browser/visual QA tool for this repo.

Project-local Codex config already declares Playwright MCP. Use it for:

- localhost interaction;
- actual pointer gestures;
- desktop/mobile viewport checks;
- screenshots;
- accessibility/DOM inspection;
- repeatable regression flows.

Do not add a second browser MCP merely because it exists.

### Native image generation

When available in the agent environment, use native image generation for small, reviewed batches of:

- custom 3D UI icons;
- gameplay object art;
- brand/editorial imagery;
- rarity assets;
- visual explorations.

Generate the family needed for the current surface, inspect it at final size, and iterate. Do not burn compute mass-generating the whole future asset catalogue before the visual family is approved.

## 4. Optional tools: add only for a real need

### Chrome DevTools

Useful when the task specifically needs:

- performance profiling;
- layout/paint diagnosis;
- network debugging;
- console/runtime investigation beyond Playwright.

Do not install it by default alongside Playwright for ordinary UI work.

### Figma round-trip

Useful when editable design-canvas exploration or implementation-to-design/design-to-implementation handoff materially improves the task.

Figma is an accelerator, not design authority. `docs/design/DESIGN.md` remains binding.

### Product-design/prototyping tools

Use when available and genuinely useful for flow audit/prototyping. They do not override the product, build or design canons.

### Remotion / motion rendering

Useful for trailer, campaign motion or isolated choreography studies.

Do not use rendered video as a substitute for production runtime interaction/motion.

## 5. Audio tooling policy

Do not introduce an expensive generative-audio service merely to unblock an engineering task.

Agents may:

- implement Web Audio/HTML audio playback and mixing;
- use clearly non-final procedural tones for engineering verification;
- define exact final SFX/music requirements.

If approved final audio cannot be created in the current environment, use `$opu-asset-request` and specify destination paths, trigger, duration/loop behavior, mix role, reject conditions and required variants.

Never quietly treat an engineering beep or silence as final audio design.

## 6. 3D tooling policy

The canonical icon language is **3D-looking rendered image assets**, not a mandate for runtime 3D.

Do not add Three.js, Babylon, Blender pipelines or another runtime 3D dependency just to render navigation icons.

Use real runtime 3D only when the gameplay/scene materially needs geometry, camera, depth, lighting or physics that cannot be delivered sensibly through the current presentation stack.

If a major new runtime dependency is proposed, `$opu-build-guardian` must justify its user-facing benefit, performance impact and mobile cost.

## 7. Asset handoff policy

When the agent cannot create final art/audio at the required bar:

```text
DO NOT LOWER THE BAR
→ CREATE EXACT ASSET REQUEST
→ KEEP IMPLEMENTATION SLOT EXPLICIT
→ TELL USER THE EXACT FILE(S) + DESTINATION
→ VALIDATE ON ARRIVAL
```

Asset requests live under `asset_requests/pending/`.

A request must include:

- component/screen use;
- semantic purpose;
- exact filenames/destination;
- dimensions/aspect/transparency/format;
- visual/audio direction;
- generation or production prompt/brief;
- required variants/states;
- reject conditions;
- integration acceptance test.

## 8. Tool-cost discipline

Prefer:

1. repository-native capabilities;
2. Codex/native model capabilities already available;
3. one primary browser tool;
4. optional specialized tool only when the task requires it;
5. user-supplied/generated asset handoff when specialized generation would be expensive or unreliable.

Do not build an expensive dependency stack as a substitute for good specifications.

## 9. Tool security

Browser/MCP tools may inspect browser state.

Use isolated test profiles where practical. Do not expose unrelated logged-in sessions, credentials or sensitive data to a tool merely to capture a screenshot.

Do not commit secrets or local credentials to project Codex configuration.

## 10. Skill authoring rules

Every repository skill must:

- have one clear domain;
- point to canonical authority rather than duplicate it;
- state when it is required;
- define preflight and completion gates;
- avoid hardcoding product/balance/design truths that belong in canonical docs;
- remain short enough for agents to load without swallowing the whole repository context.

When canonical truth changes, update the canon first. Skills should rarely need product-specific rewrites beyond path/gate changes.

## 11. Agent context-loading rule

`AGENTS.md` is the entrypoint and map.

An agent should read only the authority required for its lane. Do not load the product canon, full design canon, balance registry and every skill into context for a trivial infra edit.

For cross-domain work, create/use an exec plan and deliberately load each authority needed.

The goal is **small working context with strong source-of-truth routing**, not one giant prompt.
