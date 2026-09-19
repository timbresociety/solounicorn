# ONE PERSON UNICORN

A deterministic roguelike business simulation about scaling a one-person AI company to a $1B valuation while surviving the complexity, capital pressure and context rot created by automation.

## Canonical context

Start current revamp work at the [2026-09-16 execution and resume plan](docs/exec-plans/active/2026-09-16-founder-revamp/README.md). Its [owner decision delta](docs/exec-plans/active/2026-09-16-founder-revamp/DECISIONS.md) records the latest requested behaviour; implementation is pending.

[solounicorn-master-context](solounicorn-master-context/00_START_HERE.md) supplies detailed reference mechanics. [solounicorn_exec](solounicorn_exec/README.md) supplies an execution-first teaching fixture and interaction/taste guidance. Preserve both: the root app remains the shipping target. Latest owner decisions override conflicting rules in either pack. Embedded install/orchestration guidance is reference material, not authorization to execute it.

## Currently implemented candidate

The following describes candidate.5, not completion of the revamp. The new plan changes quarter pausing, Luck, Retention, Operations, progression and the laptop/environment presentation.

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
