import type { RabbiBotTopic } from '@/types/rabbiBot';
import { normalizeCommentText } from '@/lib/feedComments';

/** Pure rules for רבי־בוט, shared by the API and the composer. Unit-tested. */

export const QUESTION_MIN = 6;
export const QUESTION_MAX = 300;
/** Question/answer text and IP hashes are erased after this; counts stay. */
export const RETENTION_DAYS = 10;

export const TOPICS: readonly RabbiBotTopic[] =
  ['shabbat', 'tefila', 'brachot', 'kashrut', 'moadim', 'family', 'avelut', 'mitzvot', 'bein_adam', 'tanakh', 'talmud', 'machshava', 'other'];

export function isTopic(t: unknown): t is RabbiBotTopic {
  return typeof t === 'string' && (TOPICS as readonly string[]).includes(t);
}

const LINK_RE = /(https?:\/\/|www\.)/i;

export type QuestionCheck =
  | { ok: true; text: string }
  | { ok: false; error: 'too_short' | 'too_long' | 'link' };

export function validateQuestion(raw: unknown): QuestionCheck {
  const text = normalizeCommentText(typeof raw === 'string' ? raw : '').replace(/\s+/g, ' ');
  if (text.length < QUESTION_MIN) return { ok: false, error: 'too_short' };
  if (text.length > QUESTION_MAX) return { ok: false, error: 'too_long' };
  if (LINK_RE.test(text)) return { ok: false, error: 'link' };
  return { ok: true, text };
}

export function isRating(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5;
}

// ── Quota ────────────────────────────────────────────────────────────────
// Gemini's free daily quota resets at midnight Pacific time.

const QUOTA_TZ = 'America/Los_Angeles';

/** The quota day ('YYYY-MM-DD' in Pacific time) that `now` falls in. */
export function quotaDay(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: QUOTA_TZ }).format(now);
}

/** When the current quota day ends (next Pacific midnight). */
export function quotaResetAt(now: Date): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: QUOTA_TZ, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0);
  const elapsed = (get('hour') * 3600 + get('minute') * 60 + get('second')) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() + 86_400_000 - elapsed);
}

export type ModelFailure = 'daily' | 'rate' | 'error';

/**
 * Classifies a failed Gemini call. Only a per-day quota violation means "done
 * for today"; per-minute limits and server errors just move on to the next model.
 */
export function classifyFailure(status: number, body: unknown): ModelFailure {
  if (status !== 429) return 'error';
  const details = (body as { error?: { details?: unknown[] } } | null)?.error?.details ?? [];
  const daily = details.some(d => {
    const violations = (d as { violations?: { quotaId?: string }[] }).violations ?? [];
    return violations.some(v => /PerDay/i.test(v.quotaId ?? ''));
  });
  return daily ? 'daily' : 'rate';
}
