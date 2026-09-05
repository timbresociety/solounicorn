# ONE PERSON UNICORN

A deterministic roguelike business simulation about scaling a one-person AI company to a $1B valuation while surviving the complexity and context rot created by automation.

## Current repository status

- Product/system canon: `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`
- Repository architecture: `ARCHITECTURE.md`
- Quantitative balance: **not fully locked**
- Machine-readable balance status: `balance/v2/registry.json`
- Design canon: `one-person-unicorn-design-context-v2.2/design.md`
- Current visual rebuild brief: `CODEX_REBUILD_BRIEF.md`
- Agent automation protocol: `docs/automation/AUTOMATION.md`

The existing v0 UI is implementation evidence, not design or balance authority.

## Quick start

```bash
npm ci
npm run validate
npm run dev
```

`npm run validate` checks repository structure, balance-registry integrity, simulation smoke/determinism, TypeScript, and lint.

Production balance is intentionally blocked until required quantitative surfaces are locked:

```bash
npm run balance:lock-check
```

That command is expected to fail while V2 balance remains unresolved.

## Start here

Humans: `docs/index.md`

Agents: `AGENTS.md`
