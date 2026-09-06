import type { ActionId, AgentId, ContentId, CustomerId, EntityId, QueueItemId } from './ids';
import type { BasisPoints, Tick } from './units';

export const ACTION_TYPES = [
  'RUN_FOUNDER_HISTORY_SELECTED', 'RUN_GROWTH_MANDATE_SELECTED', 'RUN_STARTED',
  'RUN_CONTINUED_AFTER_UNICORN', 'RUN_ABANDONED', 'FOUNDER_FUNCTION_ENTERED',
  'MARKETING_OPPORTUNITY_IGNORED', 'MARKETING_OPPORTUNITY_PURSUED', 'MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED',
  'PRODUCT_COMPONENT_PLACED', 'PRODUCT_RECIPE_TESTED', 'PRODUCT_RECIPE_SHIPPED',
  'MONETIZATION_MODEL_SELECTED', 'MONETIZATION_PRICE_COMMITTED',
  'RETENTION_THREAT_PRIORITIZED', 'RETENTION_THREAT_PRIORITY_CLEARED',
  'EXPANSION_ITEMS_MERGED', 'EXPANSION_PACKAGE_ITEM_PLACED', 'EXPANSION_PACKAGE_COMMITTED',
  'OPERATIONS_EVIDENCE_REVEALED', 'OPERATIONS_RESOLUTION_CHOSEN',
  'OPERATIONS_OPTIMIZER_ACCEPTED', 'OPERATIONS_OPTIMIZER_DISMISSED',
  'FINANCE_OFFER_OPENED', 'FINANCE_OFFER_ACCEPTED', 'FINANCE_OFFER_COUNTERED', 'FINANCE_OFFER_PASSED',
  'FINANCE_DEBT_DRAWN', 'FINANCE_INTEREST_PAID', 'FINANCE_PRINCIPAL_PAID', 'FINANCE_DEBT_REFINANCED',
  'FINANCE_OBLIGATION_IGNORED', 'FINANCE_MANDATE_MISS_BRIDGED',
  'SKILL_RANK_PURCHASED',
  'AGENT_INSTALLED', 'AGENT_UPGRADED', 'AGENT_ASSIGNED', 'AGENT_POLICY_SET',
  'AGENT_EXCEPTION_APPROVED', 'AGENT_LINE_RESET',
  'QUARTER_RELIC_CHOSEN', 'QUARTER_STRATEGY_CHOSEN', 'QUARTER_INVESTING_FINISHED', 'QUARTER_NEXT_STARTED',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type FunctionId = 'MARKETING' | 'PRODUCT' | 'MONETIZATION' | 'RETENTION' | 'EXPANSION' | 'OPERATIONS' | 'FINANCE';
export type PricingModel = 'FLAT' | 'PER_SEAT' | 'USAGE';
export type ShipMode = 'VERIFIED' | 'EARLY';

export type ActionPayloadMap = {
  RUN_FOUNDER_HISTORY_SELECTED: { founderHistoryId: ContentId };
  RUN_GROWTH_MANDATE_SELECTED: { growthMandateBps: BasisPoints };
  RUN_STARTED: Record<string, never>;
  RUN_CONTINUED_AFTER_UNICORN: Record<string, never>;
  RUN_ABANDONED: { reason: 'PLAYER_CHOICE' };
  FOUNDER_FUNCTION_ENTERED: { functionId: FunctionId };
  MARKETING_OPPORTUNITY_IGNORED: { opportunityId: ContentId };
  MARKETING_OPPORTUNITY_PURSUED: { opportunityId: ContentId };
  MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED: { opportunityId: ContentId };
  PRODUCT_COMPONENT_PLACED: { requestId: QueueItemId; componentId: ContentId; slotId: EntityId };
  PRODUCT_RECIPE_TESTED: { requestId: QueueItemId };
  PRODUCT_RECIPE_SHIPPED: { requestId: QueueItemId; mode: ShipMode };
  MONETIZATION_MODEL_SELECTED: { activationId: QueueItemId; model: PricingModel };
  MONETIZATION_PRICE_COMMITTED: { activationId: QueueItemId; cursorTick: Tick };
  RETENTION_THREAT_PRIORITIZED: { threatId: QueueItemId; customerId: CustomerId };
  RETENTION_THREAT_PRIORITY_CLEARED: { threatId: QueueItemId };
  EXPANSION_ITEMS_MERGED: { firstItemId: EntityId; secondItemId: EntityId; cellId: EntityId };
  EXPANSION_PACKAGE_ITEM_PLACED: { packageId: EntityId; itemId: EntityId; slotId: EntityId };
  EXPANSION_PACKAGE_COMMITTED: { packageId: EntityId; customerId: CustomerId };
  OPERATIONS_EVIDENCE_REVEALED: { obligationId: QueueItemId; cellId: EntityId };
  OPERATIONS_RESOLUTION_CHOSEN: { obligationId: QueueItemId; resolutionId: ContentId };
  OPERATIONS_OPTIMIZER_ACCEPTED: { optimizerId: QueueItemId };
  OPERATIONS_OPTIMIZER_DISMISSED: { optimizerId: QueueItemId };
  FINANCE_OFFER_OPENED: { offerId: QueueItemId };
  FINANCE_OFFER_ACCEPTED: { offerId: QueueItemId };
  FINANCE_OFFER_COUNTERED: { offerId: QueueItemId; targetDilutionBps: BasisPoints };
  FINANCE_OFFER_PASSED: { offerId: QueueItemId };
  FINANCE_DEBT_DRAWN: { instrumentId: ContentId };
  FINANCE_INTEREST_PAID: { obligationId: QueueItemId };
  FINANCE_PRINCIPAL_PAID: { instrumentId: ContentId; amountCents: number };
  FINANCE_DEBT_REFINANCED: { instrumentId: ContentId; replacementId: ContentId };
  FINANCE_OBLIGATION_IGNORED: { obligationId: QueueItemId };
  FINANCE_MANDATE_MISS_BRIDGED: { shortfallAnnualDollars: number };
  SKILL_RANK_PURCHASED: { skillRankId: ContentId };
  AGENT_INSTALLED: { agentTierId: ContentId; functionId: FunctionId };
  AGENT_UPGRADED: { agentId: AgentId; agentTierId: ContentId };
  AGENT_ASSIGNED: { agentId: AgentId; functionId: FunctionId };
  AGENT_POLICY_SET: { agentId: AgentId; policyId: ContentId };
  AGENT_EXCEPTION_APPROVED: { agentId: AgentId; exceptionId: QueueItemId };
  AGENT_LINE_RESET: { agentId: AgentId };
  QUARTER_RELIC_CHOSEN: { relicId: ContentId };
  QUARTER_STRATEGY_CHOSEN: { strategyId: ContentId };
  QUARTER_INVESTING_FINISHED: Record<string, never>;
  QUARTER_NEXT_STARTED: Record<string, never>;
};

export type SemanticAction<T extends ActionType = ActionType> = T extends ActionType ? {
  actionVersion: 1;
  actionId: ActionId;
  sequence: number;
  atTick: Tick;
  type: T;
  payload: ActionPayloadMap[T];
} : never;

export function isActionType(value: unknown): value is ActionType {
  return typeof value === 'string' && (ACTION_TYPES as readonly string[]).includes(value);
}

export function validateActionEnvelope(value: unknown): value is SemanticAction {
  if (!value || typeof value !== 'object') return false;
  const action = value as Partial<SemanticAction>;
  return action.actionVersion === 1 && typeof action.actionId === 'string' && Number.isInteger(action.sequence)
    && typeof action.atTick === 'number' && Number.isInteger(action.atTick) && isActionType(action.type)
    && typeof action.payload === 'object' && action.payload !== null;
}
