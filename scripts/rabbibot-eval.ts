/**
 * רבי־בוט regression set: a few varied questions, each with the passage that
 * must reach the model. Measures planning + retrieval (and, with --answer, the
 * answer and its verification) and the time of each stage.
 *
 *   set -a; source .env; source .env.local; set +a
 *   npx tsx scripts/rabbibot-eval.ts            # plan + retrieval only (no flash quota)
 *   npx tsx scripts/rabbibot-eval.ts --answer   # also answer (uses the production answer chain)
 *   npx tsx scripts/rabbibot-eval.ts --only 3   # one case, with its passages listed
 *   npx tsx scripts/rabbibot-eval.ts --runs 3   # each case 3 times (the plan varies between runs)
 *
 * It spends the site's own free quota: each case is a plan on both Groq models
 * (~6.5k of their 200k tokens a day), and --answer a flash request (~20 a day
 * per model). Run it off-peak, and not many times a day.
 */
import { makePlan, PLAN_CAPS, RawPlan } from '@/lib/rabbiBot/plan';
import { retrieve, RetrievalPlan } from '@/lib/rabbiBot/retrieve';
import { generateJson, answerModels } from '@/lib/rabbiBot/gemini';
import { ANSWER_SYSTEM, ANSWER_SCHEMA, answerPrompt } from '@/lib/rabbiBot/prompts';
import { verifyAnswer, RawAnswer } from '@/lib/rabbiBot/verify';
import type { RabbiBotKind } from '@/types/rabbiBot';

interface Case { q: string; expect: string[] }

const SA = 'Shulchan Arukh, ';
const CASES: Case[] = [
  { q: 'עד מתי אפשר להדליק נרות חנוכה?', expect: [`${SA}Orach Chayim 672:2`] },
  { q: 'מה מברכים על אורז?', expect: [`${SA}Orach Chayim 208:7`] },
  { q: 'כמה זמן צריך לחכות בין בשר לחלב?', expect: [`${SA}Yoreh De'ah 89:1`] },
  { q: 'מותר לשתות קפה לפני תפילת שחרית?', expect: [`${SA}Orach Chayim 89:3`] },
  { q: 'שכחתי יעלה ויבוא בשחרית של ראש חודש, צריך לחזור?', expect: [`${SA}Orach Chayim 422:1`] },
  { q: 'כוס זכוכית שקניתי מגוי צריכה טבילה?', expect: [`${SA}Yoreh De'ah 120:1`] },
  { q: 'עד מתי זמן קריאת שמע של שחרית?', expect: [`${SA}Orach Chayim 58:1`] },
  { q: 'אשה חייבת בהבדלה?', expect: [`${SA}Orach Chayim 296:8`] },
  { q: 'מי אמר "אם אין אני לי מי לי"?', expect: ['Pirkei Avot 1:14'] },
  { q: 'כמה שנים מלך דוד?', expect: ['I Kings 2:11', 'II Samuel 5:4', 'I Chronicles 29:27'] },
  // Other areas: Gemara, Tanakh counting, Choshen Mishpat, Even HaEzer, tzedakah, communities that differ, a typo.
  { q: 'שנים אוחזין בטלית, מה הדין?', expect: ['Mishnah Bava Metzia 1:1', 'Bava Metzia 2a'] },
  { q: 'כמה בנים היו ליעקב אבינו?', expect: ['Genesis 35:22', 'Genesis 35:23', 'Genesis 49:28'] },
  { q: 'מצאתי ארנק ברחוב עם כסף, אני חייב להחזיר?', expect: [`${SA}Choshen Mishpat 259`, `${SA}Choshen Mishpat 260`, `${SA}Choshen Mishpat 262`] },
  { q: 'כמה עדים צריך בקידושין?', expect: [`${SA}Even HaEzer 42`] },
  { q: 'כמה צריך לתת מעשר כספים?', expect: [`${SA}Yoreh De'ah 249`] },
  { q: 'מותר לאכול קטניות בפסח?', expect: [`${SA}Orach Chayim 453`] },
  { q: 'מברכים על הלל בראש חודש?', expect: [`${SA}Orach Chayim 422`] },
  { q: 'אפשר לשטות מים לפני תפילת שחרית?', expect: [`${SA}Orach Chayim 89`] },
];

