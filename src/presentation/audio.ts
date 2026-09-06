import type { PresentedEvent } from './event-orchestrator';

export function playEventSound(event: PresentedEvent, enabled: boolean): void {
  if (!enabled || !event.sound || typeof AudioContext === 'undefined') return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = { commit: 260, snap: 420, ship: 520, arr: 680, quarter: 180, skill: 760, reject: 120 } as const;
  oscillator.type = event.sound === 'reject' ? 'square' : 'sine';
  oscillator.frequency.setValueAtTime(frequencies[event.sound], context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequencies[event.sound] * (event.sound === 'quarter' ? 1.8 : 1.16)), context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
  oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.18);
  oscillator.addEventListener('ended', () => void context.close());
}
