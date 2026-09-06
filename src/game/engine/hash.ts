import type { RunState } from '../schema/state';

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(',')}}`;
}

export function canonicalStateString(state: RunState): string {
  const authoritativeHeader = { ...state.header };
  const outcome = { ...state.outcome };
  delete authoritativeHeader.startedAtMetadata;
  delete outcome.finalStateHash;
  return canonicalize({ ...state, header: authoritativeHeader, outcome });
}

export function hashState(state: RunState): string {
  const text = canonicalStateString(state);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
