import master from '../../../solounicorn-master-context/engine/candidate_profile.json';

// Candidate tuning, never locked balance. Master units are cents and 0.1s ticks.
export const P = {
  ...master,
  version: 'founder-candidate.5',
  // Owner 2026-09-09: raw Luck has slightly negative long-run expectation.
  luck_mean_per_rank: -0.01,
  // Playable content defaults: channel budgets, upgrade draft costs, win inheritance.
  marketPerMonth: [24000, 16000, 9600],
  acquisitionCents: [100, 300, 1000],
  monthlyPrices: [4000, 15000, 80000],
  monthlyService: [400, 1800, 12000],
  collectionDelay: [60, 120, 240],
  collectionChance: [.95, .98, .90],
  pricingBaseChance: .50,
  pricingFitChance: .48,
  pricingFriction: .18,
  pricingFrictionPower: 2,
  pricingQuarterPressure: .18,
  pricingTimingInside: 1,
  pricingTimingNearMiss: .78,
  pricingTimingMiss: .38,
  winCashBonus: 15000,
  upgradeDraftBase: 15000,
  // The original 600-enterprise market plateaued below $1B even with all ranks.
  // Larger finite pools allow scaled units to find enough real buyers.
  // Give first-pass Product assembly a full two minutes while the company
  // continues running. The brief remains finite, but the player has time to
  // read, drag, correct a mismatch and ship without racing the HUD clock.
  starterTTL: 1200,
  bankHits: 3, pricePeriodTicks: 24,
} as const;
export const FUNCTIONS = ['demand', 'product', 'monetisation', 'retention', 'expansion', 'operations'] as const;
export type Work = typeof FUNCTIONS[number];
export const AXES = ['craft', 'scale', 'automate', 'luck'] as const;
export type Axis = typeof AXES[number];
export const NAMES: Record<Work, string> = {demand:'Demand', product:'Product', monetisation:'Monetisation', retention:'Retention', expansion:'Expansion', operations:'Operations'};
export const SEGMENTS = ['Independent creators', 'Small teams', 'Enterprise operators'];
export const PARTS = ['Speed', 'Collaboration', 'Control'];
export const RECIPES = [[0,1,0], [1,0,2], [2,1,2]];
export const UPGRADES = [
  {id:'community', name:'Word of mouth', text:'Demand acquisition costs fall 35%. A distribution build that leaves more cash for capability.'},
  {id:'quality', name:'Do things properly', text:'Shipped product fit improves by 0.12. Better fit raises willingness to pay and customer health.'},
  {id:'care', name:'Customers talk back', text:'Retention care lasts two months. More time for expansion; no free ARR.'},
  {id:'lean', name:'Stay embarrassingly small', text:'Base overhead and unit upkeep fall 25%. Agent compute still costs money.'},
  {id:'maintenance', name:'Leave a paper trail', text:'Operations repair output increases 50%. A supervisor build for a larger swarm.'},
  {id:'terms', name:'Get paid sooner', text:'New invoice payment terms are 50% shorter. Revenue is unchanged; liquidity arrives earlier.'},
] as const;
