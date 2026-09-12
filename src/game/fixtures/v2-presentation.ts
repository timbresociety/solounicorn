import { asContentId, asEntityId, asQueueItemId } from '../schema/ids';
import type { RunState } from '../schema/state';
import { tick, workUnits } from '../schema/units';

export const PRESENTATION_FIXTURE_STATUS = {
  runtimeReady: false,
  balanceSource: 'NON_AUTHORITATIVE_FIXTURE',
} as const;

export type RetentionThreatFixture = {
  id: string;
  label: string;
  cause: string;
  lane: number;
  phase: number;
  speed: number;
  urgency: 'WATCH' | 'AT RISK' | 'CRITICAL';
};

export const RETENTION_THREAT_FIXTURES: readonly RetentionThreatFixture[] = [
  { id: 'retention-fixture-workflow', label: 'Broken workflow', cause: 'Product friction', lane: 20, phase: 8, speed: 0.42, urgency: 'CRITICAL' },
  { id: 'retention-fixture-sponsor', label: 'Sponsor drift', cause: 'Champion changed roles', lane: 50, phase: 48, speed: 0.29, urgency: 'AT RISK' },
  { id: 'retention-fixture-adoption', label: 'Adoption stall', cause: 'Seats went quiet', lane: 78, phase: 24, speed: 0.36, urgency: 'WATCH' },
] as const;

export const EXPANSION_MODULE_FIXTURES = [
  { id: 'analytics-a', label: 'Analytics' }, { id: 'analytics-b', label: 'Analytics' },
  { id: 'automation-a', label: 'Automation' }, { id: 'automation-b', label: 'Automation' },
] as const;

export const OPERATIONS_EVIDENCE_FIXTURES = [
  { id: 'trace', label: 'Retry ceiling', finding: 'Stops recursive retries before they multiply handoffs.' },
  { id: 'policy', label: 'Circuit breaker', finding: 'Adds a stop condition when a worker cannot converge.' },
  { id: 'handoff', label: 'Escalation route', finding: 'Routes unresolved work to a human instead of the same agent.' },
] as const;

export function seedRetentionPresentationFixture(state: RunState): void {
  const customer = state.cohorts.customers.at(-1);
  if (!customer || state.functions.RETENTION.queue.some(item => String(item.sourceEntityId) === String(customer.id))) return;
  const suffix = customer.id === 'customer-1' && state.clock.quarterIndex === 1 ? '' : `-${customer.id}-q${state.clock.quarterIndex}`;
  state.functions.RETENTION.unlocked = true;
  state.functions.RETENTION.queue.push(...RETENTION_THREAT_FIXTURES.map((fixture, index) => ({
    id: asQueueItemId(`${fixture.id}${suffix}`),
    kind: 'RETENTION_THREAT' as const,
    sourceEntityId: asEntityId(customer.id),
    createdAtTick: state.clock.tick,
    expiresAtTick: tick(state.clock.tick + 80),
    priority: RETENTION_THREAT_FIXTURES.length - index,
    workRemaining: workUnits(2_000),
    contentId: asContentId('threat.workflow-broken'),
    balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: {
      fixture: true,
      runtimeReady: PRESENTATION_FIXTURE_STATUS.runtimeReady,
      customerId: customer.id,
      label: fixture.label,
      cause: fixture.cause,
      lane: fixture.lane,
      phase: fixture.phase,
      speed: fixture.speed,
      urgency: fixture.urgency,
      prioritized: false,
      resolved: false,
    },
  })));
}

export function seedExpansionPresentationFixture(state: RunState, customerId?: string): void {
  const customer = customerId ? state.cohorts.customers.find(item => item.id === customerId) : state.cohorts.customers.at(-1);
  if (!customer || state.functions.EXPANSION.queue.some(item => String(item.sourceEntityId) === String(customer.id))) return;
  const suffix = customer.id === 'customer-1' && state.clock.quarterIndex === 1 ? '' : `-${customer.id}-q${state.clock.quarterIndex}`;
  state.functions.EXPANSION.unlocked = true;
  state.functions.EXPANSION.queue.push({
    id: asQueueItemId(`expansion-fixture-support-scaleup${suffix}`), kind: 'EXPANSION_NEED', sourceEntityId: asEntityId(customer.id), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(2_000), contentId: asContentId('threat.workflow-broken'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, customerId: customer.id, packageId: `package-support-scaleup${suffix}`, need: 'Leadership needs intelligence and workflow automation.', mergedOutputs: [], placedItems: [], committed: false },
  });
}

export function seedOperationsPresentationFixture(state: RunState, sourceId = 'expansion-fixture-support-scaleup'): void {
  const suffix = sourceId === 'expansion-fixture-support-scaleup' ? '' : `-${sourceId}`;
  const id = asQueueItemId(`ops-fixture-retry-storm${suffix}`);
  if (state.functions.OPERATIONS.queue.some(item => item.id === id)) return;
  state.functions.OPERATIONS.unlocked = true;
  state.functions.OPERATIONS.queue.push({
    id, kind: 'OPS_OBLIGATION', sourceEntityId: asEntityId('ops-fixture-retry-storm'), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(2_000), contentId: asContentId('ops.retry-storm'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, label: 'Agent retry storm', revealedCells: [], resolved: false, optimizerId: `optimizer-fixture-one-line-fix${suffix}` },
  });
}

export function seedFinancePresentationFixture(state: RunState, sourceId = 'ops-fixture-retry-storm'): void {
  const suffix = sourceId === 'ops-fixture-retry-storm' ? '' : `-${sourceId}`;
  const id = asQueueItemId(`finance-fixture-forward-safe${suffix}`);
  if (state.functions.FINANCE.queue.some(item => item.id === id)) return;
  state.functions.FINANCE.unlocked = true;
  state.functions.FINANCE.queue.push({
    id, kind: 'FINANCE_EVENT', sourceEntityId: asEntityId('finance-fixture-forward-safe'), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(1_000), contentId: asContentId('finance.runway-note'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, label: 'Northstar SAFE', checkCents: 1_200_000, dilutionBps: 700, opened: false, resolved: false },
  });
}
