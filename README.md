# ONE PERSON UNICORN

A deterministic roguelike business simulation about scaling a one-person AI company to a $1B valuation while surviving the complexity, capital pressure and context rot created by automation.

## Canonical context

The current product context is [solounicorn-master-context](solounicorn-master-context/00_START_HERE.md). Its product, design and engineering documents supersede the removed V2 source pack. Embedded execution guidance does not authorize publication or external actions.

The active game now uses `src/game/founder`, a continuous, deterministic solo-founder roguelike. Start with $1,500, build recurring subscriptions through six tactile work functions, automate real work, and reach a $1B valuation while covering operating bills and any accepted VC mandate. Finance manages cashflow and capital, not a seventh minigame.

The current tactile build adds strain and context-repair scratch sheets, nine tested Product recipes, a persistent tiered merge board, breakable Retention banks, a bouncing offer meter, and stable Demand swipes. Quarter-end drafts appear automatically and continue with capability offers after the strategy pool is exhausted.

Craft, Scale, Automate and Luck have working effects across all six functions. Quarters produce continuous reports and seeded run upgrades. The HUD evolves through Garage, Assisted, Swarm, Executive and Ethereal stages. Earned revenue, invoices, collections, operating expenses and debt principal stay distinct. Saves include checksums and semantic command history; previous V2 saves remain under their original storage key.

The active profile is **candidate**, not locked balance. It inherits numerical primitives from the master context and records owner overrides and playable-scope deviations in [the founder runtime contract](docs/FOUNDER_RUNTIME.md). The older `src/game/engine` runtime is preserved as migration/recovery evidence and remains covered by regression tests.

## Quick start

```bash
npm ci
npm run validate
npm run dev
```

Production-ready build:

```bash
npm run build
```

`npm run validate` checks repository context topology, balance-registry integrity, simulation smoke/determinism, the current founder accounting/replay/full-run suite, TypeScript and lint.

Production balance is intentionally blocked until required quantitative surfaces are locked:

```bash
npm run balance:lock-check
```

That command is expected to fail while V2 balance remains unresolved.

## Start here

Humans: `docs/index.md`

Product context: `solounicorn-master-context/00_START_HERE.md`
