// Deterministic seeded shuffling: the feed deals items from a per-session
// shuffled "deck" so nothing repeats until the full pool is exhausted.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Combine session seed + cycle number + type salt into one deck seed
function deckSeed(seed: number, cycle: number, salt: string): number {
  let h = (seed ^ Math.imul(cycle + 1, 0x9e3779b1)) >>> 0;
  for (let i = 0; i < salt.length; i++) {
    h = Math.imul(h ^ salt.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Deal one page of ids from the seeded deck. Every id appears exactly once
 * per cycle; when the deck runs out, a new cycle starts with a fresh
 * permutation. Stateless: (seed, page) always yields the same ids, so the
 * client only needs to send its session seed and page counter.
 */
export function deckPage(ids: string[], seed: number, salt: string, page: number, take: number): string[] {
  const n = ids.length;
  if (n === 0 || take <= 0) return [];
  const capped = Math.min(take, n); // never duplicate an id within one page
  const out: string[] = [];
  let pos = page * capped;
  while (out.length < capped) {
    const cycle = Math.floor(pos / n);
    const perm = seededShuffle(ids, deckSeed(seed, cycle, salt));
    const start = pos % n;
    const count = Math.min(capped - out.length, n - start);
    out.push(...perm.slice(start, start + count));
    pos += count;
  }
  return out;
}
