import type { PlaySettings, PlayStatus, PlayHostAction, PlayLevel } from '@/types/play';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { CATEGORY_ORDER } from '@/lib/rabbisData';
import { ALL_KINDS, LEVELS } from './kinds';

/**
 * Pure rules of the group quiz — limits, validation, scoring, ranking and the
 * phase machine. Shared by the API (authoritative) and the screens; no I/O,
 * so it is unit-tested (tests/play.test.ts).
 */
export const CODE_LENGTH = 6;
export const MAX_PLAYERS = 100;
export const NAME_MAX = 16;
/** Network slack after the timer hits zero — a tap at 0.0s still counts. */
export const GRACE_MS = 1500;
/** A game is playable for 12 hours, then it is gone. */
export const SESSION_TTL_MS = 12 * 3600_000;
export const QUESTION_COUNTS = [5, 10, 15, 20] as const;
export const QUESTION_SECONDS = [10, 20, 30, 45] as const;
export const AVATARS = ['🦁', '🕊️', '📜', '🕯️', '🍇', '🌟', '📖', '🔥', '🌿', '🍯', '🎺', '🏛️', '🌙', '🍎', '💎', '🦌'] as const;

const MAX_POINTS = 1000;
const STREAK_STEP = 50;
const STREAK_CAP = 250;

export function generateCode(rng: () => number = Math.random): string {
  // First digit 1–9 so the PIN never loses a leading zero when typed as a number.
  let code = String(1 + Math.floor(rng() * 9));
  while (code.length < CODE_LENGTH) code += String(Math.floor(rng() * 10));
  return code;
}

export function isCode(v: unknown): v is string {
  return typeof v === 'string' && /^[1-9]\d{5}$/.test(v);
}

const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|co|il)\b)/i;

/** Normalized display name, or null when it can't be used. */
export function validateName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 1 || name.length > NAME_MAX) return null;
  if (LINK_RE.test(name)) return null;
  return name;
}

export function validateAvatar(raw: unknown): string {
  return typeof raw === 'string' && (AVATARS as readonly string[]).includes(raw) ? raw : AVATARS[0];
}

export function validateSettings(raw: unknown): PlaySettings | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const kinds = Array.isArray(r.kinds) ? ALL_KINDS.filter(k => (r.kinds as unknown[]).includes(k)) : [];
  if (kinds.length === 0) return null;
  const level: PlayLevel = LEVELS.find(l => l === r.level) ?? 'normal';
  const eras = Array.isArray(r.eras) ? CATEGORY_ORDER.filter(c => (r.eras as unknown[]).includes(c)) : [];
  const count = (QUESTION_COUNTS as readonly number[]).includes(Number(r.count)) ? Number(r.count) : null;
  const seconds = (QUESTION_SECONDS as readonly number[]).includes(Number(r.seconds)) ? Number(r.seconds) : null;
  if (count === null || seconds === null) return null;
  const masechet = typeof r.masechet === 'string' && MASECHTOT.some(m => m.name === r.masechet) ? r.masechet : undefined;
  const seder = !masechet && typeof r.seder === 'string' && (SEDARIM as readonly string[]).includes(r.seder) ? r.seder : undefined;
  return {
    kinds, count, seconds, level,
    ...(seder ? { seder } : {}), ...(masechet ? { masechet } : {}), ...(eras.length ? { eras } : {}),
  };
}

/** Read time before the options open — longer prompts get longer to read. */
export function leadMsFor(prompt: string, body?: string): number {
  const chars = prompt.length + (body?.length ?? 0);
  return Math.min(7000, Math.max(2500, 2000 + chars * 18));
}

/**
 * Kahoot-style scoring: a correct answer is worth 1000 at the first instant,
 * sliding to 500 at the buzzer, plus a capped bonus for an answer streak.
 * `streak` counts this answer (1 = first correct in a row).
 */
export function questionPoints(correct: boolean, elapsedMs: number, durationMs: number, streak: number): number {
  if (!correct) return 0;
  const t = Math.min(1, Math.max(0, elapsedMs / Math.max(1, durationMs)));
  const base = Math.round(MAX_POINTS * (1 - t / 2));
  return base + Math.min(STREAK_CAP, Math.max(0, streak - 1) * STREAK_STEP);
}

/** Competition ranking (1, 2, 2, 4) by score, stable by join order. */
export function rankOf<T extends { score: number }>(rows: T[]): Map<T, number> {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const ranks = new Map<T, number>();
  sorted.forEach((row, i) => {
    const prev = sorted[i - 1];
    ranks.set(row, prev && prev.score === row.score ? ranks.get(prev)! : i + 1);
  });
  return ranks;
}

export interface PhaseChange { status: PlayStatus; current: number; }

/** The phase machine. Returns null when the action isn't allowed now. */
export function nextPhase(status: PlayStatus, current: number, total: number, action: PlayHostAction['action']): PhaseChange | null {
  if (status === 'ended') return null;
  if (action === 'end') return { status: 'ended', current };
  switch (action) {
    case 'start':
      return status === 'lobby' && total > 0 ? { status: 'question', current: 0 } : null;
    case 'reveal':
      return status === 'question' ? { status: 'reveal', current } : null;
    case 'board':
      return status === 'reveal' ? { status: 'board', current } : null;
    case 'next':
      if (status !== 'reveal' && status !== 'board') return null;
      return current + 1 < total ? { status: 'question', current: current + 1 } : { status: 'ended', current };
    default:
      return null;
  }
}

/** When answers for the current question open and close (epoch ms). */
export function questionWindow(phaseAt: number, leadMs: number, questionMs: number): { opensAt: number; endsAt: number } {
  const opensAt = phaseAt + leadMs;
  return { opensAt, endsAt: opensAt + questionMs };
}
