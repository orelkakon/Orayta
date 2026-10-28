import type { RabbiBotAnswer, RabbiBotStep } from '@/types/rabbiBot';
import { generateJson, ModelHooks } from './gemini';
import { PLAN_SYSTEM, PLAN_SCHEMA, ANSWER_SYSTEM, ANSWER_SCHEMA, answerPrompt } from './prompts';
import { retrieve } from './retrieve';
import { verifyAnswer, fixedAnswer, RawAnswer } from './verify';
import { isTopic } from './rules';

interface RawPlan { kind?: unknown; topic?: unknown; refs?: unknown; searches?: unknown }

const strings = (v: unknown, max: number, len: number) =>
  (Array.isArray(v) ? v : []).filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim().slice(0, len)).slice(0, max);

export interface AskResult {
  answer: RabbiBotAnswer;
  /** The model that wrote the answer (or planned it, for fixed replies). */
  model: string;
}

/**
 * Question → plan (model) → sources (Sefaria + Wikisource) → answer (model)
 * → quote verification (code). Throws NoModelError when no model is available.
 */
export async function askRabbiBot(
  question: string,
  hooks: ModelHooks,
  onStep: (step: RabbiBotStep, count?: number) => void,
): Promise<AskResult> {
  onStep('plan');
  const plan = await generateJson({ system: PLAN_SYSTEM, user: question, schema: PLAN_SCHEMA, timeoutMs: 20_000 }, hooks);
  const p = plan.value as RawPlan;
  const topic = isTopic(p.topic) ? p.topic : 'other';
  if (p.kind === 'sensitive') return { answer: fixedAnswer('sensitive', topic), model: plan.model };
  if (p.kind === 'other') return { answer: fixedAnswer('other', topic), model: plan.model };

  onStep('search');
  const passages = await retrieve(question, { refs: strings(p.refs, 4, 120), searches: strings(p.searches, 3, 80) });
  onStep('read', passages.length);
  if (passages.length === 0) return { answer: verifyAnswer({ status: 'not_found' }, [], topic), model: plan.model };

  onStep('answer');
  const answer = await generateJson({
    system: ANSWER_SYSTEM, user: answerPrompt(question, passages), schema: ANSWER_SCHEMA, timeoutMs: 32_000,
  }, hooks);

  onStep('verify');
  return { answer: verifyAnswer(answer.value as RawAnswer, passages, topic), model: answer.model };
}
