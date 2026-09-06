import type { BasisPoints, Cents, PartsPerMillion, PressureUnits, Tick, WorkUnits } from './units';
import type { StrainBand } from './state';

export type CalibrationStatus = 'CANONICAL' | 'PROVISIONAL' | 'CALIBRATION' | 'UNRESOLVED';
export type CalibrationValue<T> = {
  value: T;
  unit: string;
  status: CalibrationStatus;
  dependencyId?: `B${string}`;
  rationale: string;
  minimum?: number;
  maximum?: number;
};

export type BalancePack = {
  schemaVersion: 1;
  version: string;
  status: CalibrationStatus;
  runtimeReady: boolean;
  systemOrderVersion: string;
  ticksPerSecond: CalibrationValue<number>;
  ticksPerQuarter: CalibrationValue<Tick>;
  startingArr: CalibrationValue<number>;
  startingCash: CalibrationValue<Cents>;
  baseOpsCapacity: CalibrationValue<PressureUnits>;
  founderWorkPerAction: CalibrationValue<WorkUnits>;
  demandExpiryTicks: CalibrationValue<Tick>;
  pricingOpportunityExpiryTicks: CalibrationValue<Tick>;
  growthMultipleBps: CalibrationValue<BasisPoints>;
  customerCollectionsPpmPerQuarter: CalibrationValue<PartsPerMillion>;
  skillBaseCostCents: CalibrationValue<Cents>;
  unicornValuationDollars: CalibrationValue<number>;
  bankruptcyFloorCents: CalibrationValue<Cents>;
  rotPerAgentTickPpm: CalibrationValue<PartsPerMillion>;
  strainBands: CalibrationValue<ReadonlyArray<{ maximumPpm: number; band: StrainBand; reliabilityPenaltyPpm: number; rotMultiplierPpm: number }>>;
  tuning: Record<string, CalibrationValue<number>>;
};
