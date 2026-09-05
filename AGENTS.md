# ONE PERSON UNICORN — Codex Repository Contract

This file is the repository-level instruction source for Codex. It exists because visual and interaction work on this project must not fall back to generic dashboard patterns or generic DOM card interactions.

## Source of truth

Before changing product behavior, UI, interaction, visual assets, motion, onboarding, copy, audio, or responsive layout, read the relevant material in this order:

1. `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` — product mechanics, economic truth, work-function behavior.
2. `one-person-unicorn-design-context-v2.2/design.md` — binding visual, interaction, motion, responsive, accessibility, iconography, attention, and game-feel rules.
3. `one-person-unicorn-design-context-v2.2/references/visual/INDEX.md` — authority of every visual reference.
4. `CODEX_REBUILD_BRIEF.md` — implementation acceptance criteria for the current rebuild.
5. Relevant skill in `.agents/skills/`.

Do not treat the existing `app/page.tsx` or `app/globals.css` as design authority. They are v0 implementation evidence and may be replaced.

## Mandatory preflight for visible or interactive work

Before implementation:

- state which canonical files you read;
- identify the exact core interaction verb for the room being changed;
- inspect the relevant visual references rather than relying on remembered style language;
- if a required canonical whole-screen screenshot is missing from the repository, say so before final visual polish and create an asset/reference request rather than silently inventing a new shell;
- define the visible causal chain: player input → physical response → system consequence → economic/pressure consequence → next decision.

Do not begin a broad UI rebuild by styling existing cards. Establish composition, interaction, and object behavior first.

## Product shell: hard constraint

ONE PERSON UNICORN is a game cockpit, not a management dashboard, admin console, analytics product, terminal skin, or SaaS control panel.

The approved desktop composition is:

- compact top economy HUD for valuation, ARR, cash, quarter/run state, and critical company pressure;
- stable left work-function switcher;
- the active tactile work function owns most of the visual center;
- right-side build/agents/relics/skill/alert state only when useful;
- central or near-central alert inbox may attract attention through escalation, but ordinary alerts do not obstruct active gameplay;
- inactive systems create pressure through badges, queue state, motion, audio/haptic cues, and visible routing rather than more panels.

Reject any screen whose center reads primarily as a form, settings panel, metric card collection, or three-button decision dashboard.

A useful self-test: if the screenshot could plausibly be a dark Linear, Datadog, Bloomberg-lite, crypto terminal, or generic AI SaaS dashboard after changing the labels, the screen is wrong.

## Center ownership

The center is gameplay territory.

During active play it must prioritize:

1. the current physical work object or moving gameplay field;
2. immediate causal response to the player's action;
3. ARR/cash/valuation/pressure consequence;
4. current opportunity or crisis;
5. background machine activity.

Ordinary notifications, reward popups, upgrade announcements, tutorial paragraphs, and agent completion messages must not steal the center.

## Canonical work-function interaction contracts

Do not replace these with convenient click-card substitutes.

### Marketing — SWIPE / TRIAGE

- The opportunity itself is a tactile swipe object.
- LEFT = ignore, RIGHT = pursue, UP = aggressively pursue.
- It must work with touch/mouse/trackpad through pointer gestures.
- Buttons may exist only as accessibility/replay alternatives, not as the primary fantasy.
- Dragging must produce physical response: translation, rotation/tilt, resistance, threshold feedback, and release resolution.

### Product — ASSEMBLE / RECIPE

- Components are manipulated into a deterministic recipe.
- Use drag, snap, combine/merge, bounce/rework behavior, verification, and ship state.
- A list of buttons that advance a recipe is not acceptable.

### Monetization — TIME YOUR TAP

- A moving pricing cursor/band is the active object.
- One tap/pointer action resolves the opportunity.
- Timing, band movement, segment differences, impact response, and resulting ARR must be immediately legible.

### Retention — AIM / AUTO-FIRE

