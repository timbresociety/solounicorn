import { contentById } from '../content/v2-golden';
import { applyEffect } from '../effects/apply-effect';
import { evaluateEligibility } from '../effects/eligibility';
import { seedExpansionPresentationFixture, seedFinancePresentationFixture, seedOperationsPresentationFixture, seedRetentionPresentationFixture } from '../fixtures/v2-presentation';
import type { SemanticAction } from '../schema/actions';
import { asAgentId, asCohortId, asContentId, asCustomerId, asEntityId, asQueueItemId } from '../schema/ids';
import type { DomainEvent, DomainEventType, ReasonCode } from '../schema/events';
import type { AgentTierContent, CustomerArchetypeContent, MarketingSignalContent, ProductRecipeContent, RelicContent, SkillRankContent, StrategyContent } from '../schema/content';
import type { FailureAttribution, QueueItem, RunState, StrainBand } from '../schema/state';
import { annualDollars, basisPoints, cents, ppm, pressureUnits, tick, valuationDollars, workUnits } from '../schema/units';
import type { EngineContext } from './create-run';
import { DEFAULT_ENGINE_CONTEXT } from './create-run';
import { hashState } from './hash';
import { assertRunInvariants } from './invariants';
import { randomEvidence } from './random';

export type StepResult = { state: RunState; events: DomainEvent[]; checksum: string };

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const tune = (context: EngineContext, key: string) => {
  const value = context.balance.tuning[key];
  if (!value) throw new Error(`Missing calibration key ${key}`);
  return value.value;
};

function recalculateEconomy(state: RunState): void {
  state.economy.endingArr = annualDollars(state.economy.startingArr + state.economy.newCustomerArrQTD + state.economy.expansionArrQTD - state.economy.churnedArrQTD);
  state.quarter.newCustomerArr = state.economy.newCustomerArrQTD;
  state.quarter.expansionArr = state.economy.expansionArrQTD;
  state.quarter.churnedArr = state.economy.churnedArrQTD;
  state.quarter.endingArr = state.economy.endingArr;
  state.quarter.growthBps = basisPoints(state.economy.startingArr === 0 ? 0 : Math.floor(((state.economy.endingArr - state.economy.startingArr) * 10_000) / state.economy.startingArr));
  state.economy.valuation = valuationDollars(Math.floor((state.economy.endingArr * state.economy.growthMultipleBps) / 10_000));
}

function rotBand(rot: number, corruptedAt: number): RunState['pressure']['rotBand'] {
  const normalized = Math.floor((rot * 100) / Math.max(1, corruptedAt));
  if (normalized >= 100) return 'CORRUPTED';
  if (normalized >= 75) return 'AGENT_SLOP';
  if (normalized >= 50) return 'CONTEXT_ROT';
  if (normalized >= 25) return 'DRIFT';
  return 'FRESH';
}

function applyPressure(state: RunState, context: EngineContext, emit: (type: DomainEventType, payload?: Record<string, unknown>) => DomainEvent): void {
  const previousStrain = state.pressure.strainBand;
  const previousRot = state.pressure.rotBand;
  state.pressure.complexity = pressureUnits(state.pressure.complexityContributions.reduce((total, contribution) => total + contribution.amount, 0));
  state.pressure.strainPpm = ppm(Math.floor((state.pressure.complexity * 1_000_000) / Math.max(1, state.pressure.opsCapacity)));
  const row = context.balance.strainBands.value.find((band) => state.pressure.strainPpm <= band.maximumPpm);
  state.pressure.strainBand = (row?.band ?? 'RUNAWAY') as StrainBand;
  if (state.automation.agents.length && state.clock.phase === 'ACTIVE') {
    const rotIncrement = Math.floor((context.balance.rotPerAgentTickPpm.value * state.automation.agents.length * (row?.rotMultiplierPpm ?? 1_000_000)) / 1_000_000);
    if (rotIncrement > 0) state.pressure.rot = pressureUnits(state.pressure.rot + rotIncrement);
  }
  state.pressure.rotBand = rotBand(state.pressure.rot, tune(context, 'rotCorruptedThreshold'));
  if (previousStrain !== state.pressure.strainBand) emit('STRAIN_BAND_CHANGED', { from: previousStrain, to: state.pressure.strainBand, strainPpm: state.pressure.strainPpm });
  if (previousRot !== state.pressure.rotBand) emit('ROT_CHANGED', { from: previousRot, to: state.pressure.rotBand, rot: state.pressure.rot });
}

