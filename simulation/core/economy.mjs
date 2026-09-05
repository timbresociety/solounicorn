function finite(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  return value;
}

function nonNegative(name, value) {
  finite(name, value);
  if (value < 0) throw new RangeError(`${name} must be >= 0`);
  return value;
}

export function endingArr({
  startingArr,
  newCustomerArr,
  expansionArr,
  churnedArr,
}) {
  nonNegative("startingArr", startingArr);
  nonNegative("newCustomerArr", newCustomerArr);
  nonNegative("expansionArr", expansionArr);
  nonNegative("churnedArr", churnedArr);

  return startingArr + newCustomerArr + expansionArr - churnedArr;
}

export function netNewArr({ newCustomerArr, expansionArr, churnedArr }) {
  nonNegative("newCustomerArr", newCustomerArr);
  nonNegative("expansionArr", expansionArr);
  nonNegative("churnedArr", churnedArr);

  return newCustomerArr + expansionArr - churnedArr;
}

export function valuation({ endingArr: endingArrValue, lockedGrowthMultiple }) {
  finite("endingArr", endingArrValue);
  nonNegative("lockedGrowthMultiple", lockedGrowthMultiple);

  return endingArrValue * lockedGrowthMultiple;
}

export function founderStakeValue({ valuation: valuationValue, founderOwnership }) {
  finite("valuation", valuationValue);
  finite("founderOwnership", founderOwnership);

  if (founderOwnership < 0 || founderOwnership > 1) {
    throw new RangeError("founderOwnership must be between 0 and 1");
  }

  return valuationValue * founderOwnership;
}
