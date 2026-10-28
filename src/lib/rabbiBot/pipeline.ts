import type { RabbiBotAnswer, RabbiBotKind, RabbiBotStep } from '@/types/rabbiBot';
import { generateJson, ModelHooks, planModels, answerModels } from './gemini';
import { PLAN_SYSTEM, PLAN_SCHEMA, ANSWER_SYSTEM, ANSWER_SCHEMA, answerPrompt } from './prompts';
import { retrieve } from './retrieve';
import { verifyAnswer, fixedAnswer, RawAnswer } from './verify';
import { isTopic } from './rules';

interface RawPlan { kind?: unknown; topic?: unknown; refs?: unknown; searches?: unknown; quote?: unknown }

const strings = (v: unknown, max: number, len: number) =>
  (Array.isArray(v) ? v : []).filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim().slice(0, len)).slice(0, max);

export interface AskResult {
  answer: RabbiBotAnswer;
  /** The model that wrote the answer (or planned it, for fixed replies). */
  model: string;
}

export type StepFn = (step: RabbiBotStep, extra?: { count?: number; books?: string[] }) => void;

const MAX_SHOWN_BOOKS = 10;

/**
 * Question → plan (lite model) → sources (Sefaria, Wikisource, the site's
 * summaries) → answer (best model with quota) → quote verification (code).
 * Throws NoModelError when no model is available.
 */
export async function askRabbiBot(question: string, hooks: ModelHooks, onStep: StepFn): Promise<AskResult> {
  onStep('plan');
  const plan = await generateJson(planModels(), { system: PLAN_SYSTEM, user: question, schema: PLAN_SCHEMA, timeoutMs: 15_000 }, hooks);
  const p = plan.value as RawPlan;
  const topic = isTopic(p.topic) ? p.topic : 'other';
  if (p.kind === 'sensitive') return { answer: fixedAnswer('sensitive', topic), model: plan.model };
  if (p.kind !== 'halacha' && p.kind !== 'torah') return { answer: fixedAnswer('other', topic), model: plan.model };
  const kind: RabbiBotKind = p.kind;

  onStep('search');
  const passages = await retrieve(question, {
    kind,
    refs: strings(p.refs, 4, 120),
    searches: strings(p.searches, 3, 80),
    quote: typeof p.quote === 'string' ? p.quote.trim().slice(0, 120) : '',
  });
  const books = Array.from(new Set(passages.map(x => x.book))).slice(0, MAX_SHOWN_BOOKS);
  onStep('read', { count: passages.length, books });
  if (passages.length === 0) return { answer: { ...verifyAnswer({ status: 'not_found' }, [], topic), kind }, model: plan.model };

  onStep('answer');
  const answer = await generateJson(answerModels(), {
    system: ANSWER_SYSTEM, user: answerPrompt(question, kind, passages), schema: ANSWER_SCHEMA, timeoutMs: 22_000,
  }, hooks);

  onStep('verify');
  const verified = verifyAnswer(answer.value as RawAnswer, passages, topic);
  // A Torah question has no Sephardi/Ashkenazi split — a stray "ashkenaz" view is just a note.
  if (kind === 'torah') {
    verified.points = verified.points.map(pt => (pt.view === 'ashkenaz' ? { ...pt, view: 'note' } : pt));
    verified.dispute = false;
  }
  return { answer: { ...verified, kind }, model: answer.model };
}
