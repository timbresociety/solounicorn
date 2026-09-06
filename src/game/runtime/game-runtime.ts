import { createRun, DEFAULT_ENGINE_CONTEXT, type EngineContext } from '../engine/create-run';
import { hashState } from '../engine/hash';
import { step } from '../engine/step';
import type { ActionPayloadMap, ActionType, SemanticAction } from '../schema/actions';
import { asActionId } from '../schema/ids';
import type { DomainEvent } from '../schema/events';
import type { RunState } from '../schema/state';
import { tick } from '../schema/units';
import type { ActionLog } from './action-log';
import { appendAction } from './action-log';
import type { ReplayArtifact } from './replay';

export type RuntimeSnapshot = { state: RunState; events: DomainEvent[]; checksum: string; actionLog: ActionLog };
type Listener = (snapshot: RuntimeSnapshot) => void;

export class GameRuntime {
  private listeners = new Set<Listener>();
  private actionCounter = 0;
  private snapshotValue: RuntimeSnapshot;

  constructor(seed: number, private readonly context: EngineContext = DEFAULT_ENGINE_CONTEXT, restored?: RuntimeSnapshot) {
    const state = restored?.state ?? createRun(seed, context);
    this.actionCounter = Math.max(0, state.lastActionSequence + 1);
    this.snapshotValue = restored ?? { state, events: [], checksum: hashState(state), actionLog: { schemaVersion: 1, runId: state.header.runId, balanceVersion: state.header.balanceVersion, contentVersion: state.header.contentVersion, actions: [] } };
  }

  get snapshot(): RuntimeSnapshot { return this.snapshotValue; }

  subscribe(listener: Listener): () => void { this.listeners.add(listener); listener(this.snapshotValue); return () => this.listeners.delete(listener); }

  dispatch<T extends ActionType>(type: T, payload: ActionPayloadMap[T]): RuntimeSnapshot {
    const sequence = this.actionCounter;
    const action = { actionVersion: 1, actionId: asActionId(`${this.snapshotValue.state.header.runId}-action-${sequence}`), sequence, atTick: tick(this.snapshotValue.state.clock.tick), type, payload } as SemanticAction<T>;
    this.actionCounter += 1;
    const result = step(this.snapshotValue.state, [action], this.context);
    this.snapshotValue = { state: result.state, events: result.events, checksum: result.checksum, actionLog: appendAction(this.snapshotValue.actionLog, action as SemanticAction) };
    this.notify();
    return this.snapshotValue;
  }

  advanceTicks(count = 1): RuntimeSnapshot {
    let latestEvents: DomainEvent[] = [];
    for (let index = 0; index < count; index += 1) {
      if (this.snapshotValue.state.clock.paused) break;
      const result = step(this.snapshotValue.state, [], this.context);
      this.snapshotValue = { ...this.snapshotValue, state: result.state, checksum: result.checksum };
      if (result.events.length) latestEvents = [...latestEvents, ...result.events];
    }
    if (latestEvents.length) this.snapshotValue = { ...this.snapshotValue, events: latestEvents };
    this.notify();
    return this.snapshotValue;
  }

  toReplayArtifact(): ReplayArtifact {
    return { schemaVersion: 1, seed: this.snapshotValue.state.header.seed, runId: this.snapshotValue.state.header.runId, balanceVersion: this.context.balance.version, contentVersion: this.context.content.version, finalTick: this.snapshotValue.state.clock.tick, finalHash: hashState(this.snapshotValue.state), actionLog: this.snapshotValue.actionLog };
  }

  private notify(): void { this.listeners.forEach((listener) => listener(this.snapshotValue)); }
}
