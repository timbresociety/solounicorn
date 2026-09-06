const fnv1a = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mix32 = (value: number) => {
  let mixed = value >>> 0;
  mixed ^= mixed >>> 16;
  mixed = Math.imul(mixed, 0x7feb352d);
  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 0x846ca68b);
  mixed ^= mixed >>> 16;
  return mixed >>> 0;
};

export type RandomEvidence = { stream: string; entityId: string; ordinal: number; uint32: number; normalizedPpm: number };

export function randomUint32(seed: number, randomVersion: string, stream: string, entityId: string, ordinal: number): number {
  return mix32(fnv1a(`${seed}|${randomVersion}|${stream}|${entityId}|${ordinal}`));
}

export function randomEvidence(seed: number, randomVersion: string, stream: string, entityId: string, ordinal: number): RandomEvidence {
  const uint32 = randomUint32(seed, randomVersion, stream, entityId, ordinal);
  return { stream, entityId, ordinal, uint32, normalizedPpm: Math.floor((uint32 / 0x1_0000_0000) * 1_000_000) };
}
