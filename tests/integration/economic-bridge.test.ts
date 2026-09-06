import { describe, expect, it } from 'vitest';
import { asContentId, asEntityId } from '../../src/game/schema/ids';
import { GameRuntime } from '../../src/game/runtime/game-runtime';

describe('economic bridge', () => {
  it('never lets Marketing or Product mutate ARR directly', () => {
    const runtime = new GameRuntime(5);
    runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
    runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: 1000 as never });
    runtime.dispatch('RUN_STARTED', {});
    const start = runtime.snapshot.state.economy.endingArr;
    runtime.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId('signal.support-tabs') });
    expect(runtime.snapshot.state.economy.endingArr).toBe(start);
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'PRODUCT' });
    const requestId = runtime.snapshot.state.functions.PRODUCT.queue[0].id;
    runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.inbox'), slotId: asEntityId('intake') });
    runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.routing'), slotId: asEntityId('logic') });
    runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId, componentId: asContentId('component.context'), slotId: asEntityId('memory') });
    runtime.dispatch('PRODUCT_RECIPE_TESTED', { requestId });
    runtime.dispatch('PRODUCT_RECIPE_SHIPPED', { requestId, mode: 'VERIFIED' });
    expect(runtime.snapshot.state.economy.endingArr).toBe(start);
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MONETIZATION' });
    const pricingId = runtime.snapshot.state.functions.MONETIZATION.queue[0].id;
    runtime.advanceTicks(35);
    runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: pricingId, cursorTick: runtime.snapshot.state.clock.tick });
    expect(runtime.snapshot.state.economy.endingArr).toBeGreaterThan(start);
    expect(runtime.snapshot.state.outcome.causalLedger.some((entry) => entry.eventType === 'ARR_CHANGED')).toBe(true);
  });
});
