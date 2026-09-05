# Codex tools and plugins — low-cost strategy

The goal is to give Codex enough non-text capability to implement and verify the design system without turning the project into an expensive dependency stack.

## Priority 0 — use Codex-native capability first

### Native image generation
Current Codex surfaces can generate/iterate images inside the workflow. Prefer this for small batches of bitmap UI assets, hero imagery and visual experiments when the native image-generation skill/tool is available.

**Cost rule:** do not mass-generate hundreds of assets simply because the tool exists. Generate a small coherent family, review it, then expand only after the family is approved.

**Fallback:** if native image generation is unavailable, rate-limited, expensive, or failing the art direction, create an asset request and ask the user to generate the asset into the exact folder. Never substitute a flat icon or emoji.

### Image input / screenshots
Codex can consume screenshots and visual references. Attach or point it to the founder references in this package before asking it to implement a visual family.

## Priority 1 — browser automation / visual QA

Choose **one** primary browser tool first to avoid redundant tool context.

### Option A: Playwright CLI + skill — recommended for coding agents
Microsoft's Playwright project explicitly recommends CLI + skills for coding agents because it is more token-efficient than loading a large MCP schema.

If available in your Codex skill installer, prefer the Playwright skill/CLI workflow.

MCP fallback:
```bash
codex mcp add playwright npx "@playwright/mcp@latest"
```

Equivalent config:
```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

Use for:
- opening localhost;
- responsive viewport checks;
- clicking through onboarding;
- screenshots;
- accessibility-tree inspection;
- regression flows.

### Option B: Chrome DevTools MCP — add when debugging/performance needs justify it
```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

Use for:
- console/network debugging;
- runtime performance traces;
- layout/paint issues;
- screenshots and DOM inspection.

Do not install both Playwright MCP and Chrome DevTools MCP by reflex. Playwright is usually enough for UI-flow QA. Add Chrome DevTools when performance/network diagnostics are the actual problem.

## Priority 2 — design round-trip

### Figma plugin / MCP — optional
OpenAI and Figma support a Codex ↔ Figma workflow through the Figma MCP server. Use it only when editable design-canvas round-tripping is useful.

Good uses:
- explore layout alternatives outside code;
- move implemented UI into editable Figma;
- implement an approved Figma design back into code.

It is not required for normal icon generation or for following `design.md`. Availability may depend on the user's Figma account/workspace.

### Product Design plugin — optional
If available in the user's Codex plugin directory, this can help with prototype/audit workflows. Treat it as an accelerator, never as a replacement for `design.md` or founder references.

## Priority 3 — motion/video prototyping

### Remotion plugin / local templates — optional
The plugin directory includes local Remotion-template workflows that can render in the workspace without an external API key. Use this for:
- motion-system prototypes;
- trailer/marketing motion studies;
- short UI choreography demonstrations.

Do not use Remotion as a substitute for production runtime UI motion in React/Canvas.

## Audio

Do not add a costly generative-audio SaaS merely to unblock implementation.

Codex should first:
- implement Web Audio / HTML audio playback, mixing and routing;
- create placeholder procedural tones only for engineering verification, never as final art;
- define the required final audio assets in `asset_requests/pending/`.

For final authored SFX/music, if no approved generation tool is already available, ask the user to supply/generate assets and place them in the requested folder.

## 3D

Ordinary UI icons are rendered bitmap assets, not runtime 3D models. Do not introduce Blender/Three.js pipelines just to satisfy the 3D icon language.

Use runtime 3D only when the actual gameplay/scene requires it.

## Suggested setup order

1. Use native Codex image generation if available.
2. Install/use Playwright skill/CLI for UI verification.
3. Add Chrome DevTools MCP only if profiling/debugging requires it.
4. Connect Figma only if design round-trip is materially useful.
5. Use Remotion only for motion/video artifacts.
6. For unsupported art/audio, generate an explicit asset request for the user.

## Security / context note

MCP servers can inspect browser state. Keep test profiles isolated where possible and do not expose sensitive logged-in sessions to a tool unless required.
