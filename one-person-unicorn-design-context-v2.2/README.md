# ONE PERSON UNICORN — Design Context Package

**Version:** 2.2  
**Purpose:** Canonical design context for Codex and human collaborators building ONE PERSON UNICORN.

This package is meant to be copied into the project root. It is not a moodboard dump. It contains the binding product-design rules, project-local Codex skills, visual references, research rationale, asset-generation playbooks, and low-cost tooling guidance needed to keep implementation coherent.

## Source-of-truth order

1. **Product mechanics / deterministic game specification** — rules, math, economy, game state.
2. **`design.md`** — visual, interaction, onboarding, attention, copywriting, motion, audio, accessibility, iconography and rarity-art source of truth.
3. **Founder-supplied visual references** in `references/visual/founder/`.
4. **Project-local Codex skills** in `.codex/skills/`.
5. **Research and external references** — rationale and quality bar only.
6. **Generated examples** — examples of interpretation, never canonical geometry or content.

When anything conflicts, higher items win.

## Locked versus flexible

### Locked
- Structure + Spark monogram geometry and identity grammar.
- MACHINE + SKY brand duality.
- Pastel Ethereal brand-art atmosphere.
- Hyperrealistic outlined contextual 3D image icons on transparent backgrounds for navigation, menus, buttons, headers and text-adjacent UI.
- Strictly no visible flat-icon fallback, emoji fallback, or generic stock iconography.
- Rarity/progression materials are a separate system from ordinary UI icons.
- **Ethereal** means iridescent liquid metal and is always the apex material state for rarity-bearing systems.
- Progressive disclosure, playable micro-tutorials, contextual first-use teaching.
- Stable peripheral HUD / protected center gameplay architecture.
- Ordinary notifications do not interrupt the active center with modals.
- High stimulation is intentional, but sensory channels are orchestrated by event priority.
- Copy is clear first, culturally literate/witty/context-specific second.
- Responsive mobile + desktop are first-class.

### Flexible
- Exact lower rarity materials below Ethereal.
- Exact icon object fusion for each semantic label.
- Exact panel geometry within the responsive attention architecture.
- Exact SFX samples, music composition, particle counts and motion curves, provided the canonical hierarchy is respected.
- Contemporary references in run-specific content, provided comprehension survives without the reference.

## Codex consumption

Codex should:
1. Read `AGENTS.md` first.
2. Read only the relevant sections of `design.md` for the task.
3. Use the project-local skill that matches the task.
4. Inspect the relevant visual references before generating or implementing visuals.
5. Run the visual QA workflow before declaring UI work complete.

Do not dump the entire reference folder into context on every task.

## When visual generation is unavailable or too expensive

**Do not improvise a flat icon, emoji, Lucide/FontAwesome icon, CSS glyph, or generic 3D substitute.**

Instead:
1. Leave the semantic text/component functional.
2. Reserve the intended asset slot without shipping a fake visual substitute.
3. Create a precise asset request under `asset_requests/pending/` using the template in `asset-playbooks/ASSET_REQUEST_WORKFLOW.md`.
4. Tell the user exactly what to generate and the exact destination path.
5. Continue implementation work that does not require the final bitmap.

This is the canonical fallback.

## Key files

- `design.md` — binding design system.
- `AGENTS.md` — Codex operating contract.
- `TOOLS_AND_PLUGINS.md` — low-cost/native Codex visual tooling strategy.
- `.codex/skills/` — project-local reusable workflows.
- `references/visual/INDEX.md` — authority and interpretation of every supplied image.
- `asset-playbooks/` — icon, rarity and asset-request generation contracts.
- `research/RESEARCH_SYNTHESIS.md` — UI/UX/copy/audio/motion conclusions.
- `research/SOURCES.md` — source list.
- `MANIFEST.md` — package inventory and lock summary.

## Conflict handling

If a new user instruction explicitly changes a canonical rule, update `design.md` and the relevant playbook/skill in the same change. Do not accumulate contradictory exceptions in prompts.
