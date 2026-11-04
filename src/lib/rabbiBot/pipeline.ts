import type { RabbiBotAnswer, RabbiBotKind, RabbiBotStep } from '@/types/rabbiBot';
import { generateJson, ModelHooks, answerModels } from './gemini';
import { ANSWER_SYSTEM, ANSWER_SCHEMA, answerPrompt, fitPassages } from './prompts';
import { makePlan, PLAN_CAPS } from './plan';
import { retrieve } from './retrieve';
import { verifyAnswer, fixedAnswer, RawAnswer } from './verify';
import { isTopic } from './rules';

const strings = (v: unknown, max: number, len: number) =>
  (Array.isArray(v) ? v : []).filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim().slice(0, len)).slice(0, max);
const text = (v: unknown, len: number) => (typeof v === 'string' ? v.trim().slice(0, len) : '');
const REWRITE_MAX = 200;

export interface AskResult {
  answer: RabbiBotAnswer;
  /** The model that wrote the answer (or planned it, for fixed replies). */
  model: string;
}

export type StepFn = (step: RabbiBotStep, extra?: { count?: number; books?: string[] }) => void;

const MAX_SHOWN_BOOKS = 10;
/** Source text sent to small-input models (Groq): ~3k tokens, leaving room for its plan in the same minute. */
const COMPACT_SOURCE_CHARS = 6000;

/**
 * Question → plan (Groq ensemble or Gemini chain, plan.ts — restated in the sources' language, with the refs, terms,
 * and the rule / parallel cases that decide it) → sources (Sefaria,
 * Wikisource, the site's summaries) → answer (best model with quota) → quote
 * verification (code).
 * Throws NoModelError when no model is available.
 */
export async function askRabbiBot(question: string, hooks: ModelHooks, onStep: StepFn): Promise<AskResult> {
  onStep('plan');
  const plan = await makePlan(question, hooks);
  const p = plan.plan;
  const topic = isTopic(p.topic) ? p.topic : 'other';
  if (p.kind === 'sensitive') return { answer: fixedAnswer('sensitive', topic), model: plan.model };
  if (p.kind !== 'halacha' && p.kind !== 'torah') return { answer: fixedAnswer('other', topic), model: plan.model };
  const kind: RabbiBotKind = p.kind;

  onStep('search');
  const understood = text(p.rewrite, REWRITE_MAX);
  const passages = await retrieve(question, {
    kind,
    refs: strings(p.refs, PLAN_CAPS.refs, 120),
    searches: strings(p.searches, PLAN_CAPS.searches, 80),
    terms: strings(p.terms, PLAN_CAPS.terms, 40),
    quote: text(p.quote, 120),
    rewrite: understood,
    parallels: strings(p.parallels, PLAN_CAPS.parallels, 120),
    principles: strings(p.principles, PLAN_CAPS.principles, 60),
  });
  const books = Array.from(new Set(passages.map(x => x.book))).slice(0, MAX_SHOWN_BOOKS);
  const context = { kind, understood: understood || undefined, searchedBooks: books };
  onStep('read', { count: passages.length, books });
  if (passages.length === 0) return { answer: { ...verifyAnswer({ status: 'not_found' }, [], topic), ...context }, model: plan.model };

  onStep('answer');
  const answer = await generateJson(answerModels(), {
    system: ANSWER_SYSTEM, user: answerPrompt(question, kind, passages, understood), schema: ANSWER_SCHEMA, timeoutMs: 22_000,
    compactUser: answerPrompt(question, kind, fitPassages(passages, COMPACT_SOURCE_CHARS), understood),
  }, hooks);

  onStep('verify');
  const verified = verifyAnswer(answer.value as RawAnswer, passages, topic);
  // A Torah question has no Sephardi/Ashkenazi split — a stray "ashkenaz" view is just a note.
  if (kind === 'torah') {
    verified.points = verified.points.map(pt => (pt.view === 'ashkenaz' ? { ...pt, view: 'note' } : pt));
    verified.dispute = false;
  }
  return { answer: { ...verified, ...context, searched: passages.length }, model: answer.model };
}
