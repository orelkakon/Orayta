import { generateJson, generateJsonHedged, ModelHooks, planEnsemble, planModels, isConfigured } from './gemini';
import { PLAN_SYSTEM, PLAN_SCHEMA } from './prompts';
import { tocMatches, tocLines } from './toc';
import { keywords } from './text';
import { impliedWords } from './rank';

/** What a planning model returns (parsed JSON, untrusted). */
export interface RawPlan {
  kind?: unknown; topic?: unknown; refs?: unknown; searches?: unknown; terms?: unknown; quote?: unknown;
  rewrite?: unknown; parallels?: unknown; principles?: unknown;
}

/** How many of each list a merged plan keeps (the pipeline caps them again). */
export const PLAN_CAPS = { refs: 8, parallels: 4, searches: 4, terms: 4, principles: 2 } as const;

const ENSEMBLE_TIMEOUT_MS = 12_000;
/** Candidate simanim (by title) shown to the planner. */
const TOC_CANDIDATES = 10;

/**
 * The planner's message: the question, and the Shulchan Arukh simanim whose
 * titles share its words (toc.ts) — real titles with real numbers, so the
 * planner picks a siman instead of recalling a number (alone it named the
 * right siman in 3 of 13 test questions). ~300 tokens.
 */
export function planUser(question: string): string {
  const asked = keywords(question);
  const candidates = tocMatches({ asked, implied: impliedWords(asked) }, TOC_CANDIDATES);
  return candidates.length ? `${question}\n\n${PLAN_TOC_HEADER}\n${tocLines(candidates)}` : question;
}
const PLAN_TOC_HEADER = 'Shulchan Arukh simanim whose titles share words with the question (found by keyword — some are unrelated):';
/** A plan slower than this gets a second model racing it (Gemini fallback chain). */
const PLAN_HEDGE_MS = 7000;

const list = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && s.trim().length > 0) : []);
const firstText = (plans: RawPlan[], key: 'quote' | 'rewrite') =>
  plans.map(p => p[key]).find((v): v is string => typeof v === 'string' && v.trim().length > 0) ?? '';

/** a1, b1, a2, b2, … without repeats — each plan's best guesses first. */
function interleave(lists: string[][], cap: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.max(0, ...lists.map(l => l.length)); i++) {
    lists.forEach(l => { if (l[i] && !out.includes(l[i])) out.push(l[i]); });
  }
  return out.slice(0, cap);
}

/**
 * Merges plans from several models into one. Any "sensitive" verdict wins
 * (safety first); otherwise the first plan that found it answerable sets the
 * kind and topic. Lists are interleaved — the models miss different simanim,
 * and a wrong ref costs little (it fails to fetch or shares no words with the
 * question). The first non-empty rewrite / quote is kept. Pure — unit-tested.
 */
export function mergePlans(plans: RawPlan[]): RawPlan {
  if (plans.length <= 1) return plans[0] ?? {};
  const lead = plans.find(p => p.kind === 'sensitive') ?? plans.find(p => p.kind === 'halacha' || p.kind === 'torah') ?? plans[0];
  const merged = (key: keyof typeof PLAN_CAPS) => interleave(plans.map(p => list(p[key])), PLAN_CAPS[key]);
  return {
    kind: lead.kind, topic: lead.topic,
    refs: merged('refs'), parallels: merged('parallels'), searches: merged('searches'),
    terms: merged('terms'), principles: merged('principles'),
    quote: firstText(plans, 'quote'), rewrite: firstText(plans, 'rewrite'),
  };
}

/**
 * The plan for a question: the Groq ensemble in parallel, merged; when no
 * ensemble model is configured or all of them fail, the Gemini plan chain —
 * which also gets a say when part of the ensemble failed and the rest called
 * the question "other" (a lone gpt-oss turns away "how much is a log in liters").
 * `model` = the first model whose plan was used.
 */
export async function makePlan(question: string, hooks: ModelHooks): Promise<{ plan: RawPlan; model: string }> {
  const call = { system: PLAN_SYSTEM, user: planUser(question), schema: PLAN_SCHEMA };
  const ensemble = planEnsemble().filter(m => isConfigured(m) && !hooks.skip.has(m));
  if (ensemble.length > 0) {
    const results = await Promise.allSettled(ensemble.map(m => generateJson([m], { ...call, timeoutMs: ENSEMBLE_TIMEOUT_MS }, hooks)));
    const done = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
    const plan = mergePlans(done.map(d => d.value as RawPlan));
    const partial = done.length < ensemble.length;
    if (done.length > 0 && !(partial && plan.kind === 'other')) return { plan, model: done[0].model };
    if (done.length > 0) {
      const second = await generateJsonHedged(planModels(), { ...call, timeoutMs: 15_000 }, hooks, PLAN_HEDGE_MS).catch(() => null);
      return second ? { plan: second.value as RawPlan, model: second.model } : { plan, model: done[0].model };
    }
  }
  const r = await generateJsonHedged(planModels(), { ...call, timeoutMs: 15_000 }, hooks, PLAN_HEDGE_MS);
  return { plan: r.value as RawPlan, model: r.model };
}
