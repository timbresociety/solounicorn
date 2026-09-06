import { describe, expect, it } from 'vitest';
import { createRun } from '../../src/game/engine/create-run';
import { assertRunInvariants } from '../../src/game/engine/invariants';

describe('run header construction', () => {
  it('constructs 10,000 versioned empty runs without an invariant failure', () => {
    for (let seed = 0; seed < 10_000; seed += 1) assertRunInvariants(createRun(seed));
    expect(createRun(9_999).header.seed).toBe(9_999);
  });
});
