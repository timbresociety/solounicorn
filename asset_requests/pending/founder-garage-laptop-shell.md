# Asset request: Founder garage and business-laptop shell

## Usage

- Screen/component: `src/components/founder/FounderGame.tsx`, persistent founder shell at Garage / 01.
- Semantic function: establish the manual founder's physical workspace while framing, never crowding, the active gameplay surface.
- Player state: early valuation, one founder, before the workspace earns later assisted and ethereal progression.
- Current boundary: CSS pegboard, lamp, desk, and laptop bezel are temporary layout placeholders. The component visibly identifies that boundary until this art is supplied.

## Destination

- `public/founder/garage/garage-backdrop.webp`
- `public/founder/garage/laptop-shell.webp`
- `public/founder/garage/laptop-keyboard.webp`

## Required format

- `garage-backdrop.webp`: 2560 × 1440, opaque, no text; designed to crop safely from 16:9 through 4:3.
- `laptop-shell.webp`: 2048 × 1280, transparent outside the physical casing and screen aperture.
- `laptop-keyboard.webp`: 2048 × 520, transparent outside the keyboard/deck; optional separate shadow baked only inside the alpha boundary.
- Provide 2× source detail. The inner screen must be a clean transparent aperture, not a painted fake UI.

## Visual and interaction brief

Create original 2.5D art for a shabby but cared-for garage workspace. The hero object is a battered charcoal business laptop with a restrained early-2000s utilitarian silhouette: durable matte plastic, worn hinge, tiny status LED, slightly polished trackpad edge, believable screws, and a shallow keyboard deck. It is ThinkPad-like only in the broad category of old business hardware; do not copy trademarks, logos, keycap layouts, red pointing sticks, or any distinctive trade dress.

Camera: near-front three-quarter, low enough that the laptop frames the screen without stealing touch area. Lighting: one warm practical work lamp from upper left, cool ambient garage fill, soft occlusion beneath the lid. The garage background should have sparse pegboard tools, concrete/block walls, a cable, a shelf, and a desk grain. It must feel lived-in and competent, not messy for decoration. Keep the center screen aperture visually quiet and high contrast, because Demand's profile swipe is the primary interaction.

Provide normal and pressure variants only if the environment can change without obscuring numeric instrumentation: `garage-backdrop-pressure.webp` can add a restrained red utility-light edge and extra cable tension, not particles or warning text.

## References allowed

- `docs/design/DESIGN.md`: protected central gameplay, MACHINE plane, and mobile recomposition.
- `docs/design/REFERENCES.md`: contextual 3D object dimensionality principle only.
- `solounicorn_exec/context/VISUAL_BRAND.md`: early garage tone and compact machine composition.

## Reject conditions

- Any real laptop brand, logo, copied keyboard layout, or trade dress.
- A polished executive office, cyberpunk RGB, generic sci-fi HUD, stock photo garage, text baked into the image, or an opaque screen aperture.
- A keyboard/deck that consumes more than 15% of the mobile playable height.
- Excessive dirt, clutter, glare, or contrast that makes top metrics or swipe profile hard to read.

## In-product acceptance

- At 1440 px, the laptop reads as the central physical frame and the profile card remains dominant.
- At 390 px and 320 px, the visual shell collapses to bezel-only treatment and the card retains a practical one-thumb swipe area.
- The transparent shell aligns to the DOM screen without covering pointer targets, focus rings, or right-rail survival information.

## S13 update, 2026-09-20

Original six-room environment atlas is implemented at `public/founder-assets/environments.png`; its provenance and layout are in `public/founder-assets/manifest.json`. Live DOM laptop frame retains the interactive screen and responsive touch area. Temporary-art notice has been removed from the player UI. Direct atlas inspection passed composition review; desktop/mobile rendered acceptance remains pending because browser/computer use is disabled. Later $10M/$100M/$1B environments currently reuse the sky studio. The six function icon alpha requirement remains separately open in `founder-function-icons.md`.
