#!/usr/bin/env bash
set -euo pipefail

cat <<'MSG'
Recommended minimal Codex setup:

1) Browser QA (recommended):
   codex mcp add playwright npx "@playwright/mcp@latest"

2) Only if performance/network debugging is needed:
   codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

Figma, Product Design and Remotion are optional Codex plugins; install them from the Codex plugin directory only if the workflow requires them.

Native image generation should be used when available. If it is unavailable or too expensive, DO NOT use flat/emoji substitutes. Create an asset request using asset-playbooks/ASSET_REQUEST_WORKFLOW.md.
MSG