export function step(current: RunState, orderedActions: SemanticAction[] = [], context: EngineContext = DEFAULT_ENGINE_CONTEXT): StepResult {
  const state = clone(current);
  const events: DomainEvent[] = [];
  const emit = (type: DomainEventType, payload: Record<string, unknown> = {}, action?: SemanticAction, reason?: ReasonCode, amount?: number, unit?: NonNullable<DomainEvent['delta']>['unit']): DomainEvent => {
    state.eventSequence += 1;
    const event: DomainEvent = { eventVersion: 1, eventId: asEntityId(`evt-${state.header.runId}-${state.eventSequence}`), sequence: state.eventSequence, atTick: state.clock.tick, type, payload: { ...payload, actionId: action?.actionId } };
    if (reason && amount !== undefined && unit) {
      event.delta = { category: type.includes('CASH') || type.includes('COLLECTION') ? 'CASH' : type.includes('ARR') || type.includes('CUSTOMER') ? 'ARR' : type.includes('DEBT') ? 'DEBT' : type.includes('COMPLEXITY') || type.includes('ROT') || type.includes('STRAIN') ? 'PRESSURE' : 'RUN', reason, amount, unit, sourceIds: [], originatingActionId: action?.actionId };
      state.outcome.causalLedger.push({ ...event.delta, id: event.eventId, eventType: type, atTick: state.clock.tick });
    }
    events.push(event);
    return event;
  };
  const reject = (action: SemanticAction, code: string, details: string, commit = true) => {
    if (commit) {
      state.seenActionIds.push(action.actionId);
      state.lastActionSequence = Math.max(state.lastActionSequence, action.sequence);
    }
    emit('ACTION_REJECTED', { rejectedType: action.type, code, details }, action, 'INVALID_ACTION', 0, 'COUNT');
  };

  for (const action of orderedActions) {
    if (state.seenActionIds.includes(action.actionId)) { reject(action, 'DUPLICATE_ACTION', 'Action ID already committed.', false); continue; }
    if (action.sequence <= state.lastActionSequence) { reject(action, 'OUT_OF_ORDER', 'Action sequence must increase.', false); continue; }
    if (action.atTick !== state.clock.tick) { reject(action, action.atTick < state.clock.tick ? 'STALE_TICK' : 'FUTURE_TICK', 'Action must target the current authoritative tick.', false); continue; }

    let accepted = true;
    const semanticReject = (code: string, details: string) => { accepted = false; reject(action, code, details); };

    switch (action.type) {
      case 'RUN_FOUNDER_HISTORY_SELECTED': {
        if (state.clock.phase !== 'SETUP') semanticReject('WRONG_PHASE', 'Founder History is selected before the run.');
        else if (!contentById.has(action.payload.founderHistoryId)) semanticReject('UNKNOWN_CONTENT', 'Unknown Founder History.');
        else state.header.founderHistoryId = action.payload.founderHistoryId;
        break;
      }
      case 'RUN_GROWTH_MANDATE_SELECTED': {
        if (state.clock.phase !== 'SETUP') semanticReject('WRONG_PHASE', 'Growth Mandate is selected before the run.');
        else if (![1_000, 2_500, 5_000, 7_500, 10_000].includes(action.payload.growthMandateBps)) semanticReject('INVALID_MANDATE', 'Unsupported Growth Mandate.');
        else state.header.growthMandateBps = action.payload.growthMandateBps;
        break;
      }
      case 'RUN_STARTED': {
        if (state.clock.phase !== 'SETUP') semanticReject('WRONG_PHASE', 'Run has already started.');
        else if (!state.header.founderHistoryId || state.header.growthMandateBps === undefined) semanticReject('SETUP_INCOMPLETE', 'Select Founder History and Growth Mandate.');
        else {
          state.clock.phase = 'ACTIVE'; state.clock.paused = false;
          state.quarter.targetArr = annualDollars(state.quarter.startingArr + Math.floor((state.quarter.startingArr * state.header.growthMandateBps) / 10_000) + state.capital.growthArrears);
          emit('RUN_PHASE_CHANGED', { phase: 'ACTIVE', quarter: 1 }, action);
        }
        break;
      }
      case 'FOUNDER_FUNCTION_ENTERED': {
        if (state.clock.phase !== 'ACTIVE' || !state.functions[action.payload.functionId].unlocked) semanticReject('FUNCTION_LOCKED', 'Function is not currently available.');
        else { state.founderAttention = action.payload.functionId; if (state.clock.quarterIndex >= 2 && state.clock.tickInQuarter === 0) state.clock.paused = false; emit('FOUNDER_ATTENTION_CHANGED', { functionId: action.payload.functionId }, action); }
        break;
      }
      case 'MARKETING_OPPORTUNITY_IGNORED':
      case 'MARKETING_OPPORTUNITY_PURSUED':
      case 'MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED': {
        const signal = contentById.get(action.payload.opportunityId) as MarketingSignalContent | undefined;
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'MARKETING') semanticReject('WRONG_FUNCTION', 'Founder must be active in Marketing.');
        else if (!signal || signal.kind !== 'MARKETING_SIGNAL') semanticReject('UNKNOWN_SIGNAL', 'Unknown Marketing opportunity.');
        else if (state.cohorts.demand.some((cohort) => cohort.sourceId === signal.id)) semanticReject('ALREADY_RESOLVED', 'Marketing opportunity already resolved.');
        else {
          const ignored = action.type === 'MARKETING_OPPORTUNITY_IGNORED';
          const aggressive = action.type === 'MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED';
          emit('MARKETING_OPPORTUNITY_RESOLVED', { opportunityId: signal.id, decision: ignored ? 'IGNORE' : aggressive ? 'AGGRESSIVE' : 'PURSUE' }, action);
          if (!ignored) {
            const demandUnits = aggressive ? signal.aggressiveDemandUnits.value : signal.demandUnits.value;
            const cost = aggressive ? signal.aggressiveCostCents.value : signal.pursueCostCents.value;
            state.economy.cash = cents(state.economy.cash - cost);
            emit('CASH_CHANGED', { cents: -cost, balanceCents: state.economy.cash }, action, 'PLAYER_ACTION', -cost, 'CENTS');
            const demandId = asCohortId(`demand-${state.cohorts.demand.length + 1}`);
            const cohort = { id: demandId, sourceId: signal.id, source: signal.name, segment: signal.segment, quality: signal.quality, growthUnits: demandUnits, acquisitionCost: cost, requirements: signal.requirements, createdAtTick: state.clock.tick, expiresAtTick: tick(state.clock.tick + context.balance.demandExpiryTicks.value), history: [] as ReturnType<typeof asEntityId>[], status: 'IN_PRODUCT' as const };
            state.cohorts.demand.push(cohort);
            const requestId = asQueueItemId(`request-${state.cohorts.demand.length}`);
            const request: QueueItem = { id: requestId, kind: 'PRODUCT_REQUEST', sourceEntityId: asEntityId(demandId), createdAtTick: state.clock.tick, expiresAtTick: cohort.expiresAtTick, priority: aggressive ? 2 : 1, workRemaining: demandUnits, contentId: signal.requirements[0], metadata: { demandCohortId: demandId } };
            state.functions.PRODUCT.queue.push(request); state.functions.PRODUCT.unlocked = true;
            const created = emit('DEMAND_COHORT_CREATED', { cohortId: demandId, requestId, quality: signal.quality, growthUnits: demandUnits }, action, signal.quality === 'LOW' ? 'MARKETING_LOW_QUALITY' : 'MARKETING_QUALIFIED', demandUnits, 'WORK_UNITS');
            cohort.history.push(created.eventId);
            emit('QUEUE_CHANGED', { functionId: 'PRODUCT', queueLength: state.functions.PRODUCT.queue.length }, action);
          }
        }
        break;
      }
      case 'PRODUCT_COMPONENT_PLACED': {
        const request = state.functions.PRODUCT.queue.find((item) => item.id === action.payload.requestId);
        const recipe = request ? contentById.get(request.contentId) as ProductRecipeContent | undefined : undefined;
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'PRODUCT') semanticReject('WRONG_FUNCTION', 'Founder must be active in Product.');
        else if (!request || !recipe || recipe.kind !== 'PRODUCT_RECIPE') semanticReject('UNKNOWN_REQUEST', 'Product request is unavailable.');
        else {
          state.functions.PRODUCT.activeRecipe ??= { requestId: request.id, recipeId: recipe.id, placedComponentIds: [], tested: false, verified: false };
          const slotIndex = recipe.slotIds.indexOf(action.payload.slotId);
          const correct = slotIndex >= 0 && recipe.componentIds[slotIndex] === action.payload.componentId && !state.functions.PRODUCT.activeRecipe.placedComponentIds.includes(action.payload.componentId);
          if (correct) {
            state.functions.PRODUCT.activeRecipe.placedComponentIds.push(action.payload.componentId);
            emit('PRODUCT_COMPONENT_ACCEPTED', { requestId: request.id, componentId: action.payload.componentId, slotId: action.payload.slotId }, action);
          } else {
            request.expiresAtTick = tick((request.expiresAtTick ?? state.clock.tick) - tune(context, 'productWrongPieceDelayTicks'));
            emit('PRODUCT_COMPONENT_REJECTED', { requestId: request.id, componentId: action.payload.componentId, slotId: action.payload.slotId, consequence: 'REWORK_DELAY' }, action);
          }
        }
        break;
      }
      case 'PRODUCT_RECIPE_TESTED': {
        const active = state.functions.PRODUCT.activeRecipe;
        const recipe = active ? contentById.get(active.recipeId) as ProductRecipeContent | undefined : undefined;
        if (!active || active.requestId !== action.payload.requestId || !recipe) semanticReject('NO_ACTIVE_RECIPE', 'No matching Product recipe.');
        else if (active.placedComponentIds.length !== recipe.componentIds.length) semanticReject('RECIPE_INCOMPLETE', 'Place every required component before testing.');
        else { active.tested = true; active.verified = true; emit('PRODUCT_RECIPE_TESTED', { requestId: active.requestId, verified: true }, action); }
        break;
      }
      case 'PRODUCT_RECIPE_SHIPPED': {
        const active = state.functions.PRODUCT.activeRecipe;
        const request = active ? state.functions.PRODUCT.queue.find((item) => item.id === active.requestId) : undefined;
        const recipe = active ? contentById.get(active.recipeId) as ProductRecipeContent | undefined : undefined;
        if (!active || !request || !recipe || active.requestId !== action.payload.requestId) semanticReject('NO_ACTIVE_RECIPE', 'No matching Product recipe.');
        else if (active.placedComponentIds.length !== recipe.componentIds.length) semanticReject('RECIPE_INCOMPLETE', 'Place every required component before shipping.');
        else if (action.payload.mode === 'VERIFIED' && !active.verified) semanticReject('NOT_VERIFIED', 'Test the recipe before verified shipping.');
        else {
          const demand = state.cohorts.demand.find((cohort) => cohort.id === request.metadata.demandCohortId);
          if (!demand) { semanticReject('MISSING_COHORT', 'Product request has no Demand provenance.'); break; }
          const activationId = asCohortId(`activation-${state.cohorts.activated.length + 1}`);
          const implementationRiskPpm = action.payload.mode === 'EARLY' ? recipe.earlyShipRiskPpm.value : ppm(0);
          state.cohorts.activated.push({ id: activationId, demandCohortId: demand.id, recipeId: recipe.id, segment: demand.segment, quality: demand.quality, productQualityPpm: recipe.activationQualityPpm.value, implementationRiskPpm, createdAtTick: state.clock.tick, history: [], status: 'WAITING' });
          demand.status = 'ACTIVATED';
          state.functions.PRODUCT.queue = state.functions.PRODUCT.queue.filter((item) => item.id !== request.id);
          state.functions.PRODUCT.activeRecipe = undefined;
          const pricingId = asQueueItemId(`pricing-${state.cohorts.activated.length}`);
          state.functions.MONETIZATION.queue.push({ id: pricingId, kind: 'PRICING_OPPORTUNITY', sourceEntityId: asEntityId(activationId), createdAtTick: state.clock.tick, expiresAtTick: tick(state.clock.tick + context.balance.pricingOpportunityExpiryTicks.value), priority: 1, workRemaining: workUnits(1_000), contentId: asContentId('customer.support-scaleup'), metadata: { activationCohortId: activationId, model: 'PER_SEAT' } });
          state.functions.MONETIZATION.unlocked = true;
          emit('PRODUCT_RECIPE_SHIPPED', { requestId: request.id, mode: action.payload.mode, riskPpm: implementationRiskPpm }, action, action.payload.mode === 'EARLY' ? 'PRODUCT_EARLY_SHIP' : 'PRODUCT_VERIFIED', 1, 'COUNT');
          emit('ACTIVATED_COHORT_CREATED', { cohortId: activationId, demandCohortId: demand.id, pricingId }, action);
          emit('QUEUE_CHANGED', { functionId: 'MONETIZATION', queueLength: state.functions.MONETIZATION.queue.length }, action);
        }
        break;
      }
      case 'MONETIZATION_MODEL_SELECTED': {
        const pricing = state.functions.MONETIZATION.queue.find((item) => item.id === action.payload.activationId);
        if (!pricing) semanticReject('UNKNOWN_PRICING_OPPORTUNITY', 'Pricing opportunity is unavailable.');
        else { pricing.metadata.model = action.payload.model; emit('PRICING_MODEL_CHANGED', { pricingId: pricing.id, model: action.payload.model }, action); }
        break;
      }
      case 'MONETIZATION_PRICE_COMMITTED': {
        const pricing = state.functions.MONETIZATION.queue.find((item) => item.id === action.payload.activationId);
        const activation = pricing ? state.cohorts.activated.find((cohort) => cohort.id === pricing.metadata.activationCohortId) : undefined;
        const customerType = pricing ? contentById.get(pricing.contentId) as CustomerArchetypeContent | undefined : undefined;
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'MONETIZATION') semanticReject('WRONG_FUNCTION', 'Founder must be active in Monetization.');
        else if (!pricing || !activation || !customerType || customerType.kind !== 'CUSTOMER_ARCHETYPE') semanticReject('UNKNOWN_PRICING_OPPORTUNITY', 'Pricing opportunity is unavailable.');
        else if (action.payload.cursorTick !== action.atTick) semanticReject('INVALID_CURSOR_TICK', 'Pricing commit must use the authoritative action tick.');
        else {
          const cursor = (action.payload.cursorTick % tune(context, 'pricingCycleTicks')) * 1_000_000 / tune(context, 'pricingCycleTicks');
          const perfect = cursor >= customerType.perfectBandStartPpm.value && cursor <= customerType.perfectBandEndPpm.value;
          const good = cursor >= customerType.perfectBandStartPpm.value - 180_000 && cursor <= customerType.perfectBandEndPpm.value + 180_000;
          const multiplier = perfect ? tune(context, 'pricingPerfectMultiplierPpm') : good ? tune(context, 'pricingGoodMultiplierPpm') : tune(context, 'pricingPoorMultiplierPpm');
          const bookedArr = annualDollars(Math.floor(customerType.baseArr.value * multiplier / 1_000_000));
          const customerId = asCustomerId(`customer-${state.cohorts.customers.length + 1}`);
          state.cohorts.customers.push({ id: customerId, activationCohortId: activation.id, segment: activation.segment, originalArr: bookedArr, currentArr: bookedArr, health: 'HEALTHY', acquisitionQuality: activation.quality, productQualityPpm: activation.productQualityPpm, expansionPotentialPpm: customerType.expansionPotentialPpm.value, pricingModel: String(pricing.metadata.model) as 'FLAT' | 'PER_SEAT' | 'USAGE', createdAtTick: state.clock.tick, ageTicks: tick(0), churnRiskPpm: activation.implementationRiskPpm, expansionBookedThisQuarter: annualDollars(0), history: [] });
          activation.status = 'CONVERTED';
          state.functions.MONETIZATION.queue = state.functions.MONETIZATION.queue.filter((item) => item.id !== pricing.id);
          state.economy.newCustomerArrQTD = annualDollars(state.economy.newCustomerArrQTD + bookedArr);
          const collected = cents(Math.floor(bookedArr * 100 * context.balance.customerCollectionsPpmPerQuarter.value / 1_000_000));
          state.economy.cash = cents(state.economy.cash + collected); state.economy.collectionsQTD = cents(state.economy.collectionsQTD + collected);
          recalculateEconomy(state);
          emit('PRICING_COMMITTED', { pricingId: pricing.id, cursorPpm: Math.floor(cursor), band: perfect ? 'PERFECT' : good ? 'GOOD' : 'POOR' }, action);
          emit('CUSTOMER_CONVERTED', { customerId, cohortId: activation.id, annualDollars: bookedArr }, action, 'MONETIZATION_PRICE', bookedArr, 'ANNUAL_DOLLARS');
          emit('ARR_CHANGED', { annualDollars: bookedArr, endingArr: state.economy.endingArr }, action, 'MONETIZATION_PRICE', bookedArr, 'ANNUAL_DOLLARS');
          emit('COLLECTIONS_POSTED', { cents: collected, balanceCents: state.economy.cash }, action, 'CUSTOMER_COLLECTION', collected, 'CENTS');
          if (!state.outcome.milestones.includes('FIRST_CUSTOMER_ARR')) state.outcome.milestones.push('FIRST_CUSTOMER_ARR');
          if (!context.balance.runtimeReady) seedRetentionPresentationFixture(state);
        }
        break;
      }
      case 'RETENTION_THREAT_PRIORITIZED': {
        const threat = state.functions.RETENTION.queue.find((item) => item.id === action.payload.threatId);
        const customer = state.cohorts.customers.find((item) => item.id === action.payload.customerId);
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'RETENTION') semanticReject('WRONG_FUNCTION', 'Founder must be active in Retention.');
        else if (!threat || !customer || String(threat.sourceEntityId) !== String(customer.id)) semanticReject('UNKNOWN_THREAT', 'Retention threat or customer is unavailable.');
        else if (threat.metadata.resolved === true) semanticReject('ALREADY_RESOLVED', 'Retention threat is already resolved.');
        else {
          state.functions.RETENTION.queue.forEach((item) => { item.metadata.prioritized = item.id === threat.id; });
          threat.metadata.resolved = true;
          threat.workRemaining = workUnits(0);
          customer.health = 'HEALTHY';
          emit('RETENTION_PRIORITY_CHANGED', { threatId: threat.id, customerId: customer.id, prioritized: true }, action);
          emit('RETENTION_THREAT_RESOLVED', { threatId: threat.id, customerId: customer.id, balanceSource: threat.balanceSource }, action);
          emit('CHURN_PREVENTED', { threatId: threat.id, customerId: customer.id, annualDollars: customer.currentArr, balanceSource: threat.balanceSource }, action);
          if (!context.balance.runtimeReady) seedExpansionPresentationFixture(state);
        }
        break;
      }
      case 'RETENTION_THREAT_PRIORITY_CLEARED': {
        const threat = state.functions.RETENTION.queue.find((item) => item.id === action.payload.threatId);
        if (!threat) semanticReject('UNKNOWN_THREAT', 'Retention threat is unavailable.'); else { threat.metadata.prioritized = false; emit('RETENTION_PRIORITY_CHANGED', { threatId: threat.id, prioritized: false }, action); }
        break;
      }
      case 'EXPANSION_ITEMS_MERGED': {
        const need = state.functions.EXPANSION.queue[0];
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'EXPANSION' || !need) semanticReject('WRONG_FUNCTION', 'Founder must be active in Expansion with an account need.');
        else {
          const outputs = Array.isArray(need.metadata.mergedOutputs) ? need.metadata.mergedOutputs : [];
          const pair = [String(action.payload.firstItemId), String(action.payload.secondItemId)].sort().join('+');
          const output = pair === 'analytics-a+analytics-b' ? 'intelligence' : pair === 'automation-a+automation-b' ? 'workflow' : undefined;
          if (!output || outputs.includes(output)) semanticReject('INVALID_MERGE', 'Those modules cannot produce a new account package capability.');
          else { need.metadata.mergedOutputs = [...outputs, output]; emit('EXPANSION_ITEM_MERGED', { ...action.payload, output }, action); }
        }
        break;
      }
      case 'EXPANSION_PACKAGE_ITEM_PLACED': {
        const need = state.functions.EXPANSION.queue[0];
        if (!need || String(need.metadata.packageId) !== String(action.payload.packageId)) semanticReject('UNKNOWN_PACKAGE', 'Expansion package is unavailable.');
        else {
          const outputs = Array.isArray(need.metadata.mergedOutputs) ? need.metadata.mergedOutputs : [];
          const placed = Array.isArray(need.metadata.placedItems) ? need.metadata.placedItems : [];
          const item = String(action.payload.itemId);
          if (!outputs.includes(item) || placed.includes(item)) semanticReject('INVALID_PACKAGE_ITEM', 'Package needs a newly merged capability.');
          else { need.metadata.placedItems = [...placed, item]; emit('QUEUE_CHANGED', { functionId: 'EXPANSION', ...action.payload }, action); }
        }
        break;
      }
      case 'EXPANSION_PACKAGE_COMMITTED': {
        const customer = state.cohorts.customers.find((item) => item.id === action.payload.customerId);
        const need = state.functions.EXPANSION.queue[0];
        const placed = need && Array.isArray(need.metadata.placedItems) ? need.metadata.placedItems : [];
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'EXPANSION' || !need || String(need.metadata.packageId) !== String(action.payload.packageId) || !placed.includes('intelligence') || !placed.includes('workflow')) semanticReject('PACKAGE_INCOMPLETE', 'Create and fit both requested capabilities before committing.');
        else if (!customer) semanticReject('UNKNOWN_CUSTOMER', 'Customer is unavailable.');
        else {
          const cap = Math.floor(customer.currentArr * tune(context, 'expansionCapPpm') / 1_000_000);
          const booked = annualDollars(Math.max(0, cap - customer.expansionBookedThisQuarter));
          customer.currentArr = annualDollars(customer.currentArr + booked); customer.expansionBookedThisQuarter = annualDollars(customer.expansionBookedThisQuarter + booked);
          state.economy.expansionArrQTD = annualDollars(state.economy.expansionArrQTD + booked); recalculateEconomy(state);
          emit('EXPANSION_PACKAGE_COMMITTED', { packageId: action.payload.packageId, customerId: customer.id }, action);
          emit('EXPANSION_BOOKED', { customerId: customer.id, annualDollars: booked }, action, 'EXPANSION_FIT', booked, 'ANNUAL_DOLLARS');
          need.metadata.committed = true;
          if (!context.balance.runtimeReady) seedOperationsPresentationFixture(state);
        }
        break;
      }
      case 'OPERATIONS_EVIDENCE_REVEALED': {
        const obligation = state.functions.OPERATIONS.queue.find((item) => item.id === action.payload.obligationId);
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'OPERATIONS' || !obligation) semanticReject('UNKNOWN_OBLIGATION', 'Operations obligation is unavailable.');
        else {
          const revealed = Array.isArray(obligation.metadata.revealedCells) ? obligation.metadata.revealedCells : [];
          const cell = String(action.payload.cellId);
          if (revealed.includes(cell)) semanticReject('ALREADY_REVEALED', 'That evidence is already revealed.');
          else { obligation.metadata.revealedCells = [...revealed, cell]; emit('OPERATIONS_EVIDENCE_REVEALED', action.payload, action); }
        }
        break;
      }
      case 'OPERATIONS_RESOLUTION_CHOSEN': {
        const obligation = state.functions.OPERATIONS.queue.find((item) => item.id === action.payload.obligationId);
        const revealed = obligation && Array.isArray(obligation.metadata.revealedCells) ? obligation.metadata.revealedCells : [];
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'OPERATIONS' || !obligation || revealed.length < 3) { semanticReject('EVIDENCE_INCOMPLETE', 'Reveal the operational evidence before choosing a resolution.'); break; }
        state.pressure.rot = pressureUnits(Math.max(0, state.pressure.rot - tune(context, 'operationsRecoveryAmount')));
        state.functions.OPERATIONS.queue = state.functions.OPERATIONS.queue.filter((item) => item.id !== action.payload.obligationId);
        emit('OPERATIONS_OBLIGATION_RESOLVED', { ...action.payload, rot: state.pressure.rot }, action, 'OPERATIONS_RECOVERY', -tune(context, 'operationsRecoveryAmount'), 'PRESSURE_UNITS');
        if (!context.balance.runtimeReady) seedFinancePresentationFixture(state);
        break;
      }
      case 'OPERATIONS_OPTIMIZER_ACCEPTED': {
        const draw = randomEvidence(state.header.seed, state.header.randomVersion, 'operations.optimizer', action.payload.optimizerId, state.clock.tick);
        emit('OPTIMIZER_RESOLVED', { optimizerId: action.payload.optimizerId, outcome: draw.normalizedPpm < 550_000 ? 'SAVING' : 'INCIDENT', random: draw }, action);
        break;
      }
      case 'OPERATIONS_OPTIMIZER_DISMISSED': emit('OPTIMIZER_RESOLVED', { optimizerId: action.payload.optimizerId, outcome: 'DISMISSED' }, action); break;
      case 'AGENT_INSTALLED': {
        const tier = contentById.get(action.payload.agentTierId) as AgentTierContent | undefined;
        if (!tier || tier.kind !== 'AGENT_TIER') semanticReject('UNKNOWN_AGENT_TIER', 'Agent tier is unavailable.');
        else if (state.economy.cash < tier.recurringCostCents.value) semanticReject('INSUFFICIENT_CASH', 'Not enough Cash to install agent.');
        else {
          const agentId = asAgentId(`agent-${state.automation.agents.length + 1}`);
          state.automation.agents.push({ id: agentId, tierId: tier.id, assignedFunction: action.payload.functionId, throughput: tier.throughput.value, reliabilityPpm: tier.reliabilityPpm.value, recurringCostCents: tier.recurringCostCents.value, complexity: tier.complexity.value, rot: pressureUnits(0), status: 'ACTIVE', completedWork: 0, failedWork: 0 });
          state.economy.cash = cents(state.economy.cash - tier.recurringCostCents.value);
          state.pressure.complexityContributions.push({ id: asEntityId(`complexity-${agentId}`), sourceId: asEntityId(agentId), reason: 'AGENT_STRUCTURE', amount: tier.complexity.value, removable: true });
          emit('AGENT_INSTALLED', { agentId, functionId: action.payload.functionId, tierId: tier.id }, action);
          emit('CASH_CHANGED', { cents: -tier.recurringCostCents.value, balanceCents: state.economy.cash }, action, 'AGENT_STRUCTURE', -tier.recurringCostCents.value, 'CENTS');
        }
        break;
      }
      case 'AGENT_ASSIGNED': {
        const agent = state.automation.agents.find((item) => item.id === action.payload.agentId);
        if (!agent) semanticReject('UNKNOWN_AGENT', 'Agent is unavailable.'); else { agent.assignedFunction = action.payload.functionId; emit('AGENT_ASSIGNED', action.payload, action); }
        break;
      }
      case 'AGENT_POLICY_SET': {
        const agent = state.automation.agents.find((item) => item.id === action.payload.agentId);
        if (!agent) semanticReject('UNKNOWN_AGENT', 'Agent is unavailable.'); else agent.policyId = action.payload.policyId;
        break;
      }
      case 'AGENT_LINE_RESET': {
        const agent = state.automation.agents.find((item) => item.id === action.payload.agentId);
        if (!agent) semanticReject('UNKNOWN_AGENT', 'Agent is unavailable.'); else { agent.status = 'ACTIVE'; agent.rot = pressureUnits(0); emit('AGENT_LINE_RESET', { agentId: agent.id }, action); }
        break;
      }
      case 'AGENT_UPGRADED':
      case 'AGENT_EXCEPTION_APPROVED': emit('AGENT_WORKED', action.payload, action); break;
      case 'FINANCE_DEBT_DRAWN': {
        const instrument = contentById.get(action.payload.instrumentId);
        if (!instrument || instrument.kind !== 'FINANCE_INSTRUMENT') semanticReject('UNKNOWN_INSTRUMENT', 'Debt instrument is unavailable.');
        else {
          const id = asEntityId(`debt-${state.capital.debt.length + 1}`);
          state.capital.debt.push({ id, instrumentId: instrument.id, principalCents: instrument.principalCents.value, aprBps: instrument.aprBps.value, accruedInterestCents: cents(0), nextDueTick: tick(state.clock.tick + Math.floor(instrument.termTicks.value / 4)), status: 'ACTIVE' });
          state.economy.cash = cents(state.economy.cash + instrument.principalCents.value); state.capital.financingHistory.push(id);
          emit('DEBT_DRAWN', { instrumentId: instrument.id, cents: instrument.principalCents.value }, action, 'FINANCE_TRANSACTION', instrument.principalCents.value, 'CENTS');
        }
        break;
      }
      case 'FINANCE_PRINCIPAL_PAID': {
        const debt = state.capital.debt.find((item) => item.instrumentId === action.payload.instrumentId && item.status === 'ACTIVE');
        const amount = Math.max(0, Math.min(action.payload.amountCents, debt?.principalCents ?? 0, state.economy.cash));
        if (!debt || amount === 0) semanticReject('INVALID_PAYMENT', 'No payable principal.'); else { debt.principalCents = cents(debt.principalCents - amount); state.economy.cash = cents(state.economy.cash - amount); if (debt.principalCents === 0) debt.status = 'PAID'; emit('DEBT_PAYMENT_POSTED', { debtId: debt.id, cents: amount, kind: 'PRINCIPAL' }, action, 'DEBT_SERVICE', -amount, 'CENTS'); }
        break;
      }
      case 'FINANCE_MANDATE_MISS_BRIDGED': {
        if (state.capital.emergencyBridgeUsed) semanticReject('BRIDGE_ALREADY_USED', 'Emergency bridge is once per run.');
        else { state.capital.emergencyBridgeUsed = true; state.capital.growthArrears = annualDollars(action.payload.shortfallAnnualDollars); const principal = cents(action.payload.shortfallAnnualDollars * tune(context, 'emergencyBridgeDebtCentsPerArrDollar')); state.economy.cash = cents(state.economy.cash + principal); emit('GROWTH_ARREARS_CHANGED', { annualDollars: state.capital.growthArrears, principalCents: principal }, action); }
        break;
      }
      case 'FINANCE_OFFER_OPENED': {
        const offer = state.functions.FINANCE.queue.find((item) => item.id === action.payload.offerId);
        if (state.clock.phase !== 'ACTIVE' || state.founderAttention !== 'FINANCE' || !offer) semanticReject('UNKNOWN_OFFER', 'Finance offer is unavailable.');
        else { offer.metadata.opened = true; emit('FINANCE_OFFER_RESOLVED', { action: action.type, offerId: offer.id }, action); }
        break;
      }
      case 'FINANCE_OFFER_ACCEPTED': {
        const offer = state.functions.FINANCE.queue.find((item) => item.id === action.payload.offerId);
        if (!offer || offer.metadata.opened !== true || offer.metadata.resolved === true) semanticReject('INVALID_OFFER_ACCEPTANCE', 'Open an available Finance offer before accepting it.');
        else {
          const check = Number(offer.metadata.checkCents); const dilution = Number(offer.metadata.dilutionBps);
          state.economy.cash = cents(state.economy.cash + check); state.capital.founderOwnershipBps = basisPoints(Math.max(0, state.capital.founderOwnershipBps - dilution)); offer.metadata.resolved = true;
          emit('CASH_CHANGED', { cents: check, balanceCents: state.economy.cash }, action, 'FINANCE_TRANSACTION', check, 'CENTS');
          emit('OWNERSHIP_CHANGED', { dilutionBps: dilution, founderOwnershipBps: state.capital.founderOwnershipBps }, action, 'FINANCE_TRANSACTION', -dilution, 'BASIS_POINTS');
          emit('FINANCE_OFFER_RESOLVED', { action: action.type, offerId: offer.id, balanceSource: offer.balanceSource }, action);
        }
        break;
      }
      case 'FINANCE_OFFER_COUNTERED':
      case 'FINANCE_OFFER_PASSED':
      case 'FINANCE_INTEREST_PAID':
      case 'FINANCE_DEBT_REFINANCED':
      case 'FINANCE_OBLIGATION_IGNORED': emit('FINANCE_OFFER_RESOLVED', { action: action.type, ...action.payload }, action); break;
      case 'SKILL_RANK_PURCHASED': {
        const skill = contentById.get(action.payload.skillRankId) as SkillRankContent | undefined;
        if (state.clock.phase !== 'QUARTER_CLOSE' || state.quarter.closeStage !== 'INVEST') semanticReject('WRONG_PHASE', 'Skills are purchased during quarter investment.');
        else if (!skill || skill.kind !== 'SKILL_RANK') semanticReject('UNKNOWN_SKILL', 'Skill rank is unavailable.');
        else if (state.progression.purchasedSkillRankIds.includes(skill.id)) semanticReject('ALREADY_OWNED', 'Skill rank is already owned.');
        else if (skill.prerequisiteIds.some((id) => !state.progression.purchasedSkillRankIds.includes(id))) semanticReject('PREREQUISITE_MISSING', 'Skill prerequisite is missing.');
        else if (!evaluateEligibility(state, skill.eligibility).eligible) semanticReject('INELIGIBLE', 'Skill eligibility is not satisfied.');
        else if (state.economy.cash < skill.costCents.value) semanticReject('INSUFFICIENT_CASH', 'Not enough Cash.');
        else {
          state.economy.cash = cents(state.economy.cash - skill.costCents.value); state.progression.purchasedSkillRankIds.push(skill.id); state.progression.skillRanksByFunction[skill.functionId][skill.branch] += 1;
          skill.effects.sort((a, b) => a.precedence - b.precedence).forEach((effect) => applyEffect(state, effect, skill.id));
          emit('SKILL_RANK_PURCHASED', { skillRankId: skill.id, functionId: skill.functionId, branch: skill.branch, costCents: skill.costCents.value }, action, 'SKILL_EFFECT', -skill.costCents.value, 'CENTS');
        }
        break;
      }
      case 'QUARTER_RELIC_CHOSEN': {
        const relic = contentById.get(action.payload.relicId) as RelicContent | undefined;
        if (!relic || relic.kind !== 'RELIC' || !evaluateEligibility(state, relic.eligibility).eligible) semanticReject('INELIGIBLE_RELIC', 'Relic is unavailable.'); else { state.progression.ownedRelicIds.push(relic.id); relic.effects.forEach((effect) => applyEffect(state, effect, relic.id)); emit('RELIC_ACQUIRED', { relicId: relic.id }, action); }
        break;
      }
      case 'QUARTER_STRATEGY_CHOSEN': {
        const strategy = contentById.get(action.payload.strategyId) as StrategyContent | undefined;
        if (!strategy || strategy.kind !== 'STRATEGY' || !evaluateEligibility(state, strategy.eligibility).eligible) semanticReject('INELIGIBLE_STRATEGY', 'Strategy is unavailable.'); else { state.progression.activeStrategyId = strategy.id; state.progression.strategyQuartersRemaining = strategy.durationQuarters; strategy.effects.forEach((effect) => applyEffect(state, effect, strategy.id)); emit('STRATEGY_ACTIVATED', { strategyId: strategy.id, quarters: strategy.durationQuarters }, action); }
        break;
      }
      case 'QUARTER_INVESTING_FINISHED': if (state.clock.phase !== 'QUARTER_CLOSE') semanticReject('WRONG_PHASE', 'Quarter is not closing.'); else state.quarter.closeStage = 'READY'; break;
      case 'QUARTER_NEXT_STARTED': {
        if (state.clock.phase !== 'QUARTER_CLOSE' || !['INVEST', 'READY'].includes(state.quarter.closeStage ?? '')) semanticReject('WRONG_PHASE', 'Finish quarter investment first.');
        else if (state.quarter.mandateMet === false && state.capital.growthArrears === 0) {
          fail(state, 'GROWTH_MANDATE_MISSED', state.founderAttention, `Ending ARR ${state.quarter.endingArr} did not reach target ARR ${state.quarter.targetArr}.`, emit);
        }
        else {
          state.clock.quarterIndex += 1; state.clock.tickInQuarter = tick(0); state.clock.phase = 'ACTIVE'; state.clock.paused = true;
          state.quarter = { index: state.clock.quarterIndex, startingArr: state.economy.endingArr, targetArr: annualDollars(state.economy.endingArr + Math.floor(state.economy.endingArr * (state.header.growthMandateBps ?? 0) / 10_000) + state.capital.growthArrears), newCustomerArr: annualDollars(0), expansionArr: annualDollars(0), churnedArr: annualDollars(0), endingArr: state.economy.endingArr, growthBps: basisPoints(0) };
          state.economy.startingArr = state.economy.endingArr; state.economy.newCustomerArrQTD = annualDollars(0); state.economy.expansionArrQTD = annualDollars(0); state.economy.churnedArrQTD = annualDollars(0); state.economy.collectionsQTD = cents(0);
          state.cohorts.customers.forEach((customer) => { customer.expansionBookedThisQuarter = annualDollars(0); });
          if (state.progression.strategyQuartersRemaining > 0) state.progression.strategyQuartersRemaining -= 1;
          emit('RUN_PHASE_CHANGED', { phase: 'ACTIVE', quarter: state.clock.quarterIndex }, action); emit('RUN_CONTINUED', { quarter: state.clock.quarterIndex }, action);
        }
        break;
      }
      case 'RUN_CONTINUED_AFTER_UNICORN': if (!state.outcome.unicornReached) semanticReject('UNICORN_NOT_REACHED', 'Unicorn checkpoint has not been reached.'); else { state.clock.phase = 'ACTIVE'; state.clock.paused = false; emit('RUN_CONTINUED', { afterUnicorn: true }, action); } break;
      case 'RUN_ABANDONED': state.clock.phase = 'ABANDONED'; state.clock.paused = true; break;
    }

    if (accepted) {
      state.seenActionIds.push(action.actionId); state.lastActionSequence = action.sequence;
      emit('ACTION_ACCEPTED', { acceptedType: action.type }, action);
    }
  }

  if (state.clock.phase === 'ACTIVE' && !state.clock.paused) {
    state.clock.tick = tick(state.clock.tick + 1); state.clock.tickInQuarter = tick(state.clock.tickInQuarter + 1);
    state.cohorts.customers.forEach((customer) => { customer.ageTicks = tick(customer.ageTicks + 1); });
    applyPressure(state, context, emit);
    if (state.clock.tickInQuarter >= context.balance.ticksPerQuarter.value) {
      recalculateEconomy(state); state.clock.phase = 'QUARTER_CLOSE'; state.clock.paused = true; state.quarter.closeStage = 'INVEST';
      state.quarter.mandateMet = state.economy.endingArr >= state.quarter.targetArr;
      emit('QUARTER_CLOSED', { quarter: state.quarter.index, startingArr: state.quarter.startingArr, newCustomerArr: state.quarter.newCustomerArr, expansionArr: state.quarter.expansionArr, churnedArr: state.quarter.churnedArr, endingArr: state.quarter.endingArr });
      emit(state.quarter.mandateMet ? 'GROWTH_MANDATE_MET' : 'GROWTH_MANDATE_MISSED', { targetArr: state.quarter.targetArr, endingArr: state.quarter.endingArr });
      emit('VALUATION_RERATED', { endingArr: state.economy.endingArr, multipleBps: state.economy.growthMultipleBps, valuation: state.economy.valuation });
    }
  }

  if (state.clock.phase === 'ACTIVE' && state.economy.cash < context.balance.bankruptcyFloorCents.value) fail(state, 'BANKRUPT', 'FINANCE', 'Cash fell below the configured bankruptcy floor.', emit);
  if (state.clock.phase === 'ACTIVE' && state.pressure.rotBand === 'CORRUPTED') fail(state, 'CONTEXT_CORRUPTION', 'OPERATIONS', 'Autonomous context crossed the corruption threshold.', emit);
  if (state.economy.valuation >= context.balance.unicornValuationDollars.value && !state.outcome.unicornReached) { state.outcome.unicornReached = true; state.clock.phase = 'UNICORN_CHECKPOINT'; state.clock.paused = true; emit('UNICORN_REACHED', { valuation: state.economy.valuation }); }

  recalculateEconomy(state);
  assertRunInvariants(state);
  const checksum = hashState(state);
  if (state.clock.phase === 'FAILED' || state.clock.phase === 'ABANDONED') state.outcome.finalStateHash = checksum;
  return { state, events, checksum };
}

