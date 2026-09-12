import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { asContentId, asEntityId } from '../../src/game/schema/ids';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { replay } from '../../src/game/runtime/replay';

function playGoldenQuarter() {
  const runtime = new GameRuntime(84022);
  runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
  runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: 1000 as never });
  runtime.dispatch('RUN_STARTED', {});
  runtime.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId('signal.support-tabs') });
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'PRODUCT' });
  const requestId = runtime.snapshot.state.functions.PRODUCT.queue[0].id;
  runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.inbox'), slotId: asEntityId('intake') });
  runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.routing'), slotId: asEntityId('logic') });
  runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.context'), slotId: asEntityId('memory') });
  runtime.dispatch('PRODUCT_RECIPE_TESTED', { requestId });
  runtime.dispatch('PRODUCT_RECIPE_SHIPPED', { requestId, mode: 'VERIFIED' });
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MONETIZATION' });
  runtime.advanceTicks(35);
  const pricingId = runtime.snapshot.state.functions.MONETIZATION.queue[0].id;
  runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: pricingId, cursorTick: runtime.snapshot.state.clock.tick });
  runtime.advanceTicks(4_000);
  runtime.dispatch('QUARTER_RESULTS_REVIEWED', {});
  runtime.dispatch('QUARTER_RELICS_SKIPPED', {});
  runtime.dispatch('QUARTER_STRATEGY_CHOSEN', { strategyId: asContentId('strategy.product-led') });
  runtime.dispatch('SKILL_RANK_PURCHASED', { skillRankId: asContentId('skill.marketing.craft.1') });
  runtime.dispatch('QUARTER_NEXT_STARTED', {});
  return runtime;
}

describe('golden Q1 replay', () => {
  it('creates Demand then Activation then first-customer ARR and starts Q2', () => {
    const runtime = playGoldenQuarter();
    const state = runtime.snapshot.state;
    expect(state.clock.quarterIndex).toBe(2);
    expect(state.cohorts.demand).toHaveLength(1);
    expect(state.cohorts.activated).toHaveLength(1);
    expect(state.cohorts.customers).toHaveLength(1);
    expect(state.economy.startingArr).toBeGreaterThan(100_000);
    expect(state.progression.purchasedSkillRankIds).toContain('skill.marketing.craft.1');
  }, 20_000);

  it('starts Q2 with a fresh playable Marketing signal and cleared fixture queues', () => {
    const runtime = playGoldenQuarter();
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' });
    runtime.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId('signal.finance-sheet') });
    const state = runtime.snapshot.state;
    expect(state.clock.paused).toBe(false);
    expect(state.cohorts.demand.at(-1)?.sourceId).toBe('signal.finance-sheet');
    expect(state.functions.PRODUCT.queue).toHaveLength(1);
    expect(state.functions.RETENTION.queue).toHaveLength(0);
    expect(state.functions.EXPANSION.queue).toHaveLength(0);
  }, 20_000);

  it('replays to the identical final hash', () => {
    const runtime = playGoldenQuarter();
    const artifact = runtime.toReplayArtifact();
    expect(replay(artifact)).toEqual(runtime.snapshot.state);
    const output = join(process.cwd(), 'artifacts/replays/v2');
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, 'golden-q1-to-q2.json'), `${JSON.stringify(artifact, null, 2)}\n`);
  }, 30_000);
});
