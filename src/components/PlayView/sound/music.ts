'use client';

import { audio, tone } from './engine';

/**
 * Soft question-time loop in the Ahava Rabba (freygish) mode on E — the
 * familiar sound of Jewish melody — quiet enough to talk over. A tension
 * flag speeds it up for the last seconds. Look-ahead scheduling keeps the
 * beat steady even when the main thread is busy.
 */
const ARP = [
  [329.6, 415.3, 493.9, 659.3, 587.3, 493.9, 415.3, 349.2], // E · G# · B (tonic)
  [293.7, 349.2, 440.0, 587.3, 523.3, 440.0, 349.2, 329.6], // D · F · A (iv) → back to E
];
const BASS = [82.4, 73.4];
const LOOKAHEAD_S = 0.15;

let timer: ReturnType<typeof setInterval> | null = null;
let next = 0;
let step = 0;
let tense = false;

function stepSeconds(): number {
  return 60 / (tense ? 150 : 104) / 2; // eighth notes
}

function schedule(): void {
  const a = audio();
  if (!a || a.ctx.state !== 'running') return;
  const now = a.ctx.currentTime;
  if (next < now) next = now + 0.05;
  while (next < now + LOOKAHEAD_S) {
    const bar = Math.floor(step / 8) % 2;
    const i = step % 8;
    const at = next - now;
    const len = stepSeconds();
    tone(ARP[bar][i], at, len * 0.9, { type: 'triangle', gain: tense ? 0.06 : 0.045 });
    if (i % 4 === 0) tone(BASS[bar], at, len * 3.5, { gain: 0.1, filter: 400 });
    if (tense && i % 2 === 0) tone(2400, at, 0.03, { type: 'square', gain: 0.015, filter: 5000 });
    next += len;
    step++;
  }
}

export function startMusic(): void {
  if (timer) return;
  step = 0;
  next = 0;
  tense = false;
  timer = setInterval(schedule, 40);
  schedule();
}

export function setTension(on: boolean): void { tense = on; }

export function stopMusic(): void {
  if (timer) clearInterval(timer);
  timer = null;
  tense = false;
}
