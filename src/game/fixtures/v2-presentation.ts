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
  { id: 'trace', label: 'Trace', finding: 'Retry loop is multiplying handoffs.' },
  { id: 'policy', label: 'Policy', finding: 'No stop condition exists.' },
  { id: 'handoff', label: 'Handoff', finding: 'Escalations return to the same agent.' },
] as const;

export function seedRetentionPresentationFixture(state: RunState): void {
  if (state.functions.RETENTION.queue.length || !state.cohorts.customers.length) return;
  const customer = state.cohorts.customers[0];
  state.functions.RETENTION.unlocked = true;
  state.functions.RETENTION.queue = RETENTION_THREAT_FIXTURES.map((fixture, index) => ({
    id: asQueueItemId(fixture.id),
    kind: 'RETENTION_THREAT',
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
  }));
}

export function seedExpansionPresentationFixture(state: RunState): void {
  if (state.functions.EXPANSION.queue.length || !state.cohorts.customers.length) return;
  const customer = state.cohorts.customers[0];
  state.functions.EXPANSION.unlocked = true;
  state.functions.EXPANSION.queue.push({
    id: asQueueItemId('expansion-fixture-support-scaleup'), kind: 'EXPANSION_NEED', sourceEntityId: asEntityId(customer.id), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(2_000), contentId: asContentId('threat.workflow-broken'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, customerId: customer.id, packageId: 'package-support-scaleup', need: 'Leadership needs intelligence and workflow automation.', mergedOutputs: [], placedItems: [], committed: false },
  });
}

export function seedOperationsPresentationFixture(state: RunState): void {
  if (state.functions.OPERATIONS.queue.length) return;
  state.functions.OPERATIONS.unlocked = true;
  state.functions.OPERATIONS.queue.push({
    id: asQueueItemId('ops-fixture-retry-storm'), kind: 'OPS_OBLIGATION', sourceEntityId: asEntityId('ops-fixture-retry-storm'), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(2_000), contentId: asContentId('ops.retry-storm'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, label: 'Agent retry storm', revealedCells: [], resolved: false, optimizerId: 'optimizer-fixture-one-line-fix' },
  });
}

export function seedFinancePresentationFixture(state: RunState): void {
  if (state.functions.FINANCE.queue.length) return;
  state.functions.FINANCE.unlocked = true;
  state.functions.FINANCE.queue.push({
    id: asQueueItemId('finance-fixture-forward-safe'), kind: 'FINANCE_EVENT', sourceEntityId: asEntityId('finance-fixture-forward-safe'), createdAtTick: state.clock.tick,
    priority: 1, workRemaining: workUnits(1_000), contentId: asContentId('finance.runway-note'), balanceSource: PRESENTATION_FIXTURE_STATUS.balanceSource,
    metadata: { fixture: true, runtimeReady: false, label: 'Northstar SAFE', checkCents: 1_200_000, dilutionBps: 700, opened: false, resolved: false },
  });
}
