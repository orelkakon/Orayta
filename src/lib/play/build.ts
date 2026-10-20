import type { PlayQuestion, PlayQuestionKind, PlayTopic } from '@/types/play';
import type { RabbiCategory } from '@/types';
import { MASECHTOT } from '@/lib/hebrewData';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { calculateGematria } from '@/lib/gematria';
import { clip } from '@/lib/siteUrl';
import { HE } from '@/lib/hebrewTexts';
import { leadMsFor } from './rules';
import { clipWords, shuffled, type Rng } from './util';

/**
 * Builds a frozen question set from plain rows (no I/O — tested). Every
 * builder returns null rather than an ambiguous question, and the same
 * citation/rabbi/book is never asked twice in one game.
 */
export interface PlaySource {
  citations: { id: string; content: string; locations: { masechet: string; seder: string; daf: string; amud: string | null }[] }[];
  rabbis: { id: string; name: string; fullName: string | null; bio: string; category: string; sortYear: number; datePeriod: string }[];
  books: { id: string; title: string; author: string }[];
  gematria: { id: string; word: string; value: number }[];
}

type Citation = PlaySource['citations'][number];
type Rabbi = PlaySource['rabbis'][number];

const KINDS: Record<PlayTopic, PlayQuestionKind[]> = {
  talmud: ['masechet', 'complete'],
  rabbis: ['era', 'whoFirst', 'bio', 'book'],
  gematria: ['gematria'],
};

// Overlapping eras — never offered as distractors for one another.
const BIBLICAL: RabbiCategory[] = ['torah', 'shoftim', 'melachim', 'neviim', 'ketuvim'];
const LATE: RabbiCategory[] = ['acharonim', 'hasidim', 'abuchatzira', 'late'];
const NAME_STOP = new Set(['רבי', 'רב', 'רבן', 'בן', 'בר', 'הרב', 'רבינו', 'מרן', 'אבא', 'הקדוש']);

/** Puts the right answer among 3 distractors at a random position. */
function withOptions(kind: PlayQuestionKind, prompt: string, right: string, wrong: string[], rng: Rng, extra: { body?: string; explain?: string } = {}): PlayQuestion | null {
  const distinct = Array.from(new Set(wrong.filter(w => w !== right))).slice(0, 3);
  if (distinct.length < 3) return null;
  const options = shuffled([right, ...distinct], rng);
  return { kind, prompt, ...extra, options, correct: options.indexOf(right), leadMs: leadMsFor(prompt, extra.body) };
}

const locLabel = (l: Citation['locations'][number]) => `${l.masechet} ${l.daf}${l.amud ? ` ${l.amud}` : ''}`;

function masechetQ(c: Citation, rng: Rng): PlayQuestion | null {
  const right = c.locations[0]?.masechet;
  if (!right) return null;
  const own = new Set(c.locations.map(l => l.masechet));
  const seder = c.locations[0].seder;
  const near = shuffled(MASECHTOT.filter(m => m.seder === seder && !own.has(m.name)), rng).slice(0, 2);
  const far = shuffled(MASECHTOT.filter(m => !own.has(m.name) && !near.includes(m)), rng);
  const wrong = [...near, ...far].slice(0, 3).map(m => m.name);
  return withOptions('masechet', HE.PLAY_Q_MASECHET, right, wrong, rng,
    { body: clip(c.content, 260), explain: c.locations.map(locLabel).join(' · ') });
}

/** Disputed dates make "who came first" ambiguous — leave those rabbis out. */
const datable = (r: Rabbi) => !/מחלוקת|שנוי/.test(r.datePeriod);

/** Second half of a citation, clipped to a tile-friendly length. */
function tailOf(content: string): { head: string; tail: string } | null {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length < 10) return null;
  const cut = Math.max(5, Math.round(words.length * 0.5));
  return { head: words.slice(0, cut).join(' '), tail: clipWords(words.slice(cut).join(' '), 70) };
}

function completeQ(c: Citation, all: Citation[], rng: Rng): PlayQuestion | null {
  const parts = tailOf(c.content);
  if (!parts) return null;
  const wrong = shuffled(all.filter(o => o.id !== c.id), rng)
    .map(o => tailOf(o.content)?.tail).filter((t): t is string => !!t);
  return withOptions('complete', HE.PLAY_Q_COMPLETE, parts.tail, wrong, rng,
    { body: `${clipWords(parts.head, 200)} …`, explain: c.locations.map(locLabel).join(' · ') });
}

function eraGroup(cat: string): RabbiCategory[] {
  const c = cat as RabbiCategory;
  if (BIBLICAL.includes(c)) return BIBLICAL;
  if (LATE.includes(c)) return LATE;
  return [c];
}

function eraQ(r: Rabbi, rng: Rng): PlayQuestion | null {
  const cat = r.category as RabbiCategory;
  if (!CATEGORY_LABELS[cat] || cat === 'abuchatzira') return null;
  const blocked = eraGroup(cat);
  const idx = CATEGORY_ORDER.indexOf(cat);
  // Prefer nearby eras — plausible, but never overlapping.
  const pool = CATEGORY_ORDER
    .filter(c => !blocked.includes(c) && c !== 'abuchatzira')
    .sort((a, b) => Math.abs(CATEGORY_ORDER.indexOf(a) - idx) - Math.abs(CATEGORY_ORDER.indexOf(b) - idx));
  const wrong = shuffled(pool.slice(0, 5), rng).slice(0, 3).map(c => CATEGORY_LABELS[c]);
  return withOptions('era', HE.PLAY_Q_ERA(r.name), CATEGORY_LABELS[cat], wrong, rng, { explain: `${r.name} · ${r.datePeriod}` });
}

