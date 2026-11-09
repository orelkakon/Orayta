import type { TehillimCreateInput, TehillimMode, TehillimPurpose } from '@/types/tehillim';

/**
 * Validating a new reading (pure, tested): the purpose, one to five names,
 * optional title / note, the unit size, the goal and an optional end date.
 * Free text is stripped of bidi / control characters and may hold no links.
 */
export const PURPOSES: TehillimPurpose[] = ['refua', 'neshama', 'hatzlacha', 'zivug', 'banim', 'yeshua', 'shmira', 'other'];
export const MODES: TehillimMode[] = ['chapter', 'day', 'book'];
export const GOALS = [1, 2, 3, 7, 10, 18, 40, 0];
export const NAMES_MAX = 5;
export const NAME_MAX = 40;
export const TITLE_MAX = 60;
export const NOTE_MAX = 240;
export const READER_NAME_MAX = 24;
const MAX_DAYS_AHEAD = 120;

const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|co|il)\b)/i;

/** Single-line clean text, or null when empty / too long / a link. */
export function cleanLine(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.replace(/[\u0000-\u001F\u007F‎‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s || s.length > max || LINK_RE.test(s)) return null;
  return s;
}

/** Multi-line note: keeps line breaks (at most two in a row). */
export function cleanNote(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.replace(/[\u0000-\u0009\u000B-\u001F\u007F‎‏‪-‮⁦-⁩]/g, ' ')
    .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!s || s.length > NOTE_MAX || LINK_RE.test(s)) return null;
  return s;
}

export type CreateResult = { ok: true; value: TehillimCreateInput & { endsAt: string | null } } | { ok: false; field: string };

export function validateCreate(raw: unknown, now: Date = new Date()): CreateResult {
  const b = (raw ?? {}) as Record<string, unknown>;
  const purpose = b.purpose as TehillimPurpose;
  if (!PURPOSES.includes(purpose)) return { ok: false, field: 'purpose' };
  const rawNames = Array.isArray(b.names) ? b.names : [];
  const names = rawNames.map(n => cleanLine(n, NAME_MAX)).filter((n): n is string => !!n && n.length >= 2);
  if (names.length === 0 || names.length > NAMES_MAX || names.length !== rawNames.filter(n => typeof n === 'string' && n.trim()).length) {
    return { ok: false, field: 'names' };
  }
  const title = b.title ? cleanLine(b.title, TITLE_MAX) : undefined;
  if (title === null) return { ok: false, field: 'title' };
  const note = b.note ? cleanNote(b.note) : undefined;
  if (note === null) return { ok: false, field: 'note' };
  const mode = b.mode as TehillimMode;
  if (!MODES.includes(mode)) return { ok: false, field: 'mode' };
  const goal = Number(b.goal);
  if (!Number.isInteger(goal) || goal < 0 || goal > 100) return { ok: false, field: 'goal' };
  let endsAt: string | null = null;
  if (b.endsAt) {
    const m = typeof b.endsAt === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.endsAt) : null;
    const end = m ? Date.parse(`${b.endsAt}T23:59:59+02:00`) : NaN;
    if (!m || !(end > now.getTime()) || end - now.getTime() > MAX_DAYS_AHEAD * 86_400_000) return { ok: false, field: 'endsAt' };
    endsAt = new Date(end).toISOString();
  }
  return { ok: true, value: { purpose, names, title: title ?? undefined, note: note ?? undefined, mode, goal, endsAt } };
}

const SLUG_ABC = 'abcdefghjkmnpqrstuvwxyz23456789';
export const SLUG_LEN = 7;

export function newSlug(rng: () => number = Math.random): string {
  return Array.from({ length: SLUG_LEN }, () => SLUG_ABC[Math.floor(rng() * SLUG_ABC.length)]).join('');
}

export const isSlug = (v: unknown): v is string => typeof v === 'string' && new RegExp(`^[${SLUG_ABC}]{${SLUG_LEN}}$`).test(v);

/** Closed by the organizer, or past its end date. */
export const isClosed = (c: { closed: boolean; endsAt: Date | string | null }, now: number) =>
  c.closed || (c.endsAt !== null && new Date(c.endsAt).getTime() < now);

/** Shortest time between taking a unit and marking it read — a floor against scripted "reads". */
export const MIN_READ_MS = 12_000;
