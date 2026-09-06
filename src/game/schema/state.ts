import type { ActionId, AgentId, CohortId, ContentId, CustomerId, EntityId, QueueItemId, RunId } from './ids';
import type { FunctionId, PricingModel } from './actions';
import type { AnnualDollars, BasisPoints, Cents, PartsPerMillion, PressureUnits, Tick, ValuationDollars, WorkUnits } from './units';
import type { CausalDelta, DomainEventType, ReasonCode } from './events';

export type RunPhase = 'SETUP' | 'ACTIVE' | 'QUARTER_CLOSE' | 'FAILED' | 'UNICORN_CHECKPOINT' | 'ABANDONED';
export type QuarterCloseStage = 'RESULTS' | 'WHAT_CHANGED' | 'STRATEGY' | 'INVEST' | 'READY';
export type QualityBand = 'LOW' | 'QUALIFIED' | 'EXCEPTIONAL';
export type CustomerHealth = 'HEALTHY' | 'AT_RISK' | 'CRITICAL' | 'CHURNED';
export type StrainBand = 'CLEAN' | 'BUSY' | 'STRAINED' | 'OVERLOADED' | 'RUNAWAY';
export type RotBand = 'FRESH' | 'DRIFT' | 'CONTEXT_ROT' | 'AGENT_SLOP' | 'CORRUPTED';
export type FailureType = 'GROWTH_MANDATE_MISSED' | 'BANKRUPT' | 'DEBT_SPIRAL' | 'AUTOMATION_COLLAPSE' | 'CHURN_SPIRAL' | 'CONTEXT_CORRUPTION';
export type SkillBranch = 'CRAFT' | 'SCALE' | 'AUTONOMY' | 'VARIANCE';

export type RunHeader = {
  runId: RunId;
  seed: number;
  randomVersion: string;
  balanceVersion: string;
  contentVersion: string;
  schemaVersion: number;
  founderHistoryId?: ContentId;
  growthMandateBps?: BasisPoints;
  startedAtMetadata?: string;
};

export type ClockState = { tick: Tick; quarterIndex: number; tickInQuarter: Tick; phase: RunPhase; paused: boolean };

export type QuarterState = {
  index: number;
  startingArr: AnnualDollars;
  targetArr: AnnualDollars;
  newCustomerArr: AnnualDollars;
  expansionArr: AnnualDollars;
  churnedArr: AnnualDollars;
  endingArr: AnnualDollars;
  growthBps: BasisPoints;
  closeStage?: QuarterCloseStage;
  mandateMet?: boolean;
};

export type DemandCohort = {
  id: CohortId; sourceId: ContentId; source: string; segment: string; quality: QualityBand;
  growthUnits: WorkUnits; acquisitionCost: Cents; requirements: ContentId[]; createdAtTick: Tick;
  expiresAtTick: Tick; history: EntityId[]; status: 'WAITING' | 'IN_PRODUCT' | 'ACTIVATED' | 'EXPIRED';
};

export type ActivatedCohort = {
  id: CohortId; demandCohortId: CohortId; recipeId: ContentId; segment: string; quality: QualityBand;
  productQualityPpm: PartsPerMillion; implementationRiskPpm: PartsPerMillion; createdAtTick: Tick;
  history: EntityId[]; status: 'WAITING' | 'CONVERTED' | 'EXPIRED'; pricingModel?: PricingModel;
};

export type CustomerCohort = {
  id: CustomerId; activationCohortId: CohortId; segment: string; originalArr: AnnualDollars; currentArr: AnnualDollars;
  health: CustomerHealth; acquisitionQuality: QualityBand; productQualityPpm: PartsPerMillion;
  expansionPotentialPpm: PartsPerMillion; pricingModel: PricingModel; createdAtTick: Tick; ageTicks: Tick;
  churnRiskPpm: PartsPerMillion; expansionBookedThisQuarter: AnnualDollars; history: EntityId[];
};

export type QueueItem = {
  id: QueueItemId; kind: 'PRODUCT_REQUEST' | 'PRICING_OPPORTUNITY' | 'RETENTION_THREAT' | 'EXPANSION_NEED' | 'OPS_OBLIGATION' | 'FINANCE_EVENT';
  sourceEntityId: EntityId; createdAtTick: Tick; expiresAtTick?: Tick; priority: number; workRemaining: WorkUnits;
  contentId: ContentId; metadata: Record<string, string | number | boolean | string[]>;
  balanceSource?: 'AUTHORITATIVE' | 'NON_AUTHORITATIVE_FIXTURE';
};

