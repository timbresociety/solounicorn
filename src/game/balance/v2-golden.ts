import type { BalancePack, CalibrationValue } from '../schema/balance';
import { annualDollars, basisPoints, cents, ppm, pressureUnits, tick, workUnits } from '../schema/units';

const calibration = <T>(value: T, unit: string, dependencyId: `B${string}`, rationale: string, minimum?: number, maximum?: number): CalibrationValue<T> => ({
  value, unit, status: 'CALIBRATION', dependencyId, rationale, minimum, maximum,
});
const canonical = <T>(value: T, unit: string, rationale: string): CalibrationValue<T> => ({ value, unit, status: 'CANONICAL', rationale });

export const V2_GOLDEN_BALANCE: BalancePack = {
  schemaVersion: 1,
  version: 'v2-golden.4',
  status: 'CALIBRATION',
  runtimeReady: false,
  systemOrderVersion: 'v2-order.1',
  ticksPerSecond: calibration(10, 'ticks/second', 'B19', 'Fast enough for timing precision; subject to pacing tests.', 5, 30),
  ticksPerQuarter: calibration(tick(900), 'ticks/quarter', 'B19', 'Golden slice uses a 90-second Q1 while full pacing remains provisional.', 600, 3_000),
  startingArr: calibration(annualDollars(100_000), 'annual dollars', 'B02', 'Representative early company, not final economy tuning.', 0),
  startingCash: calibration(cents(4_800_000), 'cents', 'B07', 'Supports one slice investment while preserving visible tradeoffs.', 0),
  baseOpsCapacity: calibration(pressureUnits(10_000), 'milli-capacity', 'B09', 'Provisional baseline for pressure derivation.', 1),
  founderWorkPerAction: calibration(workUnits(1_000), 'milli-work', 'B01', 'One deliberate action completes one golden work step.', 1),
  demandExpiryTicks: calibration(tick(260), 'ticks', 'B04', 'Keeps cohort expiry visible but non-punitive during onboarding.', 1),
  pricingOpportunityExpiryTicks: calibration(tick(180), 'ticks', 'B04', 'Provides a readable deterministic timing window.', 1),
  growthMultipleBps: calibration(basisPoints(80_000), 'basis points', 'B16', '8x V1 calibration retained for structural verification.', 1),
  customerCollectionsPpmPerQuarter: calibration(ppm(250_000), 'ppm annual contract', 'B03', 'Quarterly collection approximation pending economy lock.', 0, 1_000_000),
  skillBaseCostCents: calibration(cents(350_000), 'cents', 'B07', 'Golden slice rank affordability only.', 0),
  unicornValuationDollars: canonical(1_000_000_000, 'valuation dollars', 'Canonical unicorn checkpoint.'),
  bankruptcyFloorCents: calibration(cents(-500_000), 'cents', 'B15', 'Failure grace band pending debt and cash simulations.'),
  rotPerAgentTickPpm: calibration(ppm(600), 'ppm pressure/tick', 'B11', 'Long-run agent rot placeholder.', 0, 1_000_000),
  strainBands: calibration([
    { maximumPpm: 750_000, band: 'CLEAN', reliabilityPenaltyPpm: 0, rotMultiplierPpm: 1_000_000 },
    { maximumPpm: 1_000_000, band: 'BUSY', reliabilityPenaltyPpm: 0, rotMultiplierPpm: 1_200_000 },
    { maximumPpm: 1_250_000, band: 'STRAINED', reliabilityPenaltyPpm: 50_000, rotMultiplierPpm: 1_500_000 },
    { maximumPpm: 1_500_000, band: 'OVERLOADED', reliabilityPenaltyPpm: 120_000, rotMultiplierPpm: 2_500_000 },
    { maximumPpm: Number.MAX_SAFE_INTEGER, band: 'RUNAWAY', reliabilityPenaltyPpm: 200_000, rotMultiplierPpm: 4_000_000 },
  ], 'strain table', 'B10', 'Canonical categories with provisional thresholds and penalties.'),
  tuning: {
    pricingCycleTicks: calibration(100, 'ticks', 'B03', 'Timing meter cycle.'),
    pricingPerfectMultiplierPpm: calibration(1_150_000, 'ppm', 'B03', 'Perfect pricing ARR factor.'),
    pricingGoodMultiplierPpm: calibration(1_000_000, 'ppm', 'B03', 'Good pricing ARR factor.'),
    pricingPoorMultiplierPpm: calibration(650_000, 'ppm', 'B03', 'Poor pricing ARR factor.'),
    productWrongPieceDelayTicks: calibration(12, 'ticks', 'B03', 'Wrong placement rework delay.'),
    retentionThreatAgeTicks: calibration(120, 'ticks', 'B05', 'Golden customer threat generation age.'),
    retentionSaveWork: calibration(2_000, 'milli-work', 'B05', 'Founder intervention required to save a threat.'),
    expansionCapPpm: calibration(80_000, 'ppm current ARR/quarter', 'B06', 'Old 8 percent reference, explicitly calibration only.'),
    complexityPerRouting: calibration(500, 'milli-complexity', 'B08', 'Cross-function routing contribution.'),
    rotCorruptedThreshold: calibration(100_000, 'milli-rot', 'B11', 'Corruption state threshold.'),
    operationsRecoveryAmount: calibration(15_000, 'milli-rot', 'B11', 'Explicit recovery action.'),
    financeOfferGrowthThresholdBps: calibration(1000, 'basis points', 'B13', 'Investor offer eligibility.'),
    emergencyBridgeDebtCentsPerArrDollar: calibration(120, 'cents', 'B15', 'Emergency bridge principal per ARR dollar shortfall.'),
    debtSpiralStressPpm: calibration(900_000, 'ppm', 'B15', 'Failure candidate threshold.'),
    churnSpiralArrPpm: calibration(300_000, 'ppm starting ARR', 'B05', 'Failure candidate threshold.'),
  },
};
