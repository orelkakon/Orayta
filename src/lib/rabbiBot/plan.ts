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
 * Whether a plan needs a second planner: it turned the question away
 * ("other" — a lone model once turned away "how much is a log in liters") or
 * found it answerable but named no ref to look in. "sensitive" stands. Pure — unit-tested.
 */
export function needsSecondPlan(p: RawPlan): boolean {
  if (p.kind === 'sensitive') return false;
  if (p.kind !== 'halacha' && p.kind !== 'torah') return true;
  return list(p.refs).length === 0;
}

/**
 * The plan for a question. The Groq planners run one at a time, cheapest
 * first (Qwen ~2.4k tokens, gpt-oss ~4k with its reasoning; Groq allows 200k
 * a day per model): the next one runs only when the plan so far needs a second
 * opinion (needsSecondPlan), and their plans are merged. The table of
 * contents in the message (planUser) is what grounds the siman now, so a
 * second model is rarely worth its tokens. When none answers, or one failed
 * and the rest still say "other", the Gemini plan chain decides.
 * `model` = the first model whose plan was used.
 */
export async function makePlan(question: string, hooks: ModelHooks): Promise<{ plan: RawPlan; model: string }> {
  const call = { system: PLAN_SYSTEM, user: planUser(question), schema: PLAN_SCHEMA };
  const planners = planEnsemble().filter(m => isConfigured(m) && !hooks.skip.has(m));
  const done: { value: unknown; model: string }[] = [];
  let failed = false;
  for (const m of planners) {
    const r = await generateJson([m], { ...call, timeoutMs: ENSEMBLE_TIMEOUT_MS }, hooks).catch(() => null);
    if (r) done.push(r); else failed = true;
    if (done.length > 0 && !needsSecondPlan(mergePlans(done.map(d => d.value as RawPlan)))) break;
  }
  if (done.length > 0) {
    const plan = mergePlans(done.map(d => d.value as RawPlan));
    if (!(failed && plan.kind === 'other')) return { plan, model: done[0].model };
    const second = await generateJsonHedged(planModels(), { ...call, timeoutMs: 15_000 }, hooks, PLAN_HEDGE_MS).catch(() => null);
    return second ? { plan: second.value as RawPlan, model: second.model } : { plan, model: done[0].model };
  }
  const r = await generateJsonHedged(planModels(), { ...call, timeoutMs: 15_000 }, hooks, PLAN_HEDGE_MS);
  return { plan: r.value as RawPlan, model: r.model };
}
