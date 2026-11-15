import type { RabbiBotFollowUp } from '@/types/rabbiBot';
import { normalizeCommentText } from '@/lib/feedComments';
import { QUESTION_MAX } from './rules';

/**
 * Follow-up questions (pure, tested in tests/rabbiBot.test.ts). A follow-up
 * carries the previous turn: the question, its restatement in the sources'
 * language, the short answer and the Sefaria refs it cited. Each turn's
 * restatement is already self-contained, so one turn back is enough for a
 * whole chain. Everything here is untrusted input from the client: it only
 * steers planning and retrieval — answers are still verified against the
 * passages fetched for this request.
 */
export const FOLLOW_MIN = 2;
const UNDERSTOOD_MAX = 200;
const SHORT_MAX = 400;
const REFS_MAX = 4;
/** A Sefaria ref: Latin words, numbers, and the punctuation Sefaria names use. */
const REF_RE = /^[A-Za-z][A-Za-z0-9 ,'.:-]{1,118}$/;

const clean = (v: unknown, max: number) =>
  normalizeCommentText(typeof v === 'string' ? v : '').replace(/\s+/g, ' ').trim().slice(0, max);

/** The previous turn sent with a follow-up, or null when absent / malformed. */
export function parseFollowUp(raw: unknown): RabbiBotFollowUp | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const question = clean(r.question, QUESTION_MAX);
  if (question.length < FOLLOW_MIN) return null;
  const refs = (Array.isArray(r.refs) ? r.refs : [])
    .filter((x): x is string => typeof x === 'string' && REF_RE.test(x.trim()))
    .map(x => x.trim());
  return {
    question,
    understood: clean(r.understood, UNDERSTOOD_MAX),
    short: clean(r.short, SHORT_MAX),
    refs: Array.from(new Set(refs)).slice(0, REFS_MAX),
  };
}

/** The previous turn, as the planner and the answer model read it. */
export function followUpContext(f: RabbiBotFollowUp): string {
  return [
    `Previous question: ${f.question}`,
    f.understood && `Previous question restated: ${f.understood}`,
    f.short && `Previous answer (short): ${f.short}`,
  ].filter(Boolean).join('\n');
}

/** Cache key part: the same follow-up after the same question is the same request. */
export const followUpKey = (f: RabbiBotFollowUp) => f.understood || f.question;

/** Planner refs first, then the refs the previous answer cited (deduped, capped). */
export function withPriorRefs(planned: string[], prior: string[], cap: number): string[] {
  return Array.from(new Set([...planned, ...prior])).slice(0, cap);
}
