import { describe, expect, it } from 'vitest';
import { createRun } from '../../src/game/engine/create-run';
import { step } from '../../src/game/engine/step';
import { asActionId, asContentId } from '../../src/game/schema/ids';
import { tick } from '../../src/game/schema/units';

describe('semantic action validation', () => {
  it('rejects future actions without changing economic state', () => {
    const initial = createRun(1);
    const result = step(initial, [{ actionVersion: 1, actionId: asActionId('future'), sequence: 0, atTick: tick(10), type: 'RUN_FOUNDER_HISTORY_SELECTED', payload: { founderHistoryId: asContentId('history.fresh-founder') } }]);
    expect(result.state.economy).toEqual(initial.economy);
    expect(result.events[0].type).toBe('ACTION_REJECTED');
  });
});