export type FunctionState = {
  id: FunctionId; unlocked: boolean; queue: QueueItem[]; queueLimit: number; capacity: WorkUnits;
  manualWork: WorkUnits; agentWork: WorkUnits; localRiskPpm: PartsPerMillion; activeRecipe?: {
    requestId: QueueItemId; recipeId: ContentId; placedComponentIds: ContentId[]; tested: boolean; verified: boolean;
  };
};

export type AgentState = {
  id: AgentId; tierId: ContentId; assignedFunction: FunctionId; policyId?: ContentId; throughput: WorkUnits;
  reliabilityPpm: PartsPerMillion; recurringCostCents: Cents; complexity: PressureUnits; rot: PressureUnits;
  status: 'ACTIVE' | 'WAITING_APPROVAL' | 'FAILED' | 'CORRUPTED'; completedWork: number; failedWork: number;
};

export type EconomyState = {
  startingArr: AnnualDollars; newCustomerArrQTD: AnnualDollars; expansionArrQTD: AnnualDollars;
  churnedArrQTD: AnnualDollars; endingArr: AnnualDollars; cash: Cents; burnPerQuarter: Cents;
  collectionsQTD: Cents; valuation: ValuationDollars; growthMultipleBps: BasisPoints;
};

export type PressureContribution = { id: EntityId; sourceId: EntityId; reason: ReasonCode; amount: PressureUnits; removable: boolean };
export type PressureState = {
  complexityContributions: PressureContribution[]; complexity: PressureUnits; opsCapacity: PressureUnits;
  strainPpm: PartsPerMillion; strainBand: StrainBand; rot: PressureUnits; rotBand: RotBand;
  incidents: QueueItem[]; retries: number;
};

export type DebtInstrumentState = {
  id: EntityId; instrumentId: ContentId; principalCents: Cents; aprBps: BasisPoints; accruedInterestCents: Cents;
  nextDueTick: Tick; status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
};
export type FinanceOfferState = {
  id: QueueItemId; archetypeId: ContentId; checkCents: Cents; dilutionBps: BasisPoints; interestPpm: PartsPerMillion;
  expiresAtTick: Tick; status: 'INBOUND' | 'OPENED' | 'ACCEPTED' | 'PASSED' | 'EXPIRED';
};
export type CapitalState = {
  debt: DebtInstrumentState[]; debtStressPpm: PartsPerMillion; offers: FinanceOfferState[]; founderOwnershipBps: BasisPoints;
  financingHistory: EntityId[]; growthArrears: AnnualDollars; emergencyBridgeUsed: boolean;
};

export type ProgressionState = {
  purchasedSkillRankIds: ContentId[]; skillRanksByFunction: Record<FunctionId, Record<SkillBranch, number>>;
  activeStrategyId?: ContentId; strategyQuartersRemaining: number; ownedRelicIds: ContentId[]; eligibilityTags: string[];
};

export type FailureAttribution = {
  type: FailureType; beganAtTick: Tick; failedAtTick: Tick; bottleneckFunction: FunctionId;
  buildLabel: string; contributingActionIds: ActionId[]; contributingReasons: ReasonCode[]; explanation: string;
};
export type CausalLedgerEntry = CausalDelta & { id: EntityId; eventType: DomainEventType; atTick: Tick };
export type RunOutcomeState = {
  failureCandidates: FailureAttribution[]; causalLedger: CausalLedgerEntry[]; milestones: string[];
  unicornReached: boolean; finalResult?: FailureAttribution; finalStateHash?: string;
};

export type RunState = {
  header: RunHeader; clock: ClockState; quarter: QuarterState; economy: EconomyState;
  cohorts: { demand: DemandCohort[]; activated: ActivatedCohort[]; customers: CustomerCohort[] };
  functions: Record<FunctionId, FunctionState>; automation: { agents: AgentState[] };
  pressure: PressureState; capital: CapitalState; progression: ProgressionState; outcome: RunOutcomeState;
  founderAttention: FunctionId; seenActionIds: ActionId[]; lastActionSequence: number; eventSequence: number;
};
