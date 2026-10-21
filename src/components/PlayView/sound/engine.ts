'use client';

/**
 * Tiny Web Audio synth for the group quiz — every sound is generated, so
 * there are no files to load or license. One shared context + master gain;
 * browsers keep it suspended until a tap, so unlock() runs on any pointer.
 */
const KEY = 'orayta_play_sound';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted: boolean | null = null;
const listeners = new Set<(m: boolean) => void>();

function savedMuted(): boolean | null {
  try { const v = localStorage.getItem(KEY); return v === null ? null : v === 'off'; } catch { return null; }
}

/** First call decides the default for this device (e.g. muted on a remote-control phone). */
export function initMuted(defaultMuted: boolean): void {
  if (muted !== null) return;
  muted = savedMuted() ?? defaultMuted;
}

export function isMuted(): boolean { return muted ?? savedMuted() ?? false; }

export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch { /* fine */ }
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.05);
  if (!m) unlock();
  listeners.forEach(l => l(m));
}

export function onMutedChange(l: (m: boolean) => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : 0.7;
    master.connect(ctx.destination);
  }
  return { ctx, out: master! };
}

export function unlock(): void {
  const a = audio();
  if (a && a.ctx.state === 'suspended') void a.ctx.resume().catch(() => undefined);
}

export const audioRunning = () => ctx?.state === 'running';

interface ToneOpts { type?: OscillatorType; gain?: number; attack?: number; glide?: number; filter?: number; }

/** One enveloped oscillator note at `at` seconds from now. */
export function tone(freq: number, at: number, dur: number, o: ToneOpts = {}): void {
  const a = audio();
  if (!a || isMuted() || a.ctx.state !== 'running') return;
  const t0 = a.ctx.currentTime + at;
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t0 + dur);
  const peak = o.gain ?? 0.25;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = osc;
  if (o.filter) {
    const f = a.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.filter;
    osc.connect(f);
    node = f;
  }
  node.connect(g).connect(a.out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Filtered noise burst — whooshes and the buzzer's grit. */
export function noise(at: number, dur: number, from: number, to: number, gain = 0.12): void {
  const a = audio();
  if (!a || isMuted() || a.ctx.state !== 'running') return;
  const t0 = a.ctx.currentTime + at;
  const buf = a.ctx.createBuffer(1, Math.ceil(a.ctx.sampleRate * dur), a.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const f = a.ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(a.out);
  src.start(t0);
}
