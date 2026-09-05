# Contextual 3D UI icon generation playbook

## Scope
Use for navigation, menus, buttons, headers, labels and other text-adjacent UI accents.

This is **not** the rarity-material system.

## Mandatory output
- custom hyperrealistic outlined 3D object image;
- transparent background;
- no text baked into the asset;
- integrated studio lighting/self-shadow/AO/rim separation;
- strong silhouette at intended UI size;
- no generic tile/background unless the object itself requires it.

## Semantic-generation sequence

1. **Functional meaning** — what does the component actually do?
2. **Emotional meaning** — what should the user feel: urgency, ownership, discovery, confidence, aspiration, relief, risk?
3. **Current semantic object** — identify a culturally current/pop-resonant object associated with that meaning.
4. **Nostalgic/archetypal object** — identify a durable object with emotional memory.
5. **Fusion** — combine them into one coherent object, not two props sitting side by side.
6. **Elitism/taste pass** — make it feel like the most desirable, specific, engineered version of the object.
7. **Material pass** — choose physically believable materials because they belong to the object. Do not force rarity materials.
8. **Silhouette pass** — verify instant read at 24–64 px or the intended component size.
9. **Family pass** — compare camera, perspective, negative space, lighting quality and contour treatment with adjacent icons.

## Base prompt

```text
Create a custom hyperrealistic outlined 3D icon image for ONE PERSON UNICORN.

Context: [EXACT UI COMPONENT + WHAT IT DOES]
Desired feeling: [FEELING]

First choose one culturally current/pop-resonant semantic object and one nostalgic/archetypal semantic object that both map naturally to the meaning. Fuse them into one coherent premium object rather than placing two unrelated objects side by side.

The result must feel specific, elite, tactile and authored, with a strong instantly readable silhouette. Use physically believable materials appropriate to the object. Do not force gold, stone, glass, chrome or Ethereal simply to make it look premium.

Render as a hyperrealistic 3D object with contour/edge separation, sophisticated studio lighting, self-shadowing and ambient occlusion handled inside the render. Transparent background. No text, no card, no tile, no scene backdrop.

Reject flat icon language, emoji, stock iconography, generic 3D clip-art, unmotivated sci-fi detail and decorative clutter.
```

## Example logic

| Label | Current/pop semantic | Nostalgic/archetypal semantic | Fusion direction |
|---|---|---|---|
| Camera | premium mirrorless creator camera | analog SLR/rangefinder | tactile analog body + modern precision optics |
| Search | optical scanner/focus system | detective loupe/monocle | precision loupe with modern focus/scanning detail |
| Homes | contemporary smart/luxury home | brass house key | architecture physically integrated with access/key form |
| Experiences | curated travel/adventure | hot-air balloon/travel trunk | balloon + premium travel case as one object |
| Services | intelligent automation | concierge bell/silver service | future assistant + classic high-touch service object |
| Notifications | signal beacon | mechanical bell/chime | tactile bell with controlled signal behavior |
| Wallet | digital payment instrument | card case/vault clasp | compact luxury case with modern transaction detail |
| Growth | live performance signal | telescope/altimeter/trophy marker | directional measurement instrument expressing momentum |

## Negative prompt / reject conditions

- flat vector icon;
- emoji;
- Lucide/FontAwesome-like symbol;
- stock 3D clip-art;
- generic glossy blob;
- gold everywhere;
- Ethereal applied without rarity semantics;
- fake hologram UI;
- baked rectangular background;
- unreadable tiny details;
- two separate objects merely placed together;
- cartoon toy look when the context calls for hyperrealism;
- exact copy of a third-party icon family.
