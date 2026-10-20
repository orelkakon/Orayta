import type { PlayQuestion, PlayQuestionKind, PlaySettings } from '@/types/play';
import { MASECHTOT } from '@/lib/hebrewData';
import { completeQ, dafQ, masechetQ, sederQ, type SrcCitation } from './buildTalmud';
import { bioQ, eraQ, imageQ, knowledgeQ, whoQ, type SrcRabbi } from './buildRabbis';
import { bookOfQ, bookQ, gematriaQ, gematriaWordQ, type SrcBook, type SrcGematria } from './buildMisc';
import { shuffled, type Rng } from './util';

/**
 * Builds a frozen question set for one game from plain rows (no I/O —
 * tested). Honors the host's question types, Talmud scope, eras and level;
 * the same row is never asked twice, and builders return null rather than an
 * ambiguous question.
 */
export interface PlaySource {
  citations: SrcCitation[];
  rabbis: SrcRabbi[];
  books: (SrcBook & { rabbiId: string | null })[];
  gematria: SrcGematria[];
}

type Settings = Pick<PlaySettings, 'kinds' | 'count' | 'level' | 'seder' | 'masechet' | 'eras'>;

/** Rows the chosen eras allow; books follow their author's era. */
export function scopeSource(src: PlaySource, s: Settings): PlaySource {
  if (!s.eras?.length) return src;
  const eras = new Set(s.eras);
  const rabbis = src.rabbis.filter(r => eras.has(r.category));
  const ids = new Set(rabbis.map(r => r.id));
  const names = new Set(rabbis.map(r => r.name));
  const books = src.books.filter(b => (b.rabbiId ? ids.has(b.rabbiId) : names.has(b.author)));
  return { ...src, rabbis, books };
}

/** Kinds that can't make sense under the current filters are dropped. */
function usableKinds(s: Settings): PlayQuestionKind[] {
  return s.kinds.filter(k => {
    if (k === 'seder') return !s.seder && !s.masechet; // the answer would always be the same seder
    if (k === 'masechet') return !s.masechet;
    if (k === 'era') return !s.eras || s.eras.length !== 1;
    return true;
  });
}

function make(kind: PlayQuestionKind, src: PlaySource, s: Settings, used: Set<string>, rng: Rng): PlayQuestion | null {
  // Not named `pick`: Next 13.5's minifier confused a local `pick` here with
  // knowledgeQuiz's module-level `pick` (prod-only TypeError).
  const firstFresh = <T extends { id: string }>(rows: T[], build: (row: T) => PlayQuestion | null) => {
    for (const row of shuffled(rows, rng).slice(0, 40)) {
      if (used.has(row.id)) continue;
      const q = build(row);
      if (q) { used.add(row.id); return q; }
    }
    return null;
  };
  const { citations: cs, rabbis: rs, books: bs, gematria: gs } = src;
  const lv = s.level;
  switch (kind) {
    case 'masechet': return firstFresh(cs, c => masechetQ(c, lv, rng));
    case 'daf': return firstFresh(cs, c => dafQ(c, lv, rng));
    case 'complete': return firstFresh(cs, c => completeQ(c, cs, rng));
    case 'seder': return firstFresh(MASECHTOT.map(m => ({ ...m, id: `m:${m.name}` })), m => sederQ(m, rng));
    case 'era': return firstFresh(rs, r => eraQ(r, lv, rng));
    case 'whoFirst':
    case 'whoLast': return firstFresh(rs, r => whoQ(kind, r, rs, lv, rng));
    case 'bio': return firstFresh(rs, r => bioQ(r, rs, lv, rng));
    case 'image': return firstFresh(rs, r => imageQ(r, rs, lv, rng));
    case 'book': return firstFresh(bs, b => bookQ(b, bs.length >= 4 ? bs : src.books, rng));
    case 'bookOf': return firstFresh(bs, b => bookOfQ(b, src.books, rng));
    case 'gematria': return firstFresh(gs, g => gematriaQ(g, lv, rng));
    case 'gematriaWord': return firstFresh(gs, g => gematriaWordQ(g, gs, lv, rng));
    default: return knowledgeQ(kind, rs, used, rng);
  }
}

export function buildQuestions(full: PlaySource, s: Settings, rng: Rng = Math.random): PlayQuestion[] {
  const src = scopeSource(full, s);
  let kinds = usableKinds(s);
  const out: PlayQuestion[] = [];
  const used = new Set<string>();
  const misses = new Map<PlayQuestionKind, number>();
  // Cycle through every chosen type before repeating one, so a game stays varied.
  let deck: PlayQuestionKind[] = [];
  while (out.length < s.count && kinds.length > 0) {
    if (deck.length === 0) deck = shuffled(kinds, rng);
    const kind = deck.pop()!;
    const q = make(kind, src, s, used, rng);
    if (q) { out.push(q); misses.set(kind, 0); continue; }
    const m = (misses.get(kind) ?? 0) + 1;
    misses.set(kind, m);
    if (m >= 2) kinds = kinds.filter(k => k !== kind); // this type has run dry
  }
  // Avoid the same type twice in a row where a later swap fixes it.
  for (let i = 1; i < out.length; i++) {
    if (out[i].kind !== out[i - 1].kind) continue;
    const j = out.findIndex((q, k) => k > i && q.kind !== out[i].kind);
    if (j > 0) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
