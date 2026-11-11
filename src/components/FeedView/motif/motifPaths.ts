import type { FeedItemType } from '@/types';

/**
 * Geometry for the feed's living backgrounds — pure and seeded, so every post
 * gets its own composition yet the same post always looks the same.
 * All drawings live in a 400×400 box (the scroll column in 400×800).
 */
export type MotifKind = 'daf' | 'rosette' | 'lattice' | 'embers' | 'orbit' | 'script';

/** Two motifs per type, picked by the post's seed, so the feed keeps changing. */
export const MOTIFS_BY_TYPE: Record<FeedItemType, [MotifKind, MotifKind]> = {
  citation: ['daf', 'script'],
  rabbi:    ['rosette', 'embers'],
  book:     ['lattice', 'daf'],
  chidush:  ['embers', 'rosette'],
  gematria: ['orbit', 'lattice'],
  sikum:    ['script', 'orbit'],
};

/** FNV-1a — a stable 32-bit seed from a post key. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic [0, 1) for (seed, k) — mulberry32 step. */
export function rnd(seed: number, k: number): number {
  let t = (seed + Math.imul(k + 1, 0x6d2b79f5)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Right-aligned "lines of text" between x1 and x2 (Hebrew runs right → left). */
function column(seed: number, salt: number, x1: number, x2: number, y1: number, y2: number, step: number): string {
  let d = '';
  let k = salt;
  for (let y = y1; y <= y2; y += step) {
    const end = rnd(seed, k++) < 0.13;
    const gap = rnd(seed, k++) < 0.05;
    if (gap) continue;
    const left = end ? round(x2 - (x2 - x1) * (0.25 + rnd(seed, k++) * 0.5)) : x1;
    d += `M${x2} ${y}H${left}`;
  }
  return d;
}

/** A Vilna daf: the Gemara column in the middle, Rashi and Tosafot around it. */
export function dafPath(seed: number): string {
  return 'M70 40H330V360H70Z'
    + 'M160 28H240'
    + 'M178 56H222V84H178Z'
    + column(seed, 10, 142, 258, 96, 344, 11)
    + column(seed, 200, 272, 328, 52, 344, 8)
    + column(seed, 400, 72, 128, 52, 344, 8);
}

/** One 400-tall block of a Sefer Torah: two columns with a seam between. */
export function scrollPath(seed: number): string {
  return column(seed, 600, 92, 192, 6, 394, 12)
    + column(seed, 800, 208, 308, 6, 394, 12)
    + 'M200 0V400';
}

/** A hexagram (two triangles) of radius r around (cx, cy). */
export function hexagram(cx: number, cy: number, r: number): string {
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${round(cx + r * Math.cos(a))} ${round(cy + r * Math.sin(a))}`;
  };
  return `M${pt(-90)}L${pt(30)}L${pt(150)}Z M${pt(90)}L${pt(210)}L${pt(330)}Z`;
}

/** Tick marks around a ring (the rosette's outer band). */
export function ticks(cx: number, cy: number, r1: number, r2: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    d += `M${round(cx + r1 * c)} ${round(cy + r1 * s)}L${round(cx + r2 * c)} ${round(cy + r2 * s)}`;
  }
  return d;
}

export interface Ember { x: number; top: number; size: number; dur: number; delay: number; sway: number }

/** Sparks rising from a candle — seeded positions, sizes and pace. */
export function embers(seed: number, n = 16): Ember[] {
  return Array.from({ length: n }, (_, i) => ({
    x: round(8 + rnd(seed, 1000 + i) * 84),
    top: round(55 + rnd(seed, 1100 + i) * 45),
    size: round(2 + rnd(seed, 1200 + i) * 3.5),
    dur: round(8 + rnd(seed, 1300 + i) * 9),
    delay: -round(rnd(seed, 1400 + i) * 16),
    sway: Math.round((rnd(seed, 1500 + i) - 0.5) * 80),
  }));
}