function whoFirstQ(first: Rabbi, rabbis: Rabbi[], rng: Rng): PlayQuestion | null {
  if (!datable(first)) return null;
  const later = shuffled(rabbis.filter(r => datable(r) && r.sortYear >= first.sortYear + 40), rng);
  const picked: Rabbi[] = [first];
  for (const r of later) {
    if (picked.every(p => Math.abs(p.sortYear - r.sortYear) >= 40 && p.name !== r.name)) picked.push(r);
    if (picked.length === 4) break;
  }
  if (picked.length < 4) return null;
  const order = [...picked].sort((a, b) => a.sortYear - b.sortYear);
  return withOptions('whoFirst', HE.PLAY_Q_WHO_FIRST, first.name, picked.slice(1).map(r => r.name), rng,
    { explain: order.map(r => `${r.name} (${r.datePeriod})`).join(' ← ') });
}

export function maskName(bio: string, r: Pick<Rabbi, 'name' | 'fullName'>): string {
  const tokens = [r.name, r.fullName ?? '', ...`${r.name} ${r.fullName ?? ''}`.split(/\s+/)]
    .map(t => t.replace(/["'״׳()]/g, '').trim())
    .filter(t => t.length >= 3 && !NAME_STOP.has(t))
    .sort((a, b) => b.length - a.length);
  return tokens.reduce((s, t) => s.split(t).join('___'), bio);
}

function bioQ(r: Rabbi, rabbis: Rabbi[], rng: Rng): PlayQuestion | null {
  if (r.bio.length < 45 || rabbis.some(o => o.id !== r.id && o.bio === r.bio)) return null;
  const masked = maskName(r.bio, r);
  const same = rabbis.filter(o => o.id !== r.id && o.category === r.category);
  const others = rabbis.filter(o => o.id !== r.id && o.category !== r.category);
  const wrong = [...shuffled(same, rng), ...shuffled(others, rng)].map(o => o.name);
  return withOptions('bio', HE.PLAY_Q_BIO, r.name, wrong, rng, { body: clip(masked, 220), explain: `${r.name} · ${r.datePeriod}` });
}

function bookQ(b: PlaySource['books'][number], books: PlaySource['books'], rng: Rng): PlayQuestion | null {
  if (b.title.includes(b.author)) return null;
  const wrong = shuffled(books.filter(o => o.author !== b.author), rng).map(o => o.author);
  return withOptions('book', HE.PLAY_Q_BOOK(b.title), b.author, wrong, rng, { explain: `${b.title} — ${b.author}` });
}

function gematriaQ(g: PlaySource['gematria'][number], rng: Rng): PlayQuestion | null {
  if (calculateGematria(g.word) !== g.value || g.value < 5) return null;
  const offsets = shuffled([-30, -20, -12, -9, -6, -3, 3, 6, 9, 12, 20, 30], rng);
  const wrong = offsets.map(o => g.value + o).filter(v => v > 0).slice(0, 3);
  const q = withOptions('gematria', HE.PLAY_Q_GEMATRIA, String(g.value), wrong.map(String), rng,
    { body: g.word, explain: `${g.word} = ${g.value}` });
  if (!q) return null;
  // Numbers read best in ascending order.
  const options = [...q.options].sort((a, b) => Number(a) - Number(b));
  return { ...q, options, correct: options.indexOf(String(g.value)) };
}

/** Tries kinds of one topic until a fresh question comes out. */
function draw(topic: PlayTopic, src: PlaySource, used: Set<string>, rng: Rng): PlayQuestion | null {
  for (const kind of shuffled(KINDS[topic], rng)) {
    const pick = <T extends { id: string }>(rows: T[], make: (row: T) => PlayQuestion | null) => {
      for (const row of shuffled(rows, rng).slice(0, 40)) {
        if (used.has(row.id)) continue;
        const q = make(row);
        if (q) { used.add(row.id); return q; }
      }
      return null;
    };
    const q =
      kind === 'masechet' ? pick(src.citations, c => masechetQ(c, rng)) :
      kind === 'complete' ? pick(src.citations, c => completeQ(c, src.citations, rng)) :
      kind === 'era' ? pick(src.rabbis, r => eraQ(r, rng)) :
      kind === 'whoFirst' ? pick(src.rabbis, r => whoFirstQ(r, src.rabbis, rng)) :
      kind === 'bio' ? pick(src.rabbis, r => bioQ(r, src.rabbis, rng)) :
      kind === 'book' ? pick(src.books, b => bookQ(b, src.books, rng)) :
      pick(src.gematria, g => gematriaQ(g, rng));
    if (q) return q;
  }
  return null;
}

export function buildQuestions(src: PlaySource, topics: PlayTopic[], count: number, rng: Rng = Math.random): PlayQuestion[] {
  const out: PlayQuestion[] = [];
  const used = new Set<string>();
  let misses = 0;
  // Round-robin over a shuffled topic order so a mixed game stays mixed.
  const order = shuffled(topics, rng);
  for (let i = 0; out.length < count && misses < topics.length * 3; i++) {
    const q = draw(order[i % order.length], src, used, rng);
    if (q) { out.push(q); misses = 0; } else misses++;
  }
  // Avoid the same kind twice in a row where a later swap fixes it.
  for (let i = 1; i < out.length; i++) {
    if (out[i].kind !== out[i - 1].kind) continue;
    const j = out.findIndex((q, k) => k > i && q.kind !== out[i].kind);
    if (j > 0) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
