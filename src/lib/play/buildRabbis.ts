import type { PlayLevel, PlayQuestion, PlayQuestionKind } from '@/types/play';
import type { RabbiCategory } from '@/types';
import type { KnowledgeKind } from '@/types/quizModes';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { buildKnowledgeQuestion, maskName } from '@/lib/knowledgeQuiz';
import { clip } from '@/lib/siteUrl';
import { HE } from '@/lib/hebrewTexts';
import { shuffled, withOptions, type Rng } from './util';

/** Rabbi question builders (directory rows filtered by the host's eras). */
export interface SrcRabbi {
  id: string; name: string; fullName: string | null; bio: string; category: string;
  sortYear: number; datePeriod: string; deathDate: string | null; imageUrl: string | null;
}

// Overlapping eras — never offered as distractors for one another.
const BIBLICAL: RabbiCategory[] = ['torah', 'shoftim', 'melachim', 'neviim', 'ketuvim'];
const LATE: RabbiCategory[] = ['acharonim', 'hasidim', 'abuchatzira', 'late'];
const GAP: Record<PlayLevel, number> = { easy: 150, normal: 60, hard: 25 };
const SPAN: Record<PlayLevel, number> = { easy: Infinity, normal: 1500, hard: 400 };

const about = (r: SrcRabbi) => `${r.name} · ${r.datePeriod}`;
/** Disputed dates make ordering questions ambiguous — leave those rabbis out. */
const datable = (r: SrcRabbi) => !/מחלוקת|שנוי/.test(r.datePeriod);

function eraGroup(c: RabbiCategory): RabbiCategory[] {
  return BIBLICAL.includes(c) ? BIBLICAL : LATE.includes(c) ? LATE : [c];
}

export function eraQ(r: SrcRabbi, level: PlayLevel, rng: Rng): PlayQuestion | null {
  const cat = r.category as RabbiCategory;
  if (!CATEGORY_LABELS[cat] || cat === 'abuchatzira') return null;
  const blocked = eraGroup(cat);
  const idx = CATEGORY_ORDER.indexOf(cat);
  const dist = (c: RabbiCategory) => Math.abs(CATEGORY_ORDER.indexOf(c) - idx);
  const pool = CATEGORY_ORDER.filter(c => !blocked.includes(c) && c !== 'abuchatzira').sort((a, b) => dist(a) - dist(b));
  const choice = level === 'hard' ? pool.slice(0, 3) : level === 'easy' ? shuffled(pool.slice(-6), rng) : shuffled(pool.slice(0, 5), rng);
  return withOptions('era', HE.PLAY_Q_ERA(r.name), CATEGORY_LABELS[cat], choice.map(c => CATEGORY_LABELS[c]), rng, { explain: about(r) });
}

/** "Who lived first / last": four datable rabbis, pairwise ≥ GAP years apart. */
export function whoQ(kind: 'whoFirst' | 'whoLast', pivot: SrcRabbi, rabbis: SrcRabbi[], level: PlayLevel, rng: Rng): PlayQuestion | null {
  if (!datable(pivot)) return null;
  const dir = kind === 'whoFirst' ? 1 : -1;
  const gap = GAP[level];
  const span = SPAN[level];
  const cands = shuffled(rabbis.filter(r => {
    const d = (r.sortYear - pivot.sortYear) * dir;
    return datable(r) && d >= gap && d <= span;
  }), rng);
  const picked: SrcRabbi[] = [pivot];
  for (const r of cands) {
    if (picked.every(p => Math.abs(p.sortYear - r.sortYear) >= gap && p.name !== r.name)) picked.push(r);
    if (picked.length === 4) break;
  }
  if (picked.length < 4) return null;
  const order = [...picked].sort((a, b) => a.sortYear - b.sortYear);
  const prompt = kind === 'whoFirst' ? HE.PLAY_Q_WHO_FIRST : HE.PLAY_Q_WHO_LAST;
  return withOptions(kind, prompt, pivot.name, picked.slice(1).map(r => r.name), rng,
    { explain: order.map(r => `${r.name} (${r.datePeriod})`).join(' ← ') });
}

/** Distractor names: same era first on normal/hard, anyone on easy. */
function lookalikes(r: SrcRabbi, rabbis: SrcRabbi[], level: PlayLevel, rng: Rng): string[] {
  const others = rabbis.filter(o => o.id !== r.id && o.name !== r.name);
  if (level === 'easy') return shuffled(others, rng).map(o => o.name);
  const same = others.filter(o => o.category === r.category);
  return [...shuffled(same, rng), ...shuffled(others.filter(o => o.category !== r.category), rng)].map(o => o.name);
}

export function bioQ(r: SrcRabbi, rabbis: SrcRabbi[], level: PlayLevel, rng: Rng): PlayQuestion | null {
  if (r.bio.length < 45 || rabbis.some(o => o.id !== r.id && o.bio === r.bio)) return null;
  return withOptions('bio', HE.PLAY_Q_BIO, r.name, lookalikes(r, rabbis, level, rng), rng,
    { body: clip(maskName(r.bio, r), 220), explain: about(r) });
}

export function imageQ(r: SrcRabbi, rabbis: SrcRabbi[], level: PlayLevel, rng: Rng): PlayQuestion | null {
  if (!r.imageUrl || !/^https:\/\//.test(r.imageUrl)) return null;
  return withOptions('image', HE.PLAY_Q_IMAGE, r.name, lookalikes(r, rabbis, level, rng), rng,
    { image: r.imageUrl, explain: about(r) });
}

const KNOWLEDGE: Partial<Record<PlayQuestionKind, KnowledgeKind>> = {
  century: 'era', yahrzeit: 'yahrzeit', relation: 'relation', contemporary: 'contemporary', fact: 'fact',
};

/** The solo "שאלות ידע" generators, reused as-is (they already refuse ambiguity). */
export function knowledgeQ(kind: PlayQuestionKind, rabbis: SrcRabbi[], used: Set<string>, rng: Rng): PlayQuestion | null {
  const only = KNOWLEDGE[kind];
  if (!only) return null;
  const k = buildKnowledgeQuestion(rabbis, rng, used, only);
  if (!k) return null;
  used.add(k.id);
  const r = rabbis.find(x => x.name === k.about);
  return withOptions(kind, k.prompt, k.options[k.answer], k.options.filter((_, i) => i !== k.answer), rng,
    { explain: r ? about(r) : k.about });
}
