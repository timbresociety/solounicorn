import { describe, expect, it } from 'vitest';
import { V2_GOLDEN_BALANCE } from '../../src/game/balance/v2-golden';
import { V2_GOLDEN_CONTENT } from '../../src/game/content/v2-golden';
import { validateContentPack } from '../../scripts/validate-content';

describe('versioned game content', () => {
  it('has stable IDs, asset slots, marked tuning, and valid effects', () => {
    expect(validateContentPack(V2_GOLDEN_CONTENT, V2_GOLDEN_BALANCE)).toEqual([]);
  });

  it('proves all 28 first-rank skill branch/function combinations', () => {
    expect(V2_GOLDEN_CONTENT.entries.filter((entry) => entry.kind === 'SKILL_RANK')).toHaveLength(28);
  });
});
