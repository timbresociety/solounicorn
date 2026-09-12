import type { DomainEvent, DomainEventType } from '../game/schema/events';

export type PresentedEvent = { label: string; detail: string; priority: 0 | 1 | 2 | 3 | 4; lead: 'MOTION' | 'SOUND' | 'COPY' | 'NUMBER'; sound?: 'commit' | 'snap' | 'ship' | 'arr' | 'quarter' | 'skill' | 'reject' };
const presentations: Partial<Record<DomainEventType, PresentedEvent>> = {
  DEMAND_COHORT_CREATED: { label: 'DEMAND CREATED', detail: 'Qualified cohort routed into Product.', priority: 2, lead: 'MOTION', sound: 'commit' },
  PRODUCT_COMPONENT_ACCEPTED: { label: 'COMPONENT LOCKED', detail: 'Correct fit. One step closer to shipping.', priority: 1, lead: 'MOTION', sound: 'snap' },
  PRODUCT_COMPONENT_REJECTED: { label: 'REWORK', detail: 'Wrong fit. Delivery window tightened.', priority: 2, lead: 'COPY', sound: 'reject' },
  PRODUCT_RECIPE_TESTED: { label: 'VERIFIED', detail: 'The build passed verification. It is ready to ship.', priority: 2, lead: 'MOTION', sound: 'snap' },
  ACTIVATED_COHORT_CREATED: { label: 'ACTIVATION CREATED', detail: 'Demand is ready for pricing.', priority: 2, lead: 'MOTION', sound: 'ship' },
  CUSTOMER_CONVERTED: { label: 'FIRST CUSTOMER ARR', detail: 'Monetization converted Activation into ARR.', priority: 3, lead: 'NUMBER', sound: 'arr' },
  CHURN_PREVENTED: { label: 'CHURN PREVENTED', detail: 'Founder intervention protected existing ARR. Retention created no new ARR.', priority: 3, lead: 'COPY', sound: 'commit' },
  EXPANSION_BOOKED: { label: 'ACCOUNT EXPANDED', detail: 'The package fits. Operations has the next handoff.', priority: 3, lead: 'NUMBER', sound: 'arr' },
  OPERATIONS_OBLIGATION_RESOLVED: { label: 'REPAIR COMPLETE', detail: 'The operational issue is resolved. Review your capital options in Finance.', priority: 2, lead: 'COPY', sound: 'ship' },
  FINANCE_OFFER_RESOLVED: { label: 'CAPITAL DECISION RECORDED', detail: 'Your decision is recorded. The company keeps running.', priority: 2, lead: 'COPY', sound: 'commit' },
  QUARTER_CLOSED: { label: 'Q1 CLOSED', detail: 'The economic bridge has been reconciled.', priority: 3, lead: 'COPY', sound: 'quarter' },
  SKILL_RANK_PURCHASED: { label: 'CAPABILITY INSTALLED', detail: 'Cash became permanent run capability.', priority: 3, lead: 'MOTION', sound: 'skill' },
  ACTION_REJECTED: { label: 'ACTION REJECTED', detail: 'The simulation did not accept that intent.', priority: 1, lead: 'COPY', sound: 'reject' },
};

export function presentEvent(event: DomainEvent): PresentedEvent | null {
  const base = presentations[event.type];
  if (!base) return null;
  if (event.type === 'ACTION_REJECTED') return { ...base, label: 'TRY AGAIN', detail: String(event.payload.details ?? base.detail) };
  if (event.type === 'QUARTER_CLOSED') return { ...base, label: `Q${event.payload.quarter} CLOSED` };
  if (event.type === 'CUSTOMER_CONVERTED') return { ...base, label: 'CUSTOMER WON', detail: `$${Number(event.payload.annualDollars).toLocaleString('en-US')} in annual recurring revenue. Protect the relationship in Retention.` };
  if (event.type === 'EXPANSION_BOOKED') return { ...base, detail: `+$${Number(event.payload.annualDollars).toLocaleString('en-US')} annual recurring revenue from the account package.` };
  if (event.type === 'FINANCE_OFFER_RESOLVED' && event.payload.action === 'FINANCE_OFFER_PASSED') return { ...base, label: 'OFFER DECLINED', detail: 'You kept your ownership. Borrowing and repayment remain available in Finance.' };
  return base;
}
export function mostImportantEvent(events: DomainEvent[]): PresentedEvent | null {
  return events.map(presentEvent).filter((event): event is PresentedEvent => Boolean(event)).sort((a, b) => b.priority - a.priority)[0] ?? null;
}
