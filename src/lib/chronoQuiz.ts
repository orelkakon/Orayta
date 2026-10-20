import type { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_ORDER } from '@/lib/rabbisData';

/**
 * "סדר כרונולוגי" — pick a handful of rabbis to put in order. Years in the
 * directory are approximate, so every pair in a set is at least `minGap`
 * years apart: wide gaps across the whole timeline for an easy round, tight
 * gaps inside one or two neighbouring eras for a hard one.
 */

export type ChronoRabbi = Pick<Rabbi, 'id' | 'name' | 'sortYear' | 'category' | 'datePeriod'>;
export type ChronoLevel = 'easy' | 'hard';
type Rng = () => number;

const GAP: Record<ChronoLevel, number> = { easy: 120, hard: 15 };

function shuffled<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const catIndex = (r: ChronoRabbi) => CATEGORY_ORDER.indexOf(r.category as RabbiCategory);

/** Greedy pick from a shuffled pool, keeping every pair `gap` years apart. */
function spaced<R extends ChronoRabbi>(pool: R[], size: number, gap: number, rng: Rng): R[] | null {
  const out: R[] = [];
  for (const r of shuffled(pool, rng)) {
    if (out.every(o => Math.abs(o.sortYear - r.sortYear) >= gap)) out.push(r);
    if (out.length === size) return out;
  }
  return null;
}

/** True when `order` is already earliest → latest. */
export function isSorted(order: ChronoRabbi[]): boolean {
  return order.every((r, i) => i === 0 || order[i - 1].sortYear <= r.sortYear);
}

/** A set in a scrambled (never already-correct) order, or null if the pool is too small. */
export function pickChronoSet<R extends ChronoRabbi>(rabbis: R[], size: number, level: ChronoLevel, rng: Rng = Math.random): R[] | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    let pool = rabbis;
    if (level === 'hard') {
      const anchor = catIndex(rabbis[Math.floor(rng() * rabbis.length)]);
      pool = rabbis.filter(r => Math.abs(catIndex(r) - anchor) <= 1);
    }
    const set = spaced(pool, size, GAP[level], rng);
    if (!set) continue;
    let order = shuffled(set, rng);
    for (let i = 0; i < 5 && isSorted(order); i++) order = shuffled(set, rng);
    if (isSorted(order)) order = [...order].reverse();
    return order;
  }
  return level === 'hard' ? pickChronoSet(rabbis, size, 'easy', rng) : null;
}

/** Per-slot correctness against the true chronology, and the fraction right. */
export function scoreOrder(order: ChronoRabbi[]): { correct: boolean[]; score: number } {
  const truth = [...order].sort((a, b) => a.sortYear - b.sortYear);
  const correct = order.map((r, i) => r.id === truth[i].id);
  return { correct, score: correct.filter(Boolean).length / order.length };
}

export function chronoSorted<R extends ChronoRabbi>(order: R[]): R[] {
  return [...order].sort((a, b) => a.sortYear - b.sortYear);
}

/** Move one item to a new index (pure). */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const a = [...arr];
  const [item] = a.splice(from, 1);
  a.splice(Math.max(0, Math.min(a.length, to)), 0, item);
  return a;
}
