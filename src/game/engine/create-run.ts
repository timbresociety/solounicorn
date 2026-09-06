import { V2_GOLDEN_BALANCE } from '../balance/v2-golden';
import { V2_GOLDEN_CONTENT } from '../content/v2-golden';
import type { FunctionId } from '../schema/actions';
import { asRunId } from '../schema/ids';
import type { BalancePack } from '../schema/balance';
import type { ContentPack } from '../schema/content';
import type { FunctionState, RunState, SkillBranch } from '../schema/state';
import { annualDollars, basisPoints, cents, ppm, pressureUnits, tick, valuationDollars, workUnits } from '../schema/units';

export type EngineContext = { balance: BalancePack; content: ContentPack };
export const DEFAULT_ENGINE_CONTEXT: EngineContext = { balance: V2_GOLDEN_BALANCE, content: V2_GOLDEN_CONTENT };

const FUNCTION_IDS: FunctionId[] = ['MARKETING', 'PRODUCT', 'MONETIZATION', 'RETENTION', 'EXPANSION', 'OPERATIONS', 'FINANCE'];
const emptyFunction = (id: FunctionId): FunctionState => ({
  id, unlocked: id === 'MARKETING', queue: [], queueLimit: 4, capacity: workUnits(1_000),
  manualWork: workUnits(0), agentWork: workUnits(0), localRiskPpm: ppm(0),
});
const emptyBranches = (): Record<SkillBranch, number> => ({ CRAFT: 0, SCALE: 0, AUTONOMY: 0, VARIANCE: 0 });

export function createRun(seed: number, context: EngineContext = DEFAULT_ENGINE_CONTEXT, runId = `run-${seed}`): RunState {
  const startingArr = annualDollars(context.balance.startingArr.value);
  const multiple = context.balance.growthMultipleBps.value;
  const functions = Object.fromEntries(FUNCTION_IDS.map((id) => [id, emptyFunction(id)])) as Record<FunctionId, FunctionState>;
  const skillRanksByFunction = Object.fromEntries(FUNCTION_IDS.map((id) => [id, emptyBranches()])) as RunState['progression']['skillRanksByFunction'];
  return {
    header: { runId: asRunId(runId), seed: seed >>> 0, randomVersion: 'opu-rng.1', balanceVersion: context.balance.version, contentVersion: context.content.version, schemaVersion: 1 },
    clock: { tick: tick(0), quarterIndex: 1, tickInQuarter: tick(0), phase: 'SETUP', paused: true },
    quarter: { index: 1, startingArr, targetArr: startingArr, newCustomerArr: annualDollars(0), expansionArr: annualDollars(0), churnedArr: annualDollars(0), endingArr: startingArr, growthBps: basisPoints(0) },
    economy: { startingArr, newCustomerArrQTD: annualDollars(0), expansionArrQTD: annualDollars(0), churnedArrQTD: annualDollars(0), endingArr: startingArr, cash: context.balance.startingCash.value, burnPerQuarter: cents(0), collectionsQTD: cents(0), valuation: valuationDollars(Math.floor(startingArr * multiple / 10_000)), growthMultipleBps: multiple },
    cohorts: { demand: [], activated: [], customers: [] }, functions, automation: { agents: [] },
    pressure: { complexityContributions: [], complexity: pressureUnits(0), opsCapacity: context.balance.baseOpsCapacity.value, strainPpm: ppm(0), strainBand: 'CLEAN', rot: pressureUnits(0), rotBand: 'FRESH', incidents: [], retries: 0 },
    capital: { debt: [], debtStressPpm: ppm(0), offers: [], founderOwnershipBps: basisPoints(10_000), financingHistory: [], growthArrears: annualDollars(0), emergencyBridgeUsed: false },
    progression: { purchasedSkillRankIds: [], skillRanksByFunction, strategyQuartersRemaining: 0, ownedRelicIds: [], eligibilityTags: [] },
    outcome: { failureCandidates: [], causalLedger: [], milestones: [], unicornReached: false },
    founderAttention: 'MARKETING', seenActionIds: [], lastActionSequence: -1, eventSequence: 0,
  };
}
