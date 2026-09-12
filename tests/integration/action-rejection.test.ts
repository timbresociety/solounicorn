import { describe, expect, it } from 'vitest';
import { createRun } from '../../src/game/engine/create-run';
import { step } from '../../src/game/engine/step';
import { asActionId, asContentId } from '../../src/game/schema/ids';
import { tick } from '../../src/game/schema/units';
import { GameRuntime } from '../../src/game/runtime/game-runtime';

describe('semantic action validation', () => {
  it('rejects future actions without changing economic state', () => {
    const initial = createRun(1);
    const result = step(initial, [{ actionVersion: 1, actionId: asActionId('future'), sequence: 0, atTick: tick(10), type: 'RUN_FOUNDER_HISTORY_SELECTED', payload: { founderHistoryId: asContentId('history.fresh-founder') } }]);
    expect(result.state.economy).toEqual(initial.economy);
    expect(result.events[0].type).toBe('ACTION_REJECTED');
  });

  it('turns a missed growth mandate into an explicit failed run', () => {
    const runtime = new GameRuntime(404);
    runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
    runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: 10_000 as never });
    runtime.dispatch('RUN_STARTED', {});
    runtime.advanceTicks(4_000);

    expect(runtime.snapshot.state.clock.phase).toBe('QUARTER_CLOSE');
    expect(runtime.snapshot.state.quarter.mandateMet).toBe(false);

    runtime.dispatch('QUARTER_RESULTS_REVIEWED', {});
    runtime.dispatch('QUARTER_RELICS_SKIPPED', {});
    runtime.dispatch('QUARTER_STRATEGY_SKIPPED', {});
    runtime.dispatch('QUARTER_NEXT_STARTED', {});

    expect(runtime.snapshot.state.clock.phase).toBe('FAILED');
    expect(runtime.snapshot.state.outcome.finalResult?.type).toBe('GROWTH_MANDATE_MISSED');
    expect(runtime.snapshot.events.some((event) => event.type === 'RUN_FAILED')).toBe(true);
  }, 15_000);
});
