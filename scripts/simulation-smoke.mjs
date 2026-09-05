import assert from "node:assert/strict";
import {
  endingArr,
  founderStakeValue,
  netNewArr,
  valuation,
} from "../simulation/core/economy.mjs";
import { assertQuarterAccounting } from "../simulation/core/invariants.mjs";

const quarter = {
  startingArr: 100_000,
  newCustomerArr: 30_000,
  expansionArr: 10_000,
  churnedArr: 5_000,
};

assert.equal(endingArr(quarter), 135_000);
assert.equal(netNewArr(quarter), 35_000);
assert.equal(valuation({ endingArr: 135_000, lockedGrowthMultiple: 10 }), 1_350_000);
assert.equal(founderStakeValue({ valuation: 1_350_000, founderOwnership: 0.8 }), 1_080_000);

assertQuarterAccounting({
  ...quarter,
  endingArr: 135_000,
  netNewArr: 35_000,
  lockedGrowthMultiple: 10,
  valuation: 1_350_000,
  founderOwnership: 0.8,
  founderStakeValue: 1_080_000,
});

console.log("simulation smoke passed");
