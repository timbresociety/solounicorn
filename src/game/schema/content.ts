import type { FunctionId, PricingModel } from './actions';
import type { CalibrationStatus, CalibrationValue } from './balance';
import type { ContentId } from './ids';
import type { SkillBranch } from './state';
import type { AnnualDollars, BasisPoints, Cents, PartsPerMillion, PressureUnits, Tick, WorkUnits } from './units';

export type ContentBase = {
  schemaVersion: 1;
  id: ContentId;
  name: string;
  description: string;
  tags: string[];
  assetKey: string;
  provenance: CalibrationStatus;
};

export type EligibilityPredicate =
  | { type: 'ALWAYS' }
  | { type: 'HAS_TAG'; tag: string }
  | { type: 'OWNS_SKILL'; skillRankId: ContentId }
  | { type: 'OWNS_RELIC'; relicId: ContentId }
  | { type: 'MIN_AGENTS'; count: number }
  | { type: 'MIN_COMPLEXITY'; amount: PressureUnits }
  | { type: 'HAS_DEBT' }
  | { type: 'FUNCTION_RANK'; functionId: FunctionId; branch: SkillBranch; rank: number };

export type EffectDuration = { type: 'PERMANENT' } | { type: 'QUARTERS'; quarters: number } | { type: 'TICKS'; ticks: Tick };
export type EffectScope = { type: 'COMPANY' } | { type: 'FUNCTION'; functionId: FunctionId } | { type: 'ENTITY'; entityId: string };
export type EffectOperation =
  | { type: 'ADD_CAPACITY'; amount: WorkUnits }
  | { type: 'ADD_COMPLEXITY'; amount: PressureUnits }
  | { type: 'ADD_OPS_CAPACITY'; amount: PressureUnits }
  | { type: 'ADD_RECURRING_COST'; amountCents: Cents }
  | { type: 'MULTIPLY_THROUGHPUT'; multiplierPpm: PartsPerMillion }
  | { type: 'MODIFY_RELIABILITY'; amountPpm: PartsPerMillion }
  | { type: 'MODIFY_INFORMATION'; amountPpm: PartsPerMillion }
  | { type: 'MODIFY_QUEUE_LIMIT'; amount: number }
  | { type: 'MODIFY_RISK_DISTRIBUTION'; amountPpm: PartsPerMillion }
  | { type: 'ROUTE_OUTPUT'; from: FunctionId; to: FunctionId }
  | { type: 'UNLOCK_POLICY'; policyId: ContentId }
  | { type: 'UNLOCK_CONTENT'; contentId: ContentId }
  | { type: 'ADD_ELIGIBILITY_TAG'; tag: string }
  | { type: 'MODIFY_FINANCE_TERMS'; amountBps: BasisPoints }
  | { type: 'MODIFY_ROT_RATE'; multiplierPpm: PartsPerMillion }
  | { type: 'MODIFY_RECOVERY'; amount: PressureUnits };

export type DeclarativeEffect = {
  id: ContentId;
  scope: EffectScope;
  duration: EffectDuration;
  stacking: 'ADD' | 'MULTIPLY' | 'MAX' | 'REPLACE' | 'UNIQUE';
  precedence: number;
  reversible: boolean;
  operation: EffectOperation;
};

export type MarketingSignalContent = ContentBase & {
  kind: 'MARKETING_SIGNAL'; segment: string; revealed: { audienceFit: string; purchaseIntent: string; trendVelocity: string; saturation: string };
  quality: 'LOW' | 'QUALIFIED' | 'EXCEPTIONAL'; requirements: ContentId[];
  demandUnits: CalibrationValue<WorkUnits>; aggressiveDemandUnits: CalibrationValue<WorkUnits>;
  pursueCostCents: CalibrationValue<Cents>; aggressiveCostCents: CalibrationValue<Cents>;
};
export type ProductRecipeContent = ContentBase & {
  kind: 'PRODUCT_RECIPE'; componentIds: ContentId[]; slotIds: string[];
  activationQualityPpm: CalibrationValue<PartsPerMillion>; earlyShipRiskPpm: CalibrationValue<PartsPerMillion>;
};
export type CustomerArchetypeContent = ContentBase & {
  kind: 'CUSTOMER_ARCHETYPE'; segment: string; pricingModel: PricingModel;
  baseArr: CalibrationValue<AnnualDollars>; perfectBandStartPpm: CalibrationValue<PartsPerMillion>;
  perfectBandEndPpm: CalibrationValue<PartsPerMillion>; expansionPotentialPpm: CalibrationValue<PartsPerMillion>;
};
export type SkillRankContent = ContentBase & {
  kind: 'SKILL_RANK'; functionId: FunctionId; branch: SkillBranch; subbranch: string; tier: number;
  prerequisiteIds: ContentId[]; costCents: CalibrationValue<Cents>; eligibility: EligibilityPredicate[]; effects: DeclarativeEffect[];
};
export type StrategyContent = ContentBase & { kind: 'STRATEGY'; durationQuarters: number; eligibility: EligibilityPredicate[]; effects: DeclarativeEffect[] };
export type RelicContent = ContentBase & { kind: 'RELIC'; rarity: 'COMMON' | 'RARE' | 'LEGENDARY' | 'ETHEREAL'; eligibility: EligibilityPredicate[]; effects: DeclarativeEffect[] };
export type FounderHistoryContent = ContentBase & { kind: 'FOUNDER_HISTORY'; startingRelicId?: ContentId; weightedFunction?: FunctionId; effects: DeclarativeEffect[] };
export type AgentTierContent = ContentBase & {
  kind: 'AGENT_TIER'; tier: number; throughput: CalibrationValue<WorkUnits>; reliabilityPpm: CalibrationValue<PartsPerMillion>;
  recurringCostCents: CalibrationValue<Cents>; complexity: CalibrationValue<PressureUnits>;
};
export type RetentionThreatContent = ContentBase & { kind: 'RETENTION_THREAT'; severity: number; workRequired: CalibrationValue<WorkUnits>; timeToChurn: CalibrationValue<Tick> };
export type OperationsObligationContent = ContentBase & { kind: 'OPERATIONS_OBLIGATION'; evidenceCells: string[]; resolutionIds: ContentId[]; rotPerTick: CalibrationValue<PressureUnits> };
export type FinanceInstrumentContent = ContentBase & { kind: 'FINANCE_INSTRUMENT'; principalCents: CalibrationValue<Cents>; aprBps: CalibrationValue<BasisPoints>; termTicks: CalibrationValue<Tick> };

export type GameContent = MarketingSignalContent | ProductRecipeContent | CustomerArchetypeContent | SkillRankContent
  | StrategyContent | RelicContent | FounderHistoryContent | AgentTierContent | RetentionThreatContent
  | OperationsObligationContent | FinanceInstrumentContent;

export type ContentPack = { schemaVersion: 1; version: string; cultureVersion: string; entries: GameContent[] };
