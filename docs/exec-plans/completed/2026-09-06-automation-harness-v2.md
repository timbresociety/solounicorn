# Automation harness V2

Status: COMPLETED

## Goal

Restructure the repository so automated coding agents can navigate product truth, balance status, simulation boundaries, presentation/design authority, and validation gates without treating provisional numbers or v0 UI as implementation truth.

## Changes

- converted root `AGENTS.md` into a concise navigation/guardrail map;
- added binding `ARCHITECTURE.md`;
- added structured repository knowledge under `docs/`;
- separated product canon from quantitative balance authority;
- added machine-readable balance registry with explicit lock states;
- added deterministic economy/PRNG/invariant smoke harness;
- added repository, balance and determinism validation scripts;
- added CI merge gates;
- added balance/simulation Codex skills;
- updated current visual rebuild brief/runbook to forbid silent use of unresolved balance.

## Validation

Expected merge gate:

```bash
npm run ci
```

`npm run balance:lock-check` intentionally remains red until required V2 quantitative surfaces are actually locked.

## Known follow-up

The next balance task must build the full seeded company simulator and calibrate the unresolved registry surfaces. This structural change does not pretend those numbers are already solved.
