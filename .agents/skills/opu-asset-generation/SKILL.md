---
name: opu-asset-generation
description: Generate custom ONE PERSON UNICORN visual assets with Codex-native image generation when a visible UI/gameplay asset needs authored 3D art, iconography, illustration, textures, or milestone imagery. Use before falling back to a user asset request when image generation is available.
---

1. Read the relevant asset rules in `one-person-unicorn-design-context-v2.2/design.md` and the relevant founder references in `one-person-unicorn-design-context-v2.2/references/visual/`.
2. Generate only the assets needed for the current screen or flow. Do not burn usage generating the entire future library.
3. Use Codex/ChatGPT native `$imagegen` when available. Attach/reference the relevant canonical image when the output must inherit composition, material, silhouette, or family behavior.
4. For UI icons:
   - generate one coherent family per task;
   - transparent background;
   - strong 24–64 px silhouette;
   - hyperrealistic outlined 3D object treatment through contour lighting and separation, not a cartoon stroke;
   - physically believable materials justified by the semantic object;
   - no text, baked card, tile, scene background, emoji, stock-icon geometry, or forced Ethereal/gold/glass finish.
5. For gameplay objects:
   - prioritize a clear physical affordance and interaction state over ornamental complexity;
   - generate neutral/idle assets first, then only the pressed/active/damaged variants the current mechanic actually needs.
6. For Ethereal rarity assets:
   - reserve iridescent liquid-metal behavior for explicit rarity/progression apex states or major bridge moments;
   - never fake it with a CSS rainbow gradient.
7. Inspect generated assets at intended UI size and on the actual near-black background before accepting them.
8. Iterate obvious failures rather than integrating them because generation succeeded technically.
9. If the required family cannot be generated reliably within sensible usage, invoke `$opu-asset-request` with exact destination paths and prompts for the user instead of lowering the visual bar.