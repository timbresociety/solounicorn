import type { SemanticAction } from '../schema/actions';

export type ActionLog = {
  schemaVersion: 1;
  runId: string;
  balanceVersion: string;
  contentVersion: string;
  actions: SemanticAction[];
};

export function appendAction(log: ActionLog, action: SemanticAction): ActionLog {
  if (log.actions.some((entry) => entry.actionId === action.actionId)) return log;
  return { ...log, actions: [...log.actions, action] };
}

export function chunkActionLog(log: ActionLog, chunkSize = 128): SemanticAction[][] {
  const chunks: SemanticAction[][] = [];
  for (let index = 0; index < log.actions.length; index += chunkSize) chunks.push(log.actions.slice(index, index + chunkSize));
  return chunks;
}
