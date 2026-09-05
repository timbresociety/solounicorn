# Asset request: Work-function icon family

## Usage
- Screen/component: desktop work-function rail and mobile bottom navigation
- Semantic function: distinguish the seven operating functions at a glance
- Intended display size: 36–48 CSS px
- Responsive variants needed: one source asset per function, readable from 24–64 px

## Destination
`public/room-icons/<function>.webp`

Filenames: `marketing.webp`, `product.webp`, `monetization.webp`, `retention.webp`, `expansion.webp`, `operations.webp`, `finance.webp`.

## Required format
- WebP, one object per file
- transparent background: yes
- target source resolution: 512 × 512 px
- aspect ratio: 1:1

## Canonical references
- Design contract: `docs/design/DESIGN.md` sections on function interactions, contextual 3D icons, materials and generative design.
- Reference authority: `docs/design/REFERENCES.md`.
- Exact founder image: `one-person-unicorn-design-context-v2.2/references/visual/founder/contextual-3d-icon-family-airbnb-reference.png`.

Use the founder image only for the bounded authority defined in `docs/design/REFERENCES.md`; do not copy its branded object choices or styling literally.

## Generation logic
- Marketing: live signal scanner fused with a classic broadcast tuner; alert, discerning, culturally awake.
- Product: precision assembly jig fused with a maker's workbench; capable, tactile, exact.
- Monetization: modern payment terminal fused with a mechanical pricing scale; decisive, valuable, timed.
- Retention: customer-health monitor fused with a repair clamp; protective, urgent, trustworthy.
- Expansion: modular account map fused with a precision expanding caliper; opportunity, fit, breadth.
- Operations: observability console fused with a physical fuse box; competent, hazardous, repairable.
- Finance: cap-table ledger fused with a compact vault dial; consequential, controlled, institutional.
- Material justification: physically believable premium materials appropriate to each object; no universal rarity finish.

## Prompt
Create a coherent family of seven custom hyperrealistic outlined 3D icon images for ONE PERSON UNICORN: Marketing, Product, Monetization, Retention, Expansion, Operations and Finance. For each function, fuse the current and archetypal semantic objects described above into one coherent premium object, never two props placed side by side. Use a consistent three-quarter camera, silhouette scale, neutral studio lighting, self-shadowing, ambient occlusion and contour separation. Materials must be physically believable and semantically appropriate to each object. Transparent background. No text, card, tile or scene backdrop. The family must remain instantly distinguishable at 36 px on a near-black interface.

## Reject conditions
- flat icon or emoji
- generic stock 3D
- baked background or text
- forced gold, glass, chrome or Ethereal treatment
- weak silhouette or inconsistent camera
- copied third-party identity

## Acceptance test
- every function reads at 36 px without its label
- transparent background works on the dark UI
- perspective, lighting and contour treatment form one family
- no text is baked into any bitmap
