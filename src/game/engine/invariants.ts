import type { RunState } from '../schema/state';

export function assertRunInvariants(state: RunState): void {
  const numbers: number[] = [state.clock.tick, state.clock.tickInQuarter, state.economy.startingArr, state.economy.newCustomerArrQTD,
    state.economy.expansionArrQTD, state.economy.churnedArrQTD, state.economy.endingArr, state.economy.cash,
    state.economy.valuation, state.capital.founderOwnershipBps, state.pressure.complexity, state.pressure.opsCapacity,
    state.pressure.strainPpm, state.pressure.rot];
  if (numbers.some((value) => !Number.isFinite(value) || !Number.isInteger(value))) throw new Error('Run contains a non-finite or fractional authoritative value');
  if (state.economy.endingArr !== state.economy.startingArr + state.economy.newCustomerArrQTD + state.economy.expansionArrQTD - state.economy.churnedArrQTD) throw new Error('ARR bridge does not reconcile');
  if (state.capital.founderOwnershipBps < 0 || state.capital.founderOwnershipBps > 10_000) throw new Error('Founder ownership outside 0-100%');
  if (state.pressure.strainPpm < 0) throw new Error('Negative strain');
  if (state.cohorts.demand.some((cohort) => cohort.growthUnits < 0) || state.cohorts.customers.some((customer) => customer.currentArr < 0)) throw new Error('Negative cohort value');
}
