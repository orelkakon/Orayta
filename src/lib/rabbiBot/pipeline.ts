import type { RabbiBotAnswer, RabbiBotKind, RabbiBotPassage, RabbiBotStep, RabbiBotTopic } from '@/types/rabbiBot';
import { generateJson, ModelHooks, answerModels } from './gemini';
import { ANSWER_SYSTEM, ANSWER_SCHEMA, answerPrompt, fitPassages } from './prompts';
import { makePlan, PLAN_CAPS } from './plan';
import { retrieve } from './retrieve';
import { verifyAnswer, fixedAnswer, RawAnswer } from './verify';
import { isTopic } from './rules';
import { partialAnswer } from './partial';
import { worthSecondTry } from './retry';

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
/** The verified part of an answer still being written (streamed). */
export type PartialFn = (answer: RabbiBotAnswer) => void;

const MAX_SHOWN_BOOKS = 10;
/** Source text sent to small-input models (Groq): ~3k tokens, leaving room for its plan in the same minute. */
const COMPACT_SOURCE_CHARS = 6000;
/** A second answer attempt only starts with at least this much of the request's budget left. */
const RETRY_MIN_MS = 15_000;

/** A Torah question has no Sephardi/Ashkenazi split — a stray "ashkenaz" view is just a note. */
function settle(a: RabbiBotAnswer, kind: RabbiBotKind): RabbiBotAnswer {
  if (kind !== 'torah') return a;
  return { ...a, points: a.points.map(pt => (pt.view === 'ashkenaz' ? { ...pt, view: 'note' } : pt)), dispute: false };
}

interface AnswerCall { question: string; kind: RabbiBotKind; topic: RabbiBotTopic; passages: RabbiBotPassage[]; understood: string }

/**
 * One answer attempt on `models`, streamed: each time a whole point arrives
 * it is verified, and the verified points so far go to `onDraft`.
 */
async function answerOnce(models: string[], c: AnswerCall, hooks: ModelHooks, onDraft: PartialFn) {
  let seen = 0;
  const r = await generateJson(models, {
    system: ANSWER_SYSTEM, user: answerPrompt(c.question, c.kind, c.passages, c.understood), schema: ANSWER_SCHEMA, timeoutMs: 22_000,
    compactUser: answerPrompt(c.question, c.kind, fitPassages(c.passages, COMPACT_SOURCE_CHARS), c.understood),
    onText: soFar => {
      const raw = partialAnswer(soFar);
      const count = Array.isArray(raw.points) ? raw.points.length : 0;
      if (count <= seen) return;
      seen = count;
      const draft = settle(verifyAnswer(raw, c.passages, c.topic), c.kind);
      if (draft.status === 'answered') onDraft(draft);
    },
  }, hooks);
  return { model: r.model, answer: settle(verifyAnswer(r.value as RawAnswer, c.passages, c.topic), c.kind) };
}

/**
 * Question → plan (Groq ensemble or Gemini chain, plan.ts — restated in the sources' language, with the refs, terms,
 * and the rule / parallel cases that decide it) → sources (Sefaria,
 * Wikisource, the site's summaries) → answer (best model with quota) → quote
 * verification (code).
 * Throws NoModelError when no model is available.
 */
export async function askRabbiBot(question: string, hooks: ModelHooks, onStep: StepFn, onPartial: PartialFn = () => undefined): Promise<AskResult> {
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
  const call = { question, kind, topic, passages, understood };
  const draft = (a: RabbiBotAnswer) => onPartial({ ...a, ...context, searched: passages.length });
  let result = await answerOnce(answerModels(), call, hooks, draft);
  onStep('verify');
  // A miss that looks like the model's (quotes not found, or nothing found in on-topic sources) gets the next model once.
  if (worthSecondTry(result.answer, passages, question) && hooks.deadline - Date.now() > RETRY_MIN_MS) {
    const chain = answerModels();
    const second = await answerOnce(chain.slice(chain.indexOf(result.model) + 1), call, hooks, draft).catch(() => null);
    if (second?.answer.status === 'answered') result = second;
  }
  return { answer: { ...result.answer, ...context, searched: passages.length }, model: result.model };
}
