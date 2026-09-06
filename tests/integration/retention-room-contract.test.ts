import { describe, expect, it } from 'vitest';
import { V2_GOLDEN_BALANCE } from '../../src/game/balance/v2-golden';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { asContentId, asEntityId } from '../../src/game/schema/ids';

function createCustomerRuntime() {
  const runtime = new GameRuntime(84022);
  runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
  runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: 1_000 as never });
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
  return runtime;
}

describe('Retention room contract', () => {
  it('uses a marked fixture while runtimeReady is false and dispatches the real priority action', () => {
    const runtime = createCustomerRuntime();
    const before = runtime.snapshot.state;
    const customer = before.cohorts.customers[0];
    const threat = before.functions.RETENTION.queue[0];
    const arrBefore = before.economy.endingArr;

    expect(V2_GOLDEN_BALANCE.runtimeReady).toBe(false);
    expect(before.functions.RETENTION.unlocked).toBe(true);
    expect(threat.balanceSource).toBe('NON_AUTHORITATIVE_FIXTURE');
    expect(threat.metadata.runtimeReady).toBe(false);

    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'RETENTION' });
    runtime.dispatch('RETENTION_THREAT_PRIORITIZED', { threatId: threat.id, customerId: customer.id });

    const after = runtime.snapshot.state;
    expect(after.functions.RETENTION.queue[0].metadata.resolved).toBe(true);
    expect(after.economy.endingArr).toBe(arrBefore);
    expect(after.cohorts.customers[0].currentArr).toBe(customer.currentArr);
    expect(runtime.snapshot.events.map((event) => event.type)).toEqual(expect.arrayContaining(['RETENTION_PRIORITY_CHANGED', 'RETENTION_THREAT_RESOLVED', 'CHURN_PREVENTED', 'ACTION_ACCEPTED']));
    expect(runtime.snapshot.actionLog.actions.at(-1)?.type).toBe('RETENTION_THREAT_PRIORITIZED');
  });
});
