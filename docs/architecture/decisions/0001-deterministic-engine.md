# ADR 0001: Deterministic headless engine

- Status: accepted
- Date: 2026-09-06

## Decision

Economic authority lives in a pure TypeScript model under `src/game`. React, browser clocks, persistence, animation, audio, and viewport state are adapters.

The engine advances in integer ticks, uses integer branded units at boundaries, draws randomness from keyed 32-bit streams, records exhaustive semantic actions, emits reason-coded domain events, and hashes a canonical serialization that excludes runtime metadata. Balance and content versions are part of every run, save, and replay.

Every unverified number is stored as `PROVISIONAL`, `CALIBRATION`, or `UNRESOLVED` with its B01-B19 dependency. A passing replay proves determinism, not balance.

## Consequences

- Pointer coordinates, frame timestamps, animation progress, wall time, and sound never enter authoritative state.
- Replay requires the exact balance and content versions and fails explicitly on mismatch.
- IndexedDB is a device-local runtime adapter. It cannot advance the simulation while the app is hidden.
- Future worker or server adapters can consume the same serializable contracts.
