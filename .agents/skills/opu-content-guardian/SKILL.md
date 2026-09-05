---
name: opu-content-guardian
description: Apply the ONE PERSON UNICORN content contract for Relics, Strategies, Founder Histories, recipes, customer archetypes, incidents, tutorials, culture packs, achievements, run summaries, naming, and player-facing game copy.
---

1. Read repository-root `AGENTS.md`.
2. Read the relevant product system in `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` and `docs/content/CONTENT.md`.
3. If content references an economic effect, verify the semantic effect contract and inspect `docs/balance/BALANCE_SPEC_V2.md` plus `balance/v2/registry.json` for numeric dependencies.
4. Content may describe or select mechanics. It may not contain hidden ARR, valuation, probability, debt, ownership, reward, or reliability math.
5. Write player-facing copy in this order: clarity -> context -> personality -> cultural reward.
6. Use startup, AI, product, finance, engineering, and operator culture for specificity. Permanent UI language should be durable; fast-moving references belong in versioned culture content.
7. Transform research into original authored game content. Do not copy third-party creative expression or recognizable branded assets into shipped content.
8. Every risky Operations optimization must communicate upside and downside before commitment.
9. Finance language must match modeled economics and must never imply that funding directly creates ARR or valuation.
10. Founder Histories are player-selected. Never infer a player's real background from connected or external data.
11. Tutorials follow Point -> Do -> Prove and appear at first relevance instead of front-loading advanced systems.
12. Shippable strings need stable IDs and localization context. Do not bake gameplay-critical text into generated imagery.
13. Runtime GenAI may vary cosmetic or original wording only after deterministic meaning is resolved. It may never decide economic outcomes or effect values.
14. If a content idea requires a new effect or mechanic, invoke `$opu-simulation-guardian` and `$opu-balance-guardian` as appropriate rather than inventing the effect in content.
15. Before completion, run the content QA gate in `docs/content/CONTENT.md` and `npm run validate` when repository files changed.

Prefer a precise name, one clear mechanical sentence, and optional flavor over long explanatory copy.