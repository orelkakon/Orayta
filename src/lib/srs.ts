import type { SrsCard, SrsGrade, SrsState, SrsSummary } from '@/types/quizModes';

/**
 * Spaced repetition for citations — a Leitner schedule kept per device.
 * Pure functions take the state and `now` and return a new state; the
 * localStorage wrappers at the bottom are the only impure part.
 */

const KEY = 'orayta_srs';
const DAY = 86_400_000;
/** Days until the next review, indexed by box. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60];
export const MAX_BOX = INTERVAL_DAYS.length - 1;
/** Boxes from here on (two weeks and longer) count as mastered. */
export const MASTERED_BOX = 4;
export const NEW_PER_DAY = 10;
const MAX_CARDS = 2000;

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Midnight `days` calendar days after `now` (DST-safe). */
function dayAfter(now: number, days: number): number {
  const d = new Date(startOfDay(now));
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Box and wait (in days, 0 = again today) a grade would produce. */
export function nextStep(card: SrsCard | undefined, grade: SrsGrade): { box: number; days: number } {
  const box = card?.box ?? 0;
  if (grade === 'again') return { box: 0, days: 0 };
  if (grade === 'hard') {
    const b = Math.max(1, box);
    return { box: b, days: Math.max(1, Math.round(INTERVAL_DAYS[b] / 2)) };
  }
  const b = Math.min(MAX_BOX, box + 1);
  return { box: b, days: INTERVAL_DAYS[b] };
}

export function scheduleCard(card: SrsCard | undefined, grade: SrsGrade, now: number): SrsCard {
  const { box, days } = nextStep(card, grade);
  const lapsed = grade === 'again' && (card?.box ?? 0) > 0;
  return {
    box,
    due: days === 0 ? now : dayAfter(now, days),
    seen: (card?.seen ?? 0) + 1,
    lapses: (card?.lapses ?? 0) + (lapsed ? 1 : 0),
    last: now,
    added: card?.added ?? now,
  };
}

export function recordReview(state: SrsState, id: string, grade: SrsGrade, now: number): SrsState {
  const next: SrsState = { ...state, [id]: scheduleCard(state[id], grade, now) };
  const ids = Object.keys(next);
  if (ids.length <= MAX_CARDS) return next;
  // Over the cap: forget the cards reviewed longest ago.
  ids.sort((a, b) => next[a].last - next[b].last)
    .slice(0, ids.length - MAX_CARDS)
    .forEach(stale => { delete next[stale]; });
  return next;
}

/** Map a scored answer from the other citation modes onto a grade. */
export function gradeFromScore(score: number): SrsGrade {
  if (score >= 1) return 'good';
  return score > 0 ? 'hard' : 'again';
}

/** Ids due by `now`, most overdue first; limited to `within` when given. */
export function dueIds(state: SrsState, now: number, within?: string[]): string[] {
  const pool = within ?? Object.keys(state);
  return pool.filter(id => state[id] && state[id].due <= now)
    .sort((a, b) => state[a].due - state[b].due);
}

export function newToday(state: SrsState, now: number): number {
  const today = startOfDay(now);
  return Object.values(state).filter(c => c.added >= today).length;
}

/** Due cards first, then never-seen ones up to the daily new-card allowance. */
export function buildQueue(state: SrsState, allIds: string[], now: number, extraNew = 0): string[] {
  const due = dueIds(state, now, allIds);
  const allowance = Math.max(0, NEW_PER_DAY - newToday(state, now)) + extraNew;
  const fresh = allIds.filter(id => !state[id]).slice(0, allowance);
  return [...due, ...fresh];
}

export function summarize(state: SrsState, now: number, within?: string[]): SrsSummary {
  const cards = (within ?? Object.keys(state)).map(id => state[id]).filter(Boolean);
  const future = cards.filter(c => c.due > now).map(c => c.due);
  return {
    due: cards.filter(c => c.due <= now).length,
    learning: cards.filter(c => c.box < MASTERED_BOX).length,
    mastered: cards.filter(c => c.box >= MASTERED_BOX).length,
    newToday: newToday(state, now),
    nextDue: future.length ? Math.min(...future) : null,
  };
}

/** Whole calendar days from today until `due` (0 = today). */
export function daysUntil(due: number, now: number): number {
  return Math.max(0, Math.round((startOfDay(due) - startOfDay(now)) / DAY));
}

function isCard(v: unknown): v is SrsCard {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return ['box', 'due', 'seen', 'lapses', 'last', 'added'].every(k => typeof c[k] === 'number' && isFinite(c[k] as number))
    && (c.box as number) >= 0 && (c.box as number) <= MAX_BOX;
}

/** Drops malformed entries so a corrupt store degrades to "fewer cards". */
export function parseState(raw: unknown): SrsState {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: SrsState = {};
  for (const [id, card] of Object.entries(raw as Record<string, unknown>)) {
    if (isCard(card)) out[id] = card;
  }
  return out;
}

export function loadSrs(): SrsState {
  if (typeof window === 'undefined') return {};
  try {
    return parseState(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveSrs(state: SrsState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota / private mode */ }
}

export function clearSrs(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** One call from any citation mode after scoring an answer. */
export function recordQuizResult(citationId: string, score: number): void {
  saveSrs(recordReview(loadSrs(), citationId, gradeFromScore(score), Date.now()));
}
