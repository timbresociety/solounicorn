export const FOUNDER_CONTRACT_VERSION = 'founder-state.1';
export const FOUNDER_CONTENT_VERSION = 'founder-content.candidate.12';
export const FOUNDER_SAVE_VERSION = 2;

export type EnginePhase =
  | 'setup'
  | 'active'
  | 'settlement'
  | 'quarter-draft'
  | 'paused'
  | 'failure'
  | 'unicorn'
  | 'continuation';

export type CommandType =
  | 'start' | 'pause' | 'continue' | 'focus' | 'cancel-job'
  | 'channel' | 'demand' | 'part' | 'test-build' | 'ship' | 'price'
  | 'squash-problem' | 'hit-bank' | 'save' | 'supply' | 'merge' | 'recover-package' | 'expand'
  | 'ops-deal' | 'ops-inspect' | 'ops-claim' | 'ops-discard'
  | 'reveal' | 'repair' | 'buy' | 'automation' | 'risk'
  | 'draft-skip' | 'draft' | 'consume' | 'borrow' | 'raise' | 'repay-debt';

const ACTIVE_COMMANDS: readonly CommandType[] = [
  'pause', 'focus', 'cancel-job', 'channel', 'demand', 'part', 'test-build',
  'ship', 'price', 'squash-problem', 'hit-bank', 'save', 'supply', 'merge', 'recover-package', 'expand',
  'ops-deal', 'ops-inspect', 'ops-claim', 'ops-discard', 'reveal', 'repair',
  'buy', 'automation', 'risk', 'consume', 'borrow', 'raise', 'repay-debt',
];

export const PHASE_PERMISSIONS: Readonly<Record<EnginePhase, readonly CommandType[]>> = {
  setup: ['start'],
  active: ACTIVE_COMMANDS,
  settlement: [],
  'quarter-draft': ['draft', 'draft-skip'],
  paused: ['continue'],
  failure: [],
  unicorn: ['continue'],
  continuation: ACTIVE_COMMANDS,
};

export const phaseAllows = (phase: EnginePhase, command: CommandType) =>
  PHASE_PERMISSIONS[phase].includes(command);

export const phaseAdvancesTime = (phase: EnginePhase) =>
  phase === 'active' || phase === 'continuation';

export const CASH_DEATH_POLICY = {
  decisionId: 'O02',
  status: 'owner-approved',
  behavior: 'Fail only when a mandatory due payment cannot be paid. Exactly zero cash can survive until the next obligation.',
} as const;

export type ActionReason =
  | 'committed'
  | 'duplicate-action'
  | 'phase-not-allowed'
  | 'stale-job'
  | 'expired-job'
  | 'cancelled-job'
  | 'job-reserved'
  | 'unaffordable'
  | 'invalid-command';
