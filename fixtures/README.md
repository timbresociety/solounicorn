# Fixtures

Fixtures are non-authoritative states for rendering, interaction tests, screenshots, or isolated component development.

Rules:

- clearly label economic values as fixture-only;
- never promote fixture numbers into `balance/v2/registry.json`;
- never use fixtures to claim balance correctness;
- deterministic simulation tests should construct explicit state instead of depending on UI fixtures;
- production runtime must eventually consume locked balance through the simulation layer.
