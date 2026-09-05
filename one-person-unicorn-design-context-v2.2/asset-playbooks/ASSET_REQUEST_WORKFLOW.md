# Asset request workflow — when Codex should ask the user to generate assets

Use this when:
- native image generation is unavailable;
- generation quota/cost is becoming unreasonable;
- repeated generations are failing the style contract;
- an audio/visual capability is not available in the current Codex surface;
- the user wants final authored art rather than an engineering placeholder.

## Non-negotiable fallback rule

**Do not replace missing custom assets with flat icons, emojis, generic icon libraries or random stock 3D.**

Keep the component functional and create an explicit request.

## Request file location

Create:
`asset_requests/pending/<asset-slug>.md`

## Template

```md
# Asset request: <human name>

## Usage
- Screen/component:
- Semantic function:
- Intended display size:
- Responsive variants needed:

## Destination
`<exact repo path where the final asset should be placed>`

## Required format
- PNG/WebP as appropriate
- transparent background: yes/no
- target source resolution:
- aspect ratio:

## Canonical references
- `references/visual/founder/...`
- `design.md` sections: ...

## Generation logic
- current/pop semantic object:
- nostalgic/archetypal semantic object:
- fusion concept:
- desired emotional read:
- material justification:

## Prompt
<complete prompt ready for the user to paste into an image generator>

## Reject conditions
- flat icon
- emoji
- generic stock 3D
- baked background
- forced rarity texture
- weak silhouette
- copied third-party identity

## Acceptance test
- reads at intended size
- transparent background works on dark UI
- matches adjacent icon family
- no text baked into bitmap
```

## User handoff language

Tell the user, concisely:
- what assets are missing;
- why Codex is not substituting them;
- exact filenames/folders to add;
- that implementation can continue once those files are present.