function fail(state: RunState, type: FailureAttribution['type'], bottleneckFunction: FailureAttribution['bottleneckFunction'], explanation: string, emit: (type: DomainEventType, payload?: Record<string, unknown>) => DomainEvent): void {
  const attribution: FailureAttribution = { type, beganAtTick: tick(Math.max(0, state.clock.tick - 30)), failedAtTick: state.clock.tick, bottleneckFunction, buildLabel: classifyBuild(state), contributingActionIds: state.seenActionIds.slice(-5), contributingReasons: type === 'BANKRUPT' ? ['BANKRUPTCY'] : ['CONTEXT_CORRUPTION'], explanation };
  state.outcome.failureCandidates.push(attribution); state.outcome.finalResult = attribution; state.clock.phase = 'FAILED'; state.clock.paused = true;
  emit('FAILURE_CANDIDATE_CREATED', { attribution }); emit('RUN_FAILED', { attribution });
}

function classifyBuild(state: RunState): string {
  const ranks = Object.values(state.progression.skillRanksByFunction).reduce((totals, row) => ({ CRAFT: totals.CRAFT + row.CRAFT, SCALE: totals.SCALE + row.SCALE, AUTONOMY: totals.AUTONOMY + row.AUTONOMY, VARIANCE: totals.VARIANCE + row.VARIANCE }), { CRAFT: 0, SCALE: 0, AUTONOMY: 0, VARIANCE: 0 });
  const leader = (Object.keys(ranks) as Array<keyof typeof ranks>).sort((a, b) => ranks[b] - ranks[a])[0];
  return `${leader} ${state.capital.debt.some((debt) => debt.status === 'ACTIVE') ? 'LEVERAGED' : 'BOOTSTRAP'}PER`;
}
