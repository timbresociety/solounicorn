import { describe, expect, it } from 'vitest';
import { asContentId } from '../../src/game/schema/ids';
import { GameRuntime } from '../../src/game/runtime/game-runtime';
import { assertCompatibleSave, createSaveEnvelope, MemoryPersistence } from '../../src/game/runtime/persistence';

describe('persistence contract', () => {
  it('restores an exact snapshot and fails incompatible versions explicitly', async () => {
    const runtime = new GameRuntime(33);
    runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
    const storage = new MemoryPersistence();
    await storage.save('slot', createSaveEnvelope(runtime.snapshot));
    const restored = await storage.load('slot');
    expect(restored?.snapshot).toEqual(runtime.snapshot);
    expect(() => assertCompatibleSave(restored!, 'wrong', restored!.contentVersion)).toThrow(/INCOMPATIBLE_SAVE_CONTENT/);
  });
});
