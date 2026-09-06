import { createRun, DEFAULT_ENGINE_CONTEXT, type EngineContext } from '../engine/create-run';
import { hashState } from '../engine/hash';
import { step } from '../engine/step';
import type { RunState } from '../schema/state';
import type { ActionLog } from './action-log';

export type ReplayArtifact = {
  schemaVersion: 1;
  seed: number;
  runId: string;
  balanceVersion: string;
  contentVersion: string;
  finalTick: number;
  finalHash: string;
  actionLog: ActionLog;
};

export function replay(artifact: ReplayArtifact, context: EngineContext = DEFAULT_ENGINE_CONTEXT): RunState {
  if (artifact.balanceVersion !== context.balance.version || artifact.contentVersion !== context.content.version) throw new Error(`INCOMPATIBLE_REPLAY: requires ${artifact.balanceVersion}/${artifact.contentVersion}`);
  let state = createRun(artifact.seed, context, artifact.runId);
  const actions = [...artifact.actionLog.actions].sort((a, b) => a.atTick - b.atTick || a.sequence - b.sequence);
  let index = 0;
  while (state.clock.tick <= artifact.finalTick) {
    const atTick = actions.slice(index).filter((action) => action.atTick === state.clock.tick);
    if (atTick.length) index += atTick.length;
    const shouldAdvance = state.clock.tick < artifact.finalTick || atTick.length > 0;
    if (!shouldAdvance) break;
    const result = step(state, atTick, context);
    state = result.state;
    if (state.clock.paused && !atTick.length && index < actions.length && actions[index].atTick === state.clock.tick) continue;
    if (state.clock.paused && !atTick.length && index >= actions.length) break;
  }
  const hash = hashState(state);
  if (hash !== artifact.finalHash) throw new Error(`REPLAY_HASH_MISMATCH: expected ${artifact.finalHash}, received ${hash}`);
  return state;
}
