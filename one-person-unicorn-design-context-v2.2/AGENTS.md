# AGENTS.md — ONE PERSON UNICORN Design Implementation Contract

This repository uses `design.md` as the canonical visual/interaction source of truth. Product mechanics and deterministic economy remain governed by the product/game specification.

## Before changing UI, visual assets, copy, motion or audio

1. Read the relevant section of `design.md`.
2. Identify the user-facing task and the mechanical consequence.
3. Preserve the protected-center / stable-periphery attention architecture during active gameplay.
4. Check mobile portrait and desktop as separate compositions, not a scaled version of one layout.
5. Reuse founder-supplied references only for the specific authority described in `references/visual/INDEX.md`.

## UI icon rule — non-negotiable

For navigation, menus, buttons, headers, labels and other text-adjacent visual accents:
- use a **custom hyperrealistic outlined 3D object image**;
- transparent background;
- strong small-size silhouette;
- integrated lighting, self-shadowing, AO and contour separation inside the asset;
- object/material choices must be semantically justified.

NEVER ship:
- flat icons;
- emojis;
- visible icon-library substitutes;
- generic stock 3D icons;
- forced stone/gold/glass/Ethereal materials on ordinary UI icons.

If image generation is unavailable, expensive, unreliable, or producing weak output, do **not** fake compliance. Use the asset-request workflow in `.codex/skills/opu-asset-request/` and ask the user to generate the requested assets into the specified destination folder.

## Rarity material rule

Material progression belongs only to assets that communicate explicit rarity/progression such as relics, achievements, upgrades, difficulties, ranked collectibles and comparable systems.

- Lower states are contextual and may change by asset family.
- Stone → gold → translucent liquid glass → Ethereal is one enlightenment-themed example, not a universal ladder.
- **Ethereal is always the apex.**
- Ethereal = iridescent liquid metal.

## UX/onboarding rule

Teach through doing:
- one interaction;
- one immediate response;
- one visible consequence;
- next complexity only when relevant.

Do not front-load advanced systems. Reveal exceptions and advanced mechanics on first relevance. Keep tutorials replayable/on-demand.

## Attention rule

During active gameplay:
- important state stays in the peripheral frame;
- the center belongs to the current gameplay object and causal response;
- normal notifications route into the alert inbox/queue and escalate without stealing focus;
- do not use center-screen modals merely to announce rewards, upgrades, queue changes, completions or tutorial copy.

Center interruption is allowed only when the interaction itself becomes the gameplay, an irreversible confirmation is required, or normal gameplay is already paused for a milestone/state transition.

## Stimulation rule

The game can be highly stimulating. It cannot be illegible.

Classify events P0–P4 using `design.md`. For meaningful events, select one lead sensory channel. Do not make particles, screenshake, music, SFX, haptics, number popups and copy all peak at maximum intensity for routine events.

## Copy rule

Player-facing copy must be:
1. mechanically clear;
2. context-specific;
3. human and witty;
4. culturally literate when it adds meaning.

Deep references are bonus meaning, not required meaning. Permanent navigation should skew durable; run-specific events/cards can be more contemporary.

Do not ship generic AI-ish labels when a more ownable phrase can preserve comprehension.

## Motion/audio rule

Motion, SFX and music are gameplay feedback systems. Every effect must have a trigger, purpose, priority and reduced-intensity equivalent.

Critical information must never depend on color, sound, haptics or motion alone.

## Responsive rule

- Mobile portrait is first-class.
- Recompose; do not shrink desktop.
- Maintain the same deterministic state and game rules across viewports.
- Preserve semantic zones even when side rails become drawers/stacks.

## Accessibility rule

At minimum preserve:
- reduced motion;
- screen-shake control;
- flash/effects control;
- separate meaningful audio channels;
- haptic toggle;
- text scale/legibility;
- color-independent state cues;
- replayable instructions/objectives;
- clear touch targets;
- keyboard/pointer access where appropriate.

## Visual QA before completion

For UI work:
1. run the app locally;
2. inspect desktop and mobile portrait;
3. capture screenshots;
4. check hierarchy, center protection, peripheral stability, icon compliance, readability and overflow;
5. test reduced-motion mode;
6. fix visible issues before reporting completion.

Use the `opu-visual-qa` skill when available.

## Design ambiguity

Do not invent a new visual system because a screen is underspecified. Infer from `design.md`, current component patterns and the closest canonical visual reference. Ask only when the missing choice would materially change mechanics, brand identity, or a locked rule.
