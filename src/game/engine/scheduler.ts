import type { Tick } from '../schema/units';

export type ScheduledEvent<TPayload = Record<string, unknown>> = { id: string; atTick: Tick; priority: number; type: string; payload: TPayload };

export function orderScheduledEvents<T extends ScheduledEvent>(events: T[]): T[] {
  return [...events].sort((a, b) => a.atTick - b.atTick || b.priority - a.priority || a.id.localeCompare(b.id));
}
