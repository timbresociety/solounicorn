# ONE PERSON UNICORN — Balance Specification V2

Status: STRUCTURAL AUTHORITY LOCKED; NUMERIC BALANCE IN CALIBRATION

This document is the bridge between product canon and executable simulation.

It exists because `ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` intentionally contains a mixture of canonical relationships, provisional formulas, calibration references, illustrative targets, and values that are explicitly not yet locked.

No coding agent may infer that a number is production-ready merely because it appears in the canonical context.

## 1. Authority

Product/system behavior:

`../../ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md`

Machine-readable quantitative status:

`../../balance/v2/registry.json`

Simulation implementation:

`../../simulation/`

When a numeric value in product canon conflicts with a later **locked** registry entry for the same V2 mechanic, the locked registry value is the implementation value, provided it does not violate the canonical causal relationship.

Changing the causal relationship requires an explicit product-canon change.

## 2. Locked equations

These relationships are canonical and may be implemented now:

```text
ENDING_ARR
= STARTING_ARR
+ NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

```text
NET_NEW_ARR
= NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

```text
VALUATION
= ENDING_ARR
x LOCKED_GROWTH_MULTIPLE
```

```text
FOUNDER_STAKE_VALUE
= FOUNDER_OWNERSHIP
x VALUATION
```

Causal constraints are also locked:

- Marketing creates Demand, not ARR.
- Product converts Demand into Activation, not ARR.
- Monetization converts Activation into New Customer ARR.
- Retention prevents Churned ARR and cannot create positive ARR.
- Expansion creates Expansion ARR from existing customers.
- Operations protects Cash/reliability/context/capacity and does not directly add ARR.
- Finance changes capital structure and does not directly add ARR or Valuation.
- Complexity and Rot do not directly multiply Valuation.

## 3. Parameter states

Every balance surface is one of:

- `missing`: no accepted value exists.
- `calibration`: an older/useful reference, explicitly not V2 implementation truth.
- `provisional`: a V2 starting hypothesis that must be simulated.
- `candidate`: quantitative evidence exists and the value is proposed for lock.
- `locked`: production implementation truth for the declared balance version.

An automated agent may promote a value to `candidate` only with reproducible simulation evidence.

Only an explicit product-owner request may promote `candidate` to `locked`.

## 4. Runtime rule

`balance/v2/registry.json` contains `runtimeReady`.

`runtimeReady` remains `false` while any `requiredForRuntime: true` parameter is not `locked`.

While false:

- simulation/calibration tools may consume provisional/calibration values only when explicitly requested;
- presentation work uses fixtures or adapters;
- app/runtime code must not import the registry as production config;
- `balance/v2/runtime.json` must not exist.

When all required surfaces are locked, generate a versioned runtime file from locked values and set `runtimeReady: true` in the same reviewed change.

## 5. Required quantitative surfaces

Before V2 economic build lock, define and test at minimum:

- starting ARR, Cash, burn and Ops Capacity;
- manual founder capacity and Growth Unit scaling;
- all seven work-function output equations;
- queue/opportunity generation;
- customer cohort flow;
- churn generation and save mechanics;
- Expansion opportunity generation and caps;
- all skill-rank costs/effects or a deterministic schema capable of producing all 448 ranks;
- Complexity contributions;
- Ops Capacity progression;
- Strain penalties;
- Rot generation, propagation and recovery;
- final agent cost/throughput/reliability/Complexity;
- Finance offer probability;
- VC/SAFE/equity terms;
- debt APR, interest, refinancing and Debt Stress;
- emergency Growth bridge economics;
- quarterly Strategy effects;
- Relic effect budgets and eligibility;
- growth-multiple bands;
- run pacing and failure distributions.

The registry enumerates these surfaces so agents cannot silently skip them.

## 6. Simulation standard

Before a broad balance candidate is proposed, run at least:

```text
50,000–100,000+ seeded companies
```

covering all Growth Mandates, bootstrap/debt/VC, Craft/Scale/Autonomy/Variance-heavy, balanced, cross-function, and adversarial exploit policies.

Record win/unicorn rate, quarter of failure/unicorn, valuation/ARR distributions, founder ownership, debt, Cash failures, primary failure mode, Complexity/Rot trajectories, manual-attention burden, and build-family representation.

## 7. Balance goals

Reject systems where one function is safely ignorable; generic balanced builds dominate every specialist build; financing is mandatory; debt is free upside; Autonomy has no Operations tax; Craft scales linearly to easy unicorns; Expansion creates an infinite ARR loop; Variance produces deterministic superiority; growth multiple changes appear arbitrary; or viewport changes simulation outcomes.

Canonical target still to validate:

`Craft-only unicorn by Q16 < 5%`

This remains a target, not a locked result, until simulation proves the implemented system produces it.

## 8. Evidence for candidate promotion

A candidate balance change must include:

1. exact parameter/formula diff;
2. seed range or reproducible seed strategy;
3. simulator version/commit;
4. number of runs;
5. mandate/build mix;
6. before/after aggregate metrics;
7. exploit checks;
8. known regressions;
9. reason the tradeoff is desirable.

Put durable reports under `simulation/reports/` when the full simulator exists.

## 9. Human validation

Simulation cannot prove fun, clarity, motor feel, humor, replay desire, or perceived fairness.

Candidate numbers that affect tactile gameplay still require playtest evidence before final lock.

## 10. Current state

`npm run balance:validate` should pass during calibration.

`npm run balance:lock-check` is intentionally expected to fail until required V2 parameters are genuinely locked.
