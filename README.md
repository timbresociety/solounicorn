# ONE PERSON UNICORN

A deterministic roguelike business simulation about scaling a one-person AI company to a $1B valuation while surviving the complexity, capital pressure and context rot created by automation.

## Canonical context

There is one authority per domain:

- Product/system truth: `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`
- Build/PWA/integration requirements: `docs/BUILD.md`
- Architecture/dependency rules: `ARCHITECTURE.md`
- Quantitative balance lifecycle: `docs/balance/BALANCE_SPEC_V2.md`
- Machine-readable balance status: `balance/v2/registry.json`
- Visual/interaction design: `docs/design/DESIGN.md`
- Visual reference interpretation: `docs/design/REFERENCES.md`
- Content/copy/culture: `docs/content/CONTENT.md`
- Agent skills/tooling: `docs/SKILLS.md`
- Agent automation: `docs/automation/AUTOMATION.md`

The existing v0 UI is implementation evidence, not design or balance authority.

`one-person-unicorn-design-context-v2.2/` is legacy reference storage only. Its registered visual assets are used through `docs/design/REFERENCES.md`; its old Markdown must not be treated as current instructions.

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

`npm run validate` checks repository context topology, balance-registry integrity, simulation smoke/determinism, TypeScript and lint.

Production balance is intentionally blocked until required quantitative surfaces are locked:

```bash
npm run balance:lock-check
```

That command is expected to fail while V2 balance remains unresolved.

## Start here

Humans: `docs/index.md`

Agents: `AGENTS.md`

## Continue across web and desktop

Open the intended repository branch in each client. Start with `AGENTS.md`, then follow the [startup and handoff procedure](docs/automation/AUTOMATION.md#15-web--desktop-startup-and-freshness). It checks source freshness, reads only the relevant authorities, and records decisions and remaining work in the existing task plan.

After a web correction is merged, synchronize the desktop checkout while preserving local edits, then start a fresh task or explicitly reread the changed guidance. A web conversation or GitHub PR does not update a running local session by itself.
