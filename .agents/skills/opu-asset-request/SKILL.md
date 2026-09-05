---
name: opu-asset-request
description: Create a precise handoff when ONE PERSON UNICORN needs final visual or audio assets that the current agent environment cannot generate at the required quality. Use instead of silently shipping weak placeholder art or audio.
---

1. Read `AGENTS.md`, the relevant rules in `docs/design/DESIGN.md`, `docs/design/REFERENCES.md`, and when copy/content is involved `docs/content/CONTENT.md`.
2. Identify the exact component/state, semantic function, and final destination path.
3. Create `asset_requests/pending/<asset-slug>.md`.
4. Include:
   - screen/component usage;
   - semantic function and player state;
   - exact destination filename(s);
   - dimensions/aspect ratio/transparency/format or audio duration/loop/mix role;
   - required states/variants;
   - semantic object/fusion logic where visual;
   - camera, lighting, material, silhouette and family requirements where visual;
   - trigger, sonic role and mix behavior where audio;
   - complete ready-to-use generation/production brief;
   - exact registered references allowed by `docs/design/REFERENCES.md`;
   - reject conditions;
   - final-size/in-product acceptance checks.
5. Keep functional implementation moving while keeping the unresolved final-art slot explicit.
6. Tell the user exactly which file(s) to create and where to place them.
7. When the asset appears, validate it in the actual product before marking the request fulfilled.

Do not point an asset producer at the whole legacy design package. Give the minimum canonical brief and exact registered references needed.