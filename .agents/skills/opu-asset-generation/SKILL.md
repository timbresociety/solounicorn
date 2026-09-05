---
name: opu-asset-generation
description: Generate custom ONE PERSON UNICORN visual assets when a current implemented surface needs authored 3D art, iconography, illustration, textures, rarity assets, or milestone imagery and image generation is available.
---

1. Read `AGENTS.md`, the relevant asset rules in `docs/design/DESIGN.md`, and `docs/design/REFERENCES.md`.
2. Generate only assets needed for the current screen/flow. Do not mass-generate the future catalogue before a family is approved.
3. Use native image generation when available. Supply the exact registered founder reference when inheritance of geometry, material behavior or atmosphere is required.
4. For ordinary UI icons:
   - create one coherent family per task;
   - use transparent backgrounds;
   - preserve a strong silhouette at intended UI size;
   - use hyperrealistic 3D object treatment and contour separation, not a cartoon stroke;
   - choose materials from the semantic object;
   - bake no text, card, tile or opaque scene background into the icon;
   - do not force Ethereal, gold, stone or glass onto utility icons.
5. For gameplay objects, prioritize obvious physical affordance, readable state and interaction over ornament. Generate only state variants the implemented mechanic uses.
6. For rarity-bearing assets, use a semantic progression and reserve Ethereal iridescent liquid metal for the apex when that family uses a material ladder.
7. Never change Structure/Spark monogram geometry through image generation. Registered monogram references are identity truth; generated renders only change material, depth, light or environment.
8. Inspect generated assets at intended size and on the actual near-black product surface. Review batches as a family for camera, scale, negative space and lighting discipline.
9. Iterate obvious failures rather than integrating output because generation technically succeeded.
10. If required quality cannot be reached sensibly, invoke `$opu-asset-request` with exact destination paths instead of shipping a generic substitute.

The legacy design-context folder supplies registered image references only through `docs/design/REFERENCES.md`; its old Markdown playbooks are not authority.