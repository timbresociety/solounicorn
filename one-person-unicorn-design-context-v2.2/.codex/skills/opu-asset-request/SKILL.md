---
name: opu-asset-request
description: Create a precise user handoff when ONE PERSON UNICORN needs a custom visual or audio asset that Codex cannot generate reliably, affordably, or with the required quality. Use instead of flat icons, emoji, stock graphics, generic 3D substitutes, or fake final audio.
---

1. Identify the exact component/state and destination file path.
2. Read the relevant generation contract in `/asset-playbooks/` and the relevant founder references.
3. Create `/asset_requests/pending/<asset-slug>.md` using the template in `/asset-playbooks/ASSET_REQUEST_WORKFLOW.md`.
4. Include a complete ready-to-paste generation prompt, required dimensions/aspect ratio/transparency, semantic fusion logic, reject conditions and acceptance tests.
5. Keep the implementation functional without shipping a fake visual substitute.
6. Tell the user exactly which file(s) to generate and where to add them.
7. When the asset appears, validate it against the request and integrate it.
