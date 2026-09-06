import { describe, expect, it } from 'vitest';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { asContentId, asEntityId } from '../../src/game/schema/ids';

function customerRuntime(): GameRuntime {
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
  runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: runtime.snapshot.state.functions.MONETIZATION.queue[0].id, cursorTick: runtime.snapshot.state.clock.tick });
  return runtime;
}

describe('remaining room fixture contracts', () => {
  it('gates Expansion, Operations, and Finance behind real semantic actions', () => {
    const runtime = customerRuntime();
    const customer = runtime.snapshot.state.cohorts.customers[0];
    const threat = runtime.snapshot.state.functions.RETENTION.queue[0];
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'RETENTION' });
    runtime.dispatch('RETENTION_THREAT_PRIORITIZED', { threatId: threat.id, customerId: customer.id });

    let expansion = runtime.snapshot.state.functions.EXPANSION.queue[0];
    expect(expansion.balanceSource).toBe('NON_AUTHORITATIVE_FIXTURE');
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'EXPANSION' });
    runtime.dispatch('EXPANSION_ITEMS_MERGED', { firstItemId: asEntityId('analytics-a'), secondItemId: asEntityId('analytics-b'), cellId: asEntityId('bench') });
    runtime.dispatch('EXPANSION_ITEMS_MERGED', { firstItemId: asEntityId('automation-a'), secondItemId: asEntityId('automation-b'), cellId: asEntityId('bench') });
    const packageId = asEntityId(String(expansion.metadata.packageId));
    runtime.dispatch('EXPANSION_PACKAGE_ITEM_PLACED', { packageId, itemId: asEntityId('intelligence'), slotId: asEntityId('fit-intelligence') });
    runtime.dispatch('EXPANSION_PACKAGE_ITEM_PLACED', { packageId, itemId: asEntityId('workflow'), slotId: asEntityId('fit-workflow') });
    const arrBeforeExpansion = runtime.snapshot.state.economy.endingArr;
    runtime.dispatch('EXPANSION_PACKAGE_COMMITTED', { packageId, customerId: customer.id });
    expect(runtime.snapshot.state.economy.endingArr).toBeGreaterThan(arrBeforeExpansion);

    const obligation = runtime.snapshot.state.functions.OPERATIONS.queue[0];
    expect(obligation.balanceSource).toBe('NON_AUTHORITATIVE_FIXTURE');
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'OPERATIONS' });
    for (const cellId of ['trace', 'policy', 'handoff']) runtime.dispatch('OPERATIONS_EVIDENCE_REVEALED', { obligationId: obligation.id, cellId: asEntityId(cellId) });
    runtime.dispatch('OPERATIONS_RESOLUTION_CHOSEN', { obligationId: obligation.id, resolutionId: asContentId('resolution.cap-retries') });
    expect(runtime.snapshot.state.functions.OPERATIONS.queue).toHaveLength(0);

    const offer = runtime.snapshot.state.functions.FINANCE.queue[0];
    const arrBeforeFinance = runtime.snapshot.state.economy.endingArr;
    const cashBeforeFinance = runtime.snapshot.state.economy.cash;
    const ownershipBeforeFinance = runtime.snapshot.state.capital.founderOwnershipBps;
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'FINANCE' });
    runtime.dispatch('FINANCE_OFFER_OPENED', { offerId: offer.id });
    runtime.dispatch('FINANCE_OFFER_ACCEPTED', { offerId: offer.id });
    expect(runtime.snapshot.state.economy.endingArr).toBe(arrBeforeFinance);
    expect(runtime.snapshot.state.economy.cash).toBeGreaterThan(cashBeforeFinance);
    expect(runtime.snapshot.state.capital.founderOwnershipBps).toBeLessThan(ownershipBeforeFinance);
    expect(runtime.snapshot.actionLog.actions.map((action) => action.type)).toEqual(expect.arrayContaining(['EXPANSION_PACKAGE_COMMITTED', 'OPERATIONS_RESOLUTION_CHOSEN', 'FINANCE_OFFER_ACCEPTED']));
  });
});
