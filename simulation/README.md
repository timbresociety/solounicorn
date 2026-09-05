# Deterministic simulation

This folder is the home of economic/system truth in executable form.

Current contents are a minimal harness containing only relationships already locked by product canon plus deterministic RNG utilities. It is **not yet the full V2 balance simulator**.

Rules:

- no React;
- no DOM/browser APIs;
- no `Math.random()`;
- no live LLM calls;
- no hidden economic constants;
- unresolved values come from explicit calibration inputs, never guessed defaults;
- same seed + state + action log + versions must reproduce the same economic outcome.

Before adding a mechanic, read `../ARCHITECTURE.md`, `../docs/balance/BALANCE_SPEC_V2.md`, relevant canonical sections, and `../balance/v2/registry.json`.

Run:

```bash
npm run sim:smoke
npm run sim:determinism
```

The future full simulator should write durable aggregate reports under `simulation/reports/`.
