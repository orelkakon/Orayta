import type { Rabbi } from '@/types';
import type { KnowledgeKind, KnowledgeQuestion } from '@/types/quizModes';
import { HE } from '@/lib/hebrewTexts';
import { parseYearRange, centuryIndex, centuryParts, MAX_CENTURY_INDEX } from '@/lib/knowledge/era';
import { parseRelations, foldQuotes, Relation, RelKind } from '@/lib/knowledge/relations';
import { FACT_BANK } from '@/lib/knowledge/bank';
import { normalizeHebDate } from '@/lib/yahrzeit';

/**
 * "שאלות ידע" — multiple-choice questions generated from the rabbi
 * directory. Every generator returns null rather than risk an ambiguous
 * question: distractors are provably wrong (other centuries two apart,
 * other dates, rabbis born after the student, eras centuries away).
 */

export type KRabbi = Pick<Rabbi, 'id' | 'name' | 'fullName' | 'sortYear' | 'datePeriod' | 'bio' | 'category' | 'deathDate'>;
type Rng = () => number;

const pick = <T,>(arr: T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)];
function sample<T>(arr: T[], n: number, rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

/** Correct answer + three distractors, shuffled. */
function assemble(kind: KnowledgeKind, id: string, prompt: string, correct: string, wrong: string[], about: string, rng: Rng): KnowledgeQuestion | null {
  if (wrong.length < 3 || new Set([correct, ...wrong]).size < 4) return null;
  const options = sample([correct, ...wrong.slice(0, 3)], 4, rng);
  return { id, kind, prompt, options, answer: options.indexOf(correct), about };
}

/** One row per person — the directory has a few double entries (same bio). */
export function dedupe<R extends KRabbi>(rabbis: R[]): R[] {
  const seen = new Set<string>();
  return rabbis.filter(r => { const k = `${r.datePeriod}|${r.bio}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

export function centuryLabel(index: number): string {
  const { n, bce } = centuryParts(index);
  return bce ? HE.KQ_CENTURY_BCE(n) : HE.KQ_CENTURY(n);
}

function eraQuestion(r: KRabbi, rng: Rng): KnowledgeQuestion | null {
  const range = parseYearRange(r.datePeriod);
  if (!range) return null;
  const lo = centuryIndex(range.start);
  const hi = centuryIndex(range.end);
  // Two centuries clear of the whole lifetime and of each other.
  const cands = Array.from({ length: 15 }, (_, i) => lo - 7 + i)
    .filter(c => (c < lo - 1 || c > hi + 1) && c <= MAX_CENTURY_INDEX);
  const chosen: number[] = [];
  for (const c of sample(cands, cands.length, rng)) {
    if (chosen.every(x => Math.abs(x - c) >= 2)) chosen.push(c);
    if (chosen.length === 3) break;
  }
  return assemble('era', `era:${r.id}`, HE.KQ_ERA(r.name), centuryLabel(lo), chosen.map(centuryLabel), r.name, rng);
}

/** Day + month root, so "ט״ו באב" = "ט״ו אב" and "אדר" ≈ "אדר ב". */
export function dateKey(date: string): string {
  const parts = normalizeHebDate(date).split(' ');
  const month = (parts[1] ?? '').replace(/^ב(?=(ניסן|אייר|סיון|תמוז|אב|אלול|תשרי|חשון|כסלו|טבת|שבט|אדר))/, '');
  return `${parts[0]}|${month}`;
}

function yahrzeitQuestion(r: KRabbi, pool: KRabbi[], rng: Rng): KnowledgeQuestion | null {
  if (!r.deathDate) return null;
  const used = new Set([dateKey(r.deathDate)]);
  const wrong: string[] = [];
  for (const o of sample(pool.filter(o => o.deathDate), pool.length, rng)) {
    const k = dateKey(o.deathDate!);
    if (used.has(k)) continue;
    used.add(k); wrong.push(o.deathDate!);
    if (wrong.length === 3) break;
  }
  return assemble('yahrzeit', `yz:${r.id}`, HE.KQ_YAHRZEIT(r.name), r.deathDate, wrong, r.name, rng);
}

const ASK: Record<RelKind, (n: string) => string> = {
  teacher: HE.KQ_TEACHER_OF, father: HE.KQ_FATHER_OF, grandfather: HE.KQ_GRANDFATHER_OF, fatherInLaw: HE.KQ_FATHER_IN_LAW_OF,
};

/** Rabbis that never appear with `r` in a bio — safe as distractors. */
function unrelated(r: KRabbi, pool: KRabbi[]): KRabbi[] {
  const bio = foldQuotes(r.bio);
  const name = foldQuotes(r.name);
  return pool.filter(o => o.id !== r.id && !bio.includes(foldQuotes(o.name)) && !foldQuotes(o.bio).includes(name));
}

function relationQuestion(rel: Relation, byId: Map<string, KRabbi>, all: Relation[], pool: KRabbi[], rng: Rng): KnowledgeQuestion | null {
  const elder = byId.get(rel.from);
  const younger = byId.get(rel.to);
  if (!elder || !younger) return null;
  const linked = new Set(all.filter(x => x.kind === rel.kind && (x.to === younger.id || x.from === elder.id)).flatMap(x => [x.from, x.to]));
  const near = (o: KRabbi, ref: KRabbi) => Math.abs(o.sortYear - ref.sortYear) <= 600;
  // "Who was X's student?" exists only for teachers; family asks upward.
  if (rel.kind === 'teacher' && rng() < 0.4) {
    // Students: people born well before the teacher can't be the answer.
    const wrong = unrelated(elder, pool).filter(o => !linked.has(o.id) && o.sortYear < elder.sortYear - 30 && near(o, elder));
    return assemble('relation', `rel:s:${elder.id}:${younger.id}`, HE.KQ_STUDENT_OF(elder.name), younger.name, sample(wrong, 3, rng).map(o => o.name), younger.name, rng);
  }
  // Teachers / fathers: people born after the younger one can't be the answer.
  const wrong = unrelated(younger, pool).filter(o => !linked.has(o.id) && o.sortYear > younger.sortYear + 15 && near(o, younger));
  return assemble('relation', `rel:${rel.kind}:${younger.id}:${elder.id}`, ASK[rel.kind](younger.name), elder.name, sample(wrong, 3, rng).map(o => o.name), younger.name, rng);
}

function contemporaryQuestion(r: KRabbi, pool: KRabbi[], rng: Rng): KnowledgeQuestion | null {
  const peers = pool.filter(o => o.id !== r.id && o.category === r.category && Math.abs(o.sortYear - r.sortYear) <= 25);
  if (!peers.length) return null;
  const peer = pick(peers, rng);
  const far = pool.filter(o => Math.abs(o.sortYear - r.sortYear) >= 200);
  const closeFar = far.filter(o => Math.abs(o.sortYear - r.sortYear) <= 800);
  const wrong = sample(closeFar.length >= 3 ? closeFar : far, 3, rng).map(o => o.name);
  return assemble('contemporary', `cont:${r.id}:${peer.id}`, HE.KQ_CONTEMPORARY(r.name), peer.name, wrong, peer.name, rng);
}

function factQuestion(byName: Map<string, KRabbi>, rng: Rng, avoid: Set<string>): KnowledgeQuestion | null {
  const usable = FACT_BANK.map((f, i) => ({ f, id: `fact:${i}` })).filter(({ f, id }) => byName.has(f[0]) && !avoid.has(id));
  if (!usable.length) return null;
  const { f: [name, q, a, wrong], id } = pick(usable, rng);
  return assemble('fact', id, q, a, wrong, name, rng);
}

const KIND_WEIGHTS: [KnowledgeKind, number][] = [['fact', 3], ['relation', 2], ['era', 2], ['yahrzeit', 2], ['contemporary', 1]];

/** A fresh question whose id is not in `avoid`, or null when none can be built. */
export function buildKnowledgeQuestion(rabbis: KRabbi[], rng: Rng = Math.random, avoid: Set<string> = new Set(), only?: KnowledgeKind): KnowledgeQuestion | null {
  const pool = dedupe(rabbis);
  if (pool.length < 8) return null;
  const byId = new Map(pool.map(r => [r.id, r]));
  const byName = new Map(pool.map(r => [r.name, r]));
  const relations = parseRelations(pool);
  const total = KIND_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  for (let attempt = 0; attempt < 60; attempt++) {
    let kind = only;
    if (!kind) {
      let roll = rng() * total;
      kind = KIND_WEIGHTS.find(([, w]) => (roll -= w) < 0)?.[0] ?? 'fact';
    }
    const r = pick(pool, rng);
    const q = kind === 'fact' ? factQuestion(byName, rng, avoid)
      : kind === 'relation' ? (relations.length ? relationQuestion(pick(relations, rng), byId, relations, pool, rng) : null)
      : kind === 'era' ? eraQuestion(r, rng)
      : kind === 'yahrzeit' ? yahrzeitQuestion(r, pool, rng)
      : contemporaryQuestion(r, pool, rng);
    if (q && !avoid.has(q.id)) return q;
  }
  return null;
}

const NAME_STOP = new Set(['רבי', 'רב', 'הרב', 'רבן', 'רבנו', 'רבינו', 'בן', 'בר', 'בת', 'אבן', 'בעל', 'הקדוש', 'הצדיק',
  'המלך', 'הנביא', 'הנביאה', 'הכהן', 'הזקן', 'הגדול', 'אבינו', 'של']);

/**
 * Hides the rabbi's own name inside a bio shown as a clue: the whole name and
 * full name, plus each distinctive word of the display name ("סתם משנה — רבי
 * מאיר" in רבי מאיר's own bio). Patronymics in the full name stay visible.
 */
export function maskName(bio: string, r: Pick<KRabbi, 'name' | 'fullName'>): string {
  const words = new Set<string>([r.fullName ?? '', r.name].map(s => s.trim()).filter(s => s.length >= 2));
  r.name.replace(/[()/]/g, ' ').split(/\s+/)
    .filter(w => w.length >= 3 && !NAME_STOP.has(w)).forEach(w => words.add(w));
  let out = bio;
  Array.from(words).sort((a, b) => b.length - a.length).forEach(w => {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(^|[^\\u05D0-\\u05EA])([והבלמשד]?)${esc}(?=$|[^\\u05D0-\\u05EA])`, 'g'), '$1$2___');
  });
  return out;
}
