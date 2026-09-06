import type { GameRuntime } from './game-runtime';

export type ClockHandle = { stop: () => void; setVisible: (visible: boolean) => void };

export function startBrowserClock(runtime: GameRuntime, ticksPerSecond: number): ClockHandle {
  let running = true;
  let visible = true;
  let previous = performance.now();
  let accumulated = 0;
  let frame = 0;
  const frameDuration = 1000 / ticksPerSecond;
  const loop = (now: number) => {
    if (!running) return;
    if (visible) {
      accumulated += Math.min(250, Math.max(0, now - previous));
      const due = Math.min(8, Math.floor(accumulated / frameDuration));
      if (due > 0) { runtime.advanceTicks(due); accumulated -= due * frameDuration; }
    }
    previous = now;
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
  return { stop: () => { running = false; cancelAnimationFrame(frame); }, setVisible: (next) => { visible = next; previous = performance.now(); accumulated = 0; } };
}
