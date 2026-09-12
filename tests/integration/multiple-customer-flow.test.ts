import { expect, it } from 'vitest';
import { contentById } from '../../src/game/content/v2-golden';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { replay } from '../../src/game/runtime/replay';
import { asContentId, asEntityId } from '../../src/game/schema/ids';
import { basisPoints } from '../../src/game/schema/units';

it('services every customer through Retention, Expansion, Operations and Finance in one quarter', () => {
  const runtime = new GameRuntime(84022);
  runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
  runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: basisPoints(0) });
  runtime.dispatch('RUN_STARTED', {});
  for (const signal of ['signal.support-tabs', 'signal.finance-sheet', 'signal.agent-studio']) {
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' });
    runtime.dispatch('MARKETING_OPPORTUNITY_PURSUED', { opportunityId: asContentId(signal) });
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'PRODUCT' });
    const request = runtime.snapshot.state.functions.PRODUCT.queue[0];
    const recipe = contentById.get(request.contentId);
    if (recipe?.kind !== 'PRODUCT_RECIPE') throw new Error('Missing recipe');
    recipe.componentIds.forEach((componentId, index) => runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId: request.id, componentId, slotId: asEntityId(recipe.slotIds[index]) }));
    runtime.dispatch('PRODUCT_RECIPE_TESTED', { requestId: request.id });
    runtime.dispatch('PRODUCT_RECIPE_SHIPPED', { requestId: request.id, mode: 'VERIFIED' });
    runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MONETIZATION' });
    runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: runtime.snapshot.state.functions.MONETIZATION.queue[0].id, cursorTick: runtime.snapshot.state.clock.tick });
  }
  expect(runtime.snapshot.state.cohorts.customers).toHaveLength(3);
  expect(runtime.snapshot.state.functions.RETENTION.queue).toHaveLength(9);
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'RETENTION' });
  for (const customer of runtime.snapshot.state.cohorts.customers) {
    for (const threat of runtime.snapshot.state.functions.RETENTION.queue.filter(item => String(item.sourceEntityId) === String(customer.id))) {
      runtime.dispatch('RETENTION_THREAT_PRIORITIZED', { threatId: threat.id, customerId: customer.id });
    }
  }
  expect(runtime.snapshot.state.functions.EXPANSION.queue).toHaveLength(3);
  expect(new Set(runtime.snapshot.state.functions.EXPANSION.queue.map(item => item.id)).size).toBe(3);
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'EXPANSION' });
  for (const customer of runtime.snapshot.state.cohorts.customers) {
    const need = runtime.snapshot.state.functions.EXPANSION.queue.find(item => item.metadata.committed !== true)!;
    expect(String(need.sourceEntityId)).toBe(String(customer.id));
    const packageId = asEntityId(String(need.metadata.packageId));
    for (const [first, second] of [['analytics-a', 'analytics-b'], ['automation-a', 'automation-b']]) runtime.dispatch('EXPANSION_ITEMS_MERGED', { firstItemId: asEntityId(first), secondItemId: asEntityId(second), cellId: asEntityId('bench') });
    for (const item of ['intelligence', 'workflow']) runtime.dispatch('EXPANSION_PACKAGE_ITEM_PLACED', { packageId, itemId: asEntityId(item), slotId: asEntityId(`fit-${item}`) });
    runtime.dispatch('EXPANSION_PACKAGE_COMMITTED', { packageId, customerId: customer.id });
    const arr = runtime.snapshot.state.economy.endingArr;
    runtime.dispatch('EXPANSION_PACKAGE_COMMITTED', { packageId, customerId: customer.id });
    expect(runtime.snapshot.state.economy.endingArr).toBe(arr);
    expect(runtime.snapshot.events.some(event => event.type === 'ACTION_REJECTED')).toBe(true);
  }
  expect(runtime.snapshot.state.functions.OPERATIONS.queue).toHaveLength(3);
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'OPERATIONS' });
  for (const obligation of runtime.snapshot.state.functions.OPERATIONS.queue) {
    for (const cell of ['trace', 'policy', 'handoff']) runtime.dispatch('OPERATIONS_EVIDENCE_REVEALED', { obligationId: obligation.id, cellId: asEntityId(cell) });
    runtime.dispatch('OPERATIONS_RESOLUTION_CHOSEN', { obligationId: obligation.id, resolutionId: asContentId('resolution.cap-retries') });
  }
  expect(runtime.snapshot.state.functions.OPERATIONS.queue).toHaveLength(0);
  expect(runtime.snapshot.state.functions.FINANCE.queue).toHaveLength(3);
  runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'FINANCE' });
  for (const offer of runtime.snapshot.state.functions.FINANCE.queue) runtime.dispatch('FINANCE_OFFER_PASSED', { offerId: offer.id });
  expect(runtime.snapshot.state.functions.FINANCE.queue).toHaveLength(0);
  expect(replay(runtime.toReplayArtifact())).toEqual(runtime.snapshot.state);
});
