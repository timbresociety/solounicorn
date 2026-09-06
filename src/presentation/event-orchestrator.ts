import type { DomainEvent, DomainEventType } from '../game/schema/events';

export type PresentedEvent = { label: string; detail: string; priority: 0 | 1 | 2 | 3 | 4; lead: 'MOTION' | 'SOUND' | 'COPY' | 'NUMBER'; sound?: 'commit' | 'snap' | 'ship' | 'arr' | 'quarter' | 'skill' | 'reject' };
const presentations: Partial<Record<DomainEventType, PresentedEvent>> = {
  DEMAND_COHORT_CREATED: { label: 'DEMAND CREATED', detail: 'Qualified cohort routed into Product.', priority: 2, lead: 'MOTION', sound: 'commit' },
  PRODUCT_COMPONENT_ACCEPTED: { label: 'COMPONENT LOCKED', detail: 'Recipe state updated.', priority: 1, lead: 'MOTION', sound: 'snap' },
  PRODUCT_COMPONENT_REJECTED: { label: 'REWORK', detail: 'Wrong fit. Delivery window tightened.', priority: 2, lead: 'COPY', sound: 'reject' },
  PRODUCT_RECIPE_TESTED: { label: 'VERIFIED', detail: 'The build passed its deterministic test.', priority: 2, lead: 'MOTION', sound: 'snap' },
  ACTIVATED_COHORT_CREATED: { label: 'ACTIVATION CREATED', detail: 'Demand is ready for pricing.', priority: 2, lead: 'MOTION', sound: 'ship' },
  CUSTOMER_CONVERTED: { label: 'FIRST CUSTOMER ARR', detail: 'Monetization converted Activation into ARR.', priority: 3, lead: 'NUMBER', sound: 'arr' },
  CHURN_PREVENTED: { label: 'CHURN PREVENTED', detail: 'Founder intervention protected existing ARR. Retention created no new ARR.', priority: 3, lead: 'COPY', sound: 'commit' },
  QUARTER_CLOSED: { label: 'Q1 CLOSED', detail: 'The economic bridge has been reconciled.', priority: 3, lead: 'COPY', sound: 'quarter' },
  SKILL_RANK_PURCHASED: { label: 'CAPABILITY INSTALLED', detail: 'Cash became permanent run capability.', priority: 3, lead: 'MOTION', sound: 'skill' },
  ACTION_REJECTED: { label: 'ACTION REJECTED', detail: 'The simulation did not accept that intent.', priority: 1, lead: 'COPY', sound: 'reject' },
};

export function presentEvent(event: DomainEvent): PresentedEvent | null { return presentations[event.type] ?? null; }
export function mostImportantEvent(events: DomainEvent[]): PresentedEvent | null {
  return events.map(presentEvent).filter((event): event is PresentedEvent => Boolean(event)).sort((a, b) => b.priority - a.priority)[0] ?? null;
}
