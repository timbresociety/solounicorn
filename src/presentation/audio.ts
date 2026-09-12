import type { PresentedEvent } from './event-orchestrator';

// One audio device for the session. Suspended autoplay contexts may never emit
// `ended`, so creating a new device for each action leaks resources on browsers.
let audioContext: AudioContext | undefined;
let lastStartedAt = -Infinity;

export function playEventSound(event: PresentedEvent, enabled: boolean): void {
  if (!enabled || !event.sound || typeof AudioContext === 'undefined') return;
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext();
      lastStartedAt = -Infinity;
    }
    const context = audioContext;
    if (context.state === 'suspended') { void context.resume().catch(() => undefined); return; }
    if (context.currentTime - lastStartedAt < 0.06) return;
    lastStartedAt = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = { commit: 260, snap: 420, ship: 520, arr: 680, quarter: 180, skill: 760, reject: 120 } as const;
    oscillator.type = event.sound === 'reject' ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[event.sound], context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequencies[event.sound] * (event.sound === 'quarter' ? 1.8 : 1.16)), context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.addEventListener('ended', () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
    oscillator.start(); oscillator.stop(context.currentTime + 0.18);
  } catch {
    // Audio is optional presentation. Device failure cannot interrupt gameplay.
  }
}
