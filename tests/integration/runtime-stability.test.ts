import { describe, expect, it, vi } from 'vitest';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { asContentId } from '../../src/game/schema/ids';
import { basisPoints, cents } from '../../src/game/schema/units';
import { assertCompatibleSave, createSaveEnvelope } from '../../src/game/runtime/persistence';
import { replay } from '../../src/game/runtime/replay';

function start() {
  const runtime = new GameRuntime(771);
  runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
  runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: basisPoints(0) });
  runtime.dispatch('RUN_STARTED', {});
  return runtime;
}
describe('browser runtime recovery', () => {
  it('does no work or notification while paused, rejects work, then resumes with replay parity', () => {
    const runtime = start();
    runtime.advanceTicks(20);
    runtime.dispatch('RUN_PAUSE_SET', { paused: true });
    const listener = vi.fn();
    runtime.subscribe(listener);
    listener.mockClear();
    const paused = runtime.snapshot;
    runtime.advanceTicks(800);
    expect(runtime.snapshot).toBe(paused);
    expect(listener).not.toHaveBeenCalled();
    runtime.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId('signal.support-tabs') });
    expect(runtime.snapshot.events.some(e => e.payload.code === 'RUN_PAUSED')).toBe(true);
    runtime.dispatch('RUN_PAUSE_SET', { paused: false });
    runtime.advanceTicks(10);
    expect(replay(runtime.toReplayArtifact())).toEqual(runtime.snapshot.state);
  });
  it('detects tampered saves instead of claiming hash verification', () => {
    const runtime = start();
    const save = structuredClone(createSaveEnvelope(runtime.snapshot));
    expect(() => assertCompatibleSave(save, save.balanceVersion, save.contentVersion)).not.toThrow();
    save.snapshot.state.economy.cash = cents(save.snapshot.state.economy.cash + 100);
    expect(() => assertCompatibleSave(save, save.balanceVersion, save.contentVersion)).toThrow('INVALID_SAVE_CHECKSUM');
  });
  it('lets a bootstrap founder continue after a quarter with no growth', () => {
    const runtime = start();
    runtime.advanceTicks(3000);
    expect(runtime.snapshot.state.clock.phase).toBe('QUARTER_CLOSE');
    expect(runtime.snapshot.state.quarter.mandateMet).toBe(true);
    runtime.dispatch('QUARTER_RESULTS_REVIEWED', {});
    runtime.dispatch('QUARTER_RELICS_SKIPPED', {});
    runtime.dispatch('QUARTER_STRATEGY_SKIPPED', {});
    runtime.dispatch('QUARTER_INVESTING_FINISHED', {});
    runtime.dispatch('QUARTER_NEXT_STARTED', {});
    expect(runtime.snapshot.state.clock.quarterIndex).toBe(2);
    expect(runtime.snapshot.state.clock.phase).toBe('ACTIVE');
  });
});

describe('longer runs and rejected work', () => {
  it('keeps an unaffordable lead available for a different decision', () => {
    const runtime = start();
    const restored = structuredClone(runtime.snapshot);
    restored.state.economy.cash = cents(0);
    const poor = new GameRuntime(771, undefined, restored);
    poor.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId('signal.support-tabs') });
    expect(poor.snapshot.events.some(e => e.payload.code === 'INSUFFICIENT_CASH')).toBe(true);
    expect(poor.snapshot.state.cohorts.demand).toHaveLength(0);
    poor.dispatch('MARKETING_OPPORTUNITY_IGNORED', { opportunityId: asContentId('signal.support-tabs') });
    expect(poor.snapshot.events.some(e => e.type === 'ACTION_ACCEPTED')).toBe(true);
    expect(poor.snapshot.state.clock.phase).toBe('ACTIVE');
  });
  it('crosses twenty quarter handoffs without a soft lock', () => {
    const runtime = start();
    for (let quarter = 1; quarter <= 20; quarter++) {
      runtime.advanceTicks(3100);
      expect(runtime.snapshot.state.quarter.index).toBe(quarter);
      expect(runtime.snapshot.state.clock.phase).toBe('QUARTER_CLOSE');
      runtime.dispatch('QUARTER_RESULTS_REVIEWED', {});
      runtime.dispatch('QUARTER_RELICS_SKIPPED', {});
      runtime.dispatch('QUARTER_STRATEGY_SKIPPED', {});
      runtime.dispatch('QUARTER_INVESTING_FINISHED', {});
      runtime.dispatch('QUARTER_NEXT_STARTED', {});
      runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' });
      expect(runtime.snapshot.state.clock.paused).toBe(false);
    }
    expect(replay(runtime.toReplayArtifact())).toEqual(runtime.snapshot.state);
  }, 30000);
});

it('reports a clock failure instead of silently abandoning animation frames', async () => {
  const { startBrowserClock } = await import('../../src/game/runtime/browser-clock');
  let frame: FrameRequestCallback | undefined;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1; });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  try {
    const runtime = start();
    const error = new Error('test invariant failure');
    vi.spyOn(runtime, 'advanceTicks').mockImplementation(() => { throw error; });
    const onError = vi.fn();
    const clock = startBrowserClock(runtime, 10, onError);
    frame!(performance.now() + 200);
    expect(onError).toHaveBeenCalledWith(error);
    clock.stop();
  } finally { vi.unstubAllGlobals(); }
});
