import { afterEach, expect, it, vi } from 'vitest';
import { playEventSound } from '../../src/presentation/audio';

afterEach(() => vi.unstubAllGlobals());
it('reuses a single suspended audio device instead of leaking contexts per action', () => {
  const resume = vi.fn().mockResolvedValue(undefined);
  const device = vi.fn(function () { return { state: 'suspended', resume }; });
  vi.stubGlobal('AudioContext', device);
  for (let i = 0; i < 100; i++) playEventSound({ label: 'Snap', detail: '', priority: 1, lead: 'SOUND', sound: 'snap' }, true);
  expect(device).toHaveBeenCalledTimes(1);
});
