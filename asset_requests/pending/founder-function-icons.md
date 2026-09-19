# Six function icons: alpha correction required

S13 generated two atlas candidates with native image generation. Both retained opaque colored backdrops and are rejected for final text-adjacent UI use. Do not ship them as accepted icons.

Destination: public/founder-assets/function-icons.png. PNG RGBA, 1536×1024, 3×2 grid of 512px cells. Actual transparent alpha outside each object; no text, tiles, glow or backdrop. Each object fills at most 80% of its cell. Six objects: profile cards+lens; pan+software blocks; precision alignment instrument; stamp+customer trouble; merging modules; scratched ticket+coin. Same three-quarter camera, upper-left key light, realistic paper/metal/rubber materials, contour separation. Follow docs/design/DESIGN.md and REFERENCES.md. No monogram is needed.

Generation brief: preserve this six-object arrangement and semantic geometry, remove all opaque backdrop and halo, export actual transparency. Check silhouettes at 40px against #090B0E and inspect all six object edges. Reject opaque RGB images, checkerboard baked into pixels, tiny unreadable object details, clipped objects and mismatched lighting. Browser final-size acceptance remains owner-disabled.

Source attempts are in /Users/deepsheth/.codex/generated_images/01a0a66e-7b4a-73c0-a180-89e1df8b4a54/exec-79a62406-8a04-4f52-8468-186cf5c3f3e1.png and exec-e87b1f51-eb3e-4499-8f4a-a69cc1398b79.png. Kept out of shipping assets.
