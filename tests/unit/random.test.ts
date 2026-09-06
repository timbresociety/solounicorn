import { describe, expect, it } from 'vitest';
import { randomEvidence, randomUint32 } from '../../src/game/engine/random';

describe('keyed deterministic RNG', () => {
  it('matches fixed vectors', () => {
    expect(randomUint32(84022, 'opu-rng.1', 'marketing.signal.quality', 'signal.support-tabs', 0)).toBe(3022093302);
    expect(randomUint32(84022, 'opu-rng.1', 'agent.execution', 'agent-1', 12)).toBe(1916493825);
  });
  it('does not couple semantic streams', () => {
    const first = randomEvidence(7, 'opu-rng.1', 'finance.offer', 'q2', 0);
    const second = randomEvidence(7, 'opu-rng.1', 'finance.offer', 'q2', 0);
    expect(first).toEqual(second);
    expect(first).not.toEqual(randomEvidence(7, 'opu-rng.1', 'visual.spark', 'q2', 0));
  });
});
