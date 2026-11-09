import type { TehillimCell } from '@/types/tehillim';

/**
 * Handing out units (pure, tested). Readers fill the lowest round that still
 * has a free unit; once every unit of every round is taken, the next round
 * opens — so a crowd reads several books in parallel and nobody waits. A hold
 * that expired is free again (its row is reused, guarded by its heldAt).
 */
export interface ClaimRow {
  id: string;
  round: number;
  unit: number;
  status: 'held' | 'done';
  heldAt: number;
  doneAt: number | null;
  readerHash: string;
  readerName: string | null;
}

export type Pick =
  | { kind: 'new'; round: number; unit: number }
  | { kind: 'reuse'; id: string; heldAt: number; round: number; unit: number };

export const isTaken = (c: ClaimRow, now: number, holdMs: number) => c.status === 'done' || now - c.heldAt < holdMs;

function byRound(claims: ClaimRow[]): Map<number, Map<number, ClaimRow>> {
  const rounds = new Map<number, Map<number, ClaimRow>>();
  for (const c of claims) {
    const r = rounds.get(c.round) ?? new Map<number, ClaimRow>();
    r.set(c.unit, c);
    rounds.set(c.round, r);
  }
  return rounds;
}

const maxRound = (claims: ClaimRow[]) => claims.reduce((m, c) => Math.max(m, c.round), 0);

/** Rounds whose every unit was read. */
export function completedRounds(claims: ClaimRow[], units: number): number {
  let n = 0;
  byRound(claims).forEach(r => {
    let done = 0;
    r.forEach(c => { if (c.status === 'done') done += 1; });
    if (done === units) n += 1;
  });
  return n;
}

/** The round shown on the map: the lowest one not yet read in full. */
export function openRound(claims: ClaimRow[], units: number): number {
  const rounds = byRound(claims);
  for (let r = 1; r <= maxRound(claims) + 1; r++) {
    const row = rounds.get(r);
    let done = 0;
    row?.forEach(c => { if (c.status === 'done') done += 1; });
    if (done < units) return r;
  }
  return maxRound(claims) + 1;
}

export function cellsOf(claims: ClaimRow[], units: number, round: number, now: number, holdMs: number): TehillimCell[] {
  const row = byRound(claims).get(round);
  return Array.from({ length: units }, (_, u) => {
    const c = row?.get(u);
    if (!c) return 'free';
    if (c.status === 'done') return 'done';
    return isTaken(c, now, holdMs) ? 'held' : 'free';
  });
}

/**
 * A free unit for a new reader: `want` (a unit picked on the map) in the
 * lowest round where it is free, else a random free unit of the lowest round
 * that has one, else unit `want ?? random` of a new round.
 */
export function pickUnit(claims: ClaimRow[], units: number, now: number, holdMs: number, want: number | null, rng: () => number = Math.random): Pick {
  const rounds = byRound(claims);
  const top = maxRound(claims);
  const asPick = (round: number, unit: number): Pick => {
    const c = rounds.get(round)?.get(unit);
    return c ? { kind: 'reuse', id: c.id, heldAt: c.heldAt, round, unit } : { kind: 'new', round, unit };
  };
  for (let r = 1; r <= top; r++) {
    const row = rounds.get(r);
    const free: number[] = [];
    for (let u = 0; u < units; u++) {
      const c = row?.get(u);
      if (!c || !isTaken(c, now, holdMs)) free.push(u);
    }
    if (want !== null) {
      if (free.includes(want)) return asPick(r, want);
      continue;
    }
    if (free.length) return asPick(r, free[Math.floor(rng() * free.length)]);
  }
  return { kind: 'new', round: top + 1, unit: want ?? Math.floor(rng() * units) };
}
