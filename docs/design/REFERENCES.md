# ONE PERSON UNICORN — Design Reference Map

Status: BINDING INTERPRETATION MAP FOR VISUAL REFERENCES

Design rules live in `DESIGN.md`. This file tells an agent what each reference is allowed to teach it.

The legacy `one-person-unicorn-design-context-v2.2/` directory is **reference storage only** after context consolidation. Files inside it do not create product, design, build, balance or agent authority unless this document explicitly points to the asset.

Founder-supplied references outrank generated exploration examples. Product mechanics always outrank visual analogy.

## 1. Founder references

Base path:

`../../one-person-unicorn-design-context-v2.2/references/visual/founder/`

### `structure-monogram-primary.png`

Authority: canonical **Structure** monogram geometry.

Use for:

- silhouette;
- curve family;
- negative-space structure;
- app-icon geometry;
- dimensional/material renders that preserve geometry.

Do not infer:

- the raster render is a vector master;
- its visible color must become a universal UI color;
- geometry may be loosely redrawn to fit a render.

### `structure-spark-monogram-family.png`

Authority: canonical relationship between **Structure** and **Spark**.

Use for:

- dual-monogram family;
- shared curve grammar;
- pattern relationships;
- Spark as proprietary opportunity/ignition punctuation.

Do not infer:

- generic sparkle icons are allowed;
- Spark should replace normal semantic icons.

### `pastel-ethereal-environment.png`

Authority: canonical **SKY / Pastel Ethereal** atmosphere.

Use for:

- monumental scale;
- reflective/polished planes;
- pale cyan/lavender/blush atmosphere;
- serene spatial depth;
- tiny-subject/huge-world scale contrast;
- editorial/milestone art.

Do not infer:

- operational gameplay UI should become pastel;
- this exact composition should be copied.

### `contextual-3d-icon-family-airbnb-reference.png`

Authority: principle reference for text-adjacent custom 3D object imagery.

Use for:

- clear object silhouette;
- premium tactile appeal;
- small-size readability;
- object-specific material choices;
- backgroundless/isolated integration.

Do not infer:

- copy another brand's object choices, materials, palette, proportions or layout;
- use a stock 3D icon family.

### `rarity-texture-charcoal-stone.png`

Authority: texture/surface example only.

Semantic example: raw/dormant/unrefined.

Never treat it as the universal lowest rarity material.

### `rarity-texture-shiny-gold.png`

Authority: texture/surface example only.

Semantic example: refined/valuable/intentional.

Gold is not the universal premium UI material.

### `rarity-texture-translucent-liquid-glass.png`

Authority: texture/surface example only.

Semantic example: clarified/lucid/purified.

Glass is not a required global progression stage.

### `rarity-progression-enlightenment-example.png`

Authority: example of **semantic material progression**.

Example:

```text
charcoal stone
→ shiny gold
→ translucent liquid glass
→ Ethereal
```

Binding lesson: lower materials are context-specific; when a material rarity ladder is used, **Ethereal is the apex**.

Do not infer copy, values, subject anatomy or exact tier count from the image.

## 2. Generated exploration examples

Base path:

`../../one-person-unicorn-design-context-v2.2/references/visual/generated-examples/`

These are **non-canonical exploration outputs**. They show semantic-fusion thinking and may be rejected entirely without changing the design system.

- `icon-example-all-globe-compass.png`: world/discovery + exploration instrument.
- `icon-example-homes-house-key.png`: contemporary home + access/key symbolism.
- `icon-example-experiences-balloon-suitcase.png`: travel/adventure + nostalgic travel object.
- `icon-example-services-concierge-robot.png`: automation + high-touch concierge ritual.
- `icon-example-camera-analog-digital.png`: analog camera heritage + modern digital precision.

Do not copy their material choices by default. Some are too gold-heavy/ornate for final UI.

## 3. Missing whole-screen reference rule

Older rebuild documents referenced:

`canonical-game-shell-desktop.png`

That asset is not part of the current repository reference set and is therefore **not a completion dependency or invisible authority**.

Until a founder-approved whole-screen reference is added and registered here:

- `docs/design/DESIGN.md` governs composition;
- current v0 screenshots are implementation evidence only;
- an agent must not claim an absent screenshot requires preserving a specific shell;
- an agent must not invent a “canonical screenshot” and silently promote it.

If a future whole-screen reference is explicitly approved, add it to the founder-reference section here with the exact dimensions of its authority: composition, density, hierarchy, material, interaction state, or another clearly bounded use.

## 4. External principle references

These are quality/principle references, not assets to imitate.

### Identity and typography

- Paula Scher / Pentagram: `https://www.pentagram.com/about/paula-scher`
- The Public Theater identity: `https://www.pentagram.com/work/the-public-theater/story`
- Shakespeare in the Park system: `https://www.pentagram.com/work/shakespeare-in-the-park-2015`
- Monotype brand/type consistency: `https://www.monotype.com/resources/your-guide-consistent-powerful-and-meaningful-branding`

Extract:

- hierarchy;
- authorship;
- flexible identity-system thinking;
- typographic discipline;
- scale and composition.

Never extract exact branded geometry/layout/campaign language.

### Product / UX / motion

- Milkinside: `https://www.milkinside.com/`
- Red Dot Milkinside interview: `https://www.red-dot.org/magazine/interview-with-milkinside-2022`

Extract:

- integrated product/visual/motion thinking;
- interaction before ornament;
- authored physical response;
- one defining emotional beat per major flow;
- future-facing interfaces that remain intelligible.

Never recreate a recognizable Milkinside screen or motion sequence.

### Game-design thinking

- Game Design Library: `https://www.youtube.com/@GameDesignLibrary`

Extract:

- why a mechanic is satisfying;
- risk/reward;
- mastery;
- tempo;
- causal legibility;
- systemic consequences.

Never use another game's presentation as a substitute for defining this game's mechanic.

### Ethereal material

- Liquid Metal Iridescent Backgrounds: `https://www.behance.net/gallery/151198981/Liquid-Metal-Iridescent-Backgrounds`

Extract only:

- iridescent liquid-metal surface behavior;
- reflective depth;
- controlled spectral shift;
- premium physically convincing material response.

Do not copy forms/compositions. Do not spread this material into ordinary UI.

### Brand-art atmosphere

- PSYBLR editorial feed: `https://x.com/psyblr`

Extract:

- pastel atmosphere;
- monumental scale;
- haze/depth;
- reflective space;
- dreamlike controlled composition.

Do not treat the feed as product-UI reference or reproduce an artwork.

## 5. Reference-use test

Before using any reference, answer:

1. What exact property is authoritative here?
2. What properties are explicitly **not** authoritative?
3. Does product mechanics truth conflict with the analogy?
4. Am I extracting a principle or copying an execution?
5. Does the result still feel original to ONE PERSON UNICORN?

A reference is rejected when it causes an agent to preserve an old mechanic, copy a third party, or override `DESIGN.md`.
