import type { RunState } from '../schema/state';
import { V2_GOLDEN_BALANCE } from '../balance/v2-golden';

export const selectEconomy = (state: RunState) => ({
  arr: state.economy.endingArr,
  cashCents: state.economy.cash,
  valuation: state.economy.valuation,
  ownershipBps: state.capital.founderOwnershipBps,
  quarter: state.clock.quarterIndex,
  quarterProgress: state.clock.tickInQuarter,
  quarterDuration: V2_GOLDEN_BALANCE.ticksPerQuarter.value,
  growthBps: state.quarter.growthBps,
  mandateBps: state.header.growthMandateBps ?? 0,
});

export const formatDollars = (value: number) => value >= 1_000_000_000 ? `$${(value / 1_000_000_000).toFixed(2)}B` : value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(2)}M` : value >= 1_000 ? `$${Math.round(value / 1_000)}K` : `$${value}`;
export const formatCash = (cents: number) => formatDollars(Math.floor(cents / 100));