const args = process.argv.slice(2);
const withAnswer = args.includes('--answer');
const only = args.includes('--only') ? Number(args[args.indexOf('--only') + 1]) : null;
const runs = args.includes('--runs') ? Number(args[args.indexOf('--runs') + 1]) : 1;

const strings = (v: unknown, max: number) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, max) : []);
const text = (v: unknown) => (typeof v === 'string' ? v : '');

function toRetrieval(p: RawPlan, kind: RabbiBotKind): RetrievalPlan {
  return {
    kind, refs: strings(p.refs, PLAN_CAPS.refs), searches: strings(p.searches, PLAN_CAPS.searches),
    terms: strings(p.terms, PLAN_CAPS.terms), quote: text(p.quote), rewrite: text(p.rewrite),
    parallels: strings(p.parallels, PLAN_CAPS.parallels), principles: strings(p.principles, PLAN_CAPS.principles),
  };
}

async function runCase(c: Case, n: number, verbose: boolean) {
  const hooks = { skip: new Set<string>(), onExhausted: async () => undefined, deadline: Date.now() + 52_000 };
  const t0 = Date.now();
  const { plan, model } = await makePlan(c.q, hooks);
  const t1 = Date.now();
  const kind = plan.kind === 'torah' ? 'torah' : 'halacha';
  if (plan.kind !== 'halacha' && plan.kind !== 'torah') {
    console.log(`✗ ${n}. ${c.q}  — planned as "${String(plan.kind)}" (${model})`);
    return { hit: false, answered: false };
  }
  const passages = await retrieve(c.q, toRetrieval(plan, kind));
  const t2 = Date.now();
  const at = passages.findIndex(p => c.expect.some(e => p.ref === e || p.ref.startsWith(`${e}|`) || p.ref.startsWith(`${e}:`)));
  const hit = at >= 0;
  let line = `${hit ? '✓' : '✗'} ${n}. ${c.q}  — ${hit ? `S${at + 1}` : 'missing'} of ${passages.length} · plan ${t1 - t0}ms · retrieve ${t2 - t1}ms`;

  let answered = false;
  if (withAnswer && passages.length > 0) {
    const a = await generateJson(answerModels(), {
      system: ANSWER_SYSTEM, user: answerPrompt(c.q, kind, passages, text(plan.rewrite)), schema: ANSWER_SCHEMA, timeoutMs: 30_000,
    }, hooks);
    const v = verifyAnswer(a.value as RawAnswer, passages, 'other');
    answered = v.status === 'answered';
    line += ` · answer ${Date.now() - t2}ms ${v.status} ${v.verified}/${v.total} (${a.model})`;
    if (verbose) console.log(`  short: ${v.short}`);
  }
  console.log(line);
  if (verbose || !hit) {
    console.log(`  rewrite: ${text(plan.rewrite)} | refs: ${strings(plan.refs, 8).join('; ')} | terms: ${strings(plan.terms, 4).join(', ')}`);
    console.log(`  searches: ${strings(plan.searches, 4).join(' / ')}`);
    console.log(`  passages: ${passages.map(p => `${p.id} ${p.ref}`).join(' · ')}`);
  }
  return { hit, answered };
}

(async () => {
  const picked = only ? [[CASES[only - 1], only] as const] : CASES.map((c, i) => [c, i + 1] as const);
  const results: { n: number; hit: boolean; answered: boolean }[] = [];
  for (let r = 0; r < runs; r++) {
    if (runs > 1) console.log(`\n— run ${r + 1}/${runs}`);
    for (const [c, n] of picked) results.push({ n, ...(await runCase(c, n, only !== null)) });
  }
  const hits = results.filter(r => r.hit).length;
  console.log(`\nretrieved: ${hits}/${results.length}${withAnswer ? ` · answered: ${results.filter(r => r.answered).length}/${results.length}` : ''}`);
  if (runs > 1) {
    const missed = picked.map(([, n]) => [n, results.filter(r => r.n === n && !r.hit).length] as const).filter(([, m]) => m > 0);
    console.log(`missed (case: times): ${missed.map(([n, m]) => `${n}: ${m}`).join(', ') || 'none'}`);
  }
})();
