import {
  endingArr,
  founderStakeValue,
  netNewArr,
  valuation,
} from "./economy.mjs";

const EPSILON = 1e-9;

function approxEqual(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}

export function assertQuarterAccounting(state) {
  const expectedEnding = endingArr(state);
  if (!approxEqual(expectedEnding, state.endingArr)) {
    throw new Error(`ENDING_ARR invariant failed: expected ${expectedEnding}, got ${state.endingArr}`);
  }

  const expectedNetNew = netNewArr(state);
  if (!approxEqual(expectedNetNew, state.netNewArr)) {
    throw new Error(`NET_NEW_ARR invariant failed: expected ${expectedNetNew}, got ${state.netNewArr}`);
  }

  const expectedValuation = valuation({
    endingArr: state.endingArr,
    lockedGrowthMultiple: state.lockedGrowthMultiple,
  });
  if (!approxEqual(expectedValuation, state.valuation)) {
    throw new Error(`VALUATION invariant failed: expected ${expectedValuation}, got ${state.valuation}`);
  }

  const expectedStake = founderStakeValue({
    valuation: state.valuation,
    founderOwnership: state.founderOwnership,
  });
  if (!approxEqual(expectedStake, state.founderStakeValue)) {
    throw new Error(`FOUNDER_STAKE_VALUE invariant failed: expected ${expectedStake}, got ${state.founderStakeValue}`);
  }

  return true;
}
