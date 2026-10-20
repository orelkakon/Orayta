/**
 * Per-player answer layout, so peeking at a neighbour's phone doesn't help:
 * each player sees the four answers in their own order and with their own
 * colour + shape, stable for a given question (pure — tested).
 *
 * order[slot] = the original option shown in that slot;
 * look[option] = the colour/shape index that option wears on this phone.
 */
export interface PlayerLayout { order: number[]; look: number[]; }

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function permutation(n: number, seed: number): number[] {
  let s = seed || 1;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function playerLayout(playerId: string, qIndex: number, n = 4): PlayerLayout {
  return {
    order: permutation(n, hash(`order|${playerId}|${qIndex}`)),
    look: permutation(n, hash(`look|${playerId}|${qIndex}`)),
  };
}
