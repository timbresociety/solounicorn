import type { FunctionId } from '../schema/actions';
import type { RunState } from '../schema/state';

export type RoomSummary = { id: FunctionId; name: string; code: string; unlocked: boolean; queue: number; accent: string };
const roomMeta: Record<FunctionId, Omit<RoomSummary, 'id' | 'unlocked' | 'queue'>> = {
  MARKETING: { name: 'Marketing', code: 'MKT', accent: '#ff5c9a' }, PRODUCT: { name: 'Product', code: 'PRD', accent: '#58d9ff' },
  MONETIZATION: { name: 'Monetization', code: 'REV', accent: '#ffc857' }, RETENTION: { name: 'Retention', code: 'RET', accent: '#6f8cff' },
  EXPANSION: { name: 'Expansion', code: 'EXP', accent: '#a778ff' }, OPERATIONS: { name: 'Operations', code: 'OPS', accent: '#b5f35a' },
  FINANCE: { name: 'Finance', code: 'FIN', accent: '#77b9ff' },
};
export const selectGoldenRooms = (state: RunState): RoomSummary[] => (['MARKETING', 'PRODUCT', 'MONETIZATION', 'RETENTION', 'EXPANSION', 'OPERATIONS', 'FINANCE'] as FunctionId[]).map((id) => ({ id, ...roomMeta[id], unlocked: state.functions[id].unlocked, queue: state.functions[id].queue.filter((item) => item.metadata.resolved !== true).length }));
