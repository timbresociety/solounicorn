import assert from "node:assert/strict";
import { createSeededRng } from "../simulation/core/prng.mjs";
import { endingArr } from "../simulation/core/economy.mjs";

function toyHarness(seed) {
  // Determinism harness only; these ranges are not V2 balance.
  const rng = createSeededRng(seed);
  let arr = 100_000;
  const log = [];

  for (let step = 0; step < 250; step += 1) {
    const newCustomerArr = rng.int(10_001);
    const expansionArr = rng.int(4_001);
    const churnedArr = rng.int(3_001);

    arr = endingArr({ startingArr: arr, newCustomerArr, expansionArr, churnedArr });
    log.push([newCustomerArr, expansionArr, churnedArr, arr]);
  }

  return { arr, log };
}

const first = toyHarness("opu-determinism-smoke");
const second = toyHarness("opu-determinism-smoke");
const different = toyHarness("opu-determinism-smoke-2");

assert.deepEqual(first, second);
assert.notDeepEqual(first, different);

console.log("simulation determinism passed");
