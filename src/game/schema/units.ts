import type { Brand } from './ids';

export type Tick = Brand<number, 'Tick'>;
export type Cents = Brand<number, 'Cents'>;
export type AnnualDollars = Brand<number, 'AnnualDollars'>;
export type ValuationDollars = Brand<number, 'ValuationDollars'>;
export type BasisPoints = Brand<number, 'BasisPoints'>;
export type PartsPerMillion = Brand<number, 'PartsPerMillion'>;
export type WorkUnits = Brand<number, 'WorkUnits'>;
export type PressureUnits = Brand<number, 'PressureUnits'>;

const integer = <T extends number>(value: number, name: string) => {
  if (!Number.isFinite(value) || !Number.isInteger(value)) throw new Error(`${name} must be a finite integer`);
  return value as T;
};

export const tick = (value: number) => integer<Tick>(value, 'Tick');
export const cents = (value: number) => integer<Cents>(value, 'Cents');
export const annualDollars = (value: number) => integer<AnnualDollars>(value, 'AnnualDollars');
export const valuationDollars = (value: number) => integer<ValuationDollars>(value, 'ValuationDollars');
export const basisPoints = (value: number) => integer<BasisPoints>(value, 'BasisPoints');
export const ppm = (value: number) => integer<PartsPerMillion>(value, 'PartsPerMillion');
export const workUnits = (value: number) => integer<WorkUnits>(value, 'WorkUnits');
export const pressureUnits = (value: number) => integer<PressureUnits>(value, 'PressureUnits');

export const clampInteger = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, Math.trunc(value)));

export const multiplyByBps = (value: number, rate: BasisPoints) => Math.floor((value * rate) / 10_000);
export const multiplyByPpm = (value: number, rate: PartsPerMillion) => Math.floor((value * rate) / 1_000_000);