- Threats move toward churn.
- Founder moves one pointer to prioritize targets; intervention fires automatically.
- The skill is prioritization under pressure, not clicking rows of cards.

### Expansion — MERGE / CREATE CUSTOM PACKAGE

- Existing customer needs drive the board.
- Modules are dragged/merged through tactile chains and assembled into a package.
- A static six-cell diagram plus one package button is not acceptable.

### Operations — SCRATCH / REVEAL + high-variance traps

- Obligations are problems already happening; evidence is physically revealed.
- Optimization scratchers are optional high-variance bets, not guaranteed rewards.
- Clicking one of two generic cards is not a substitute for scratch/reveal interaction.

### Finance — active capital decisions

- Finance can use time-sensitive offer/card language where the product mechanic calls for it.
- It must remain connected to cash, debt, ownership, growth credibility, and ongoing company operation.
- Finance does not directly create valuation.

## Rendering contract

Use DOM/React for persistent accessible product chrome: HUD, metrics, labels, settings, financing details, tooltips, install/PWA affordances, semantic text, and accessibility equivalents.

Use Canvas/WebGL or another genuinely tactile rendering layer for room interactions that require dragging, merging, aiming, scratch/reveal, physical routing, moving threats, particles, or object choreography. Adding an appropriate lightweight rendering/game dependency is permitted when required by the mechanic. Do not preserve a DOM-only implementation just to avoid a dependency.

Authoritative simulation state must remain deterministic and independent of viewport or renderer.

## Visual direction

The gameplay plane is MACHINE:

- near-black graphite;
- restrained dark luxury;
- calm financial instrumentation;
- tactile premium manufactured objects;
- local lighting and material response;
- compressed information only when pressure demands it.

The aspirational plane is SKY:

- pastel cyan/lavender/blush atmosphere;
- monumental depth and reflective environments;
- reserved for brand/editorial/milestone bridge moments rather than ordinary HUD surfaces.

Do not solve visual authorship with neon outlines, rainbow gradients, glassmorphism, cyberpunk styling, crypto-terminal density, gamer RGB, or excessive bordered panels.

## 3D icon rule

Navigation, menu, header, label, and text-adjacent iconography uses custom hyperrealistic outlined 3D image assets on transparent backgrounds as defined in design canon.

Never ship a visible flat-icon, emoji, text abbreviation, or generic stock 3D icon as the final replacement for a required custom object.

If final assets are unavailable, preserve the component and create an exact request through `$opu-asset-request`; do not pretend the placeholder is finished.

## Motion and game feel

Interaction response begins immediately. Ordinary actions use microphysics; meaningful events use one lead sensory channel; only run-defining moments earn cinematic treatment.

Every tactile mechanic should communicate weight, friction, magnetic snap, spring, machining, compression, impact, fluidity, or another physically meaningful response appropriate to the object.

Do not add decorative motion merely to make a dashboard feel alive.

## Responsive contract

Mobile portrait and desktop are separate compositions, not scaled versions of one another.

The same deterministic state and room mechanics must survive both. On compact screens collapse secondary chrome before shrinking the active interaction below usable touch size.

All core interactions work with one pointer and no hover, right-click, keyboard shortcut, or multitouch requirement.

## Visual QA is a completion gate

Visible work is not complete until Codex:

1. runs the app;
2. captures desktop and mobile screenshots;
3. compares them against the canonical design rules and available reference screenshot(s);
4. checks whether the center is truly gameplay rather than a card dashboard;
5. tests the actual gesture, not only the resulting state mutation;
6. checks reduced motion, overflow, touch targets, and responsive recomposition;
7. fixes visible failures before reporting completion.

Use `$opu-visual-qa`.

Do not report success because the app builds or because every button works.

## Rebuild behavior

For the current v0 shown in the initial commit, preserve product/economic truth but assume the present visual composition and simplified room implementations are disposable. Refactor rather than cosmetically reskinning them.

The desired outcome is an authored tactile game system with a calm peripheral instrument frame, not a polished version of the current dashboard.