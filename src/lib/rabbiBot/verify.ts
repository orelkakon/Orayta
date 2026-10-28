import type {
  RabbiBotAnswer, RabbiBotPassage, RabbiBotPoint, RabbiBotSource, RabbiBotTopic, RabbiBotView,
} from '@/types/rabbiBot';
import { findQuote } from './text';

/** What the answering model returns (parsed JSON, untrusted). */
export interface RawAnswer {
  status?: unknown;
  short?: unknown;
  dispute?: unknown;
  points?: unknown;
}

interface RawCite { id?: unknown; quote?: unknown }
interface RawPoint { text?: unknown; view?: unknown; cites?: unknown; derived?: unknown }

const VIEWS: RabbiBotView[] = ['main', 'ashkenaz', 'note'];
const MAX_POINTS = 8;
const MAX_CITES = 4;
const MIN_POINT_CHARS = 15;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * The accuracy gate. Every point must cite at least one retrieved passage with
 * a quote that is really in it (see findQuote); points that don't are dropped —
 * a derived conclusion is dropped if any one of its premises fails —
 * and the quotes shown are the source's own words. With nothing left, the
 * answer becomes "not found" — the model's prose never stands on its own.
 */
export function verifyAnswer(raw: RawAnswer, passages: RabbiBotPassage[], topic: RabbiBotTopic): RabbiBotAnswer {
  const byId = new Map(passages.map(p => [p.id, p]));
  const sources: RabbiBotSource[] = [];
  const sourceIndex = new Map<string, number>();
  const rawPoints = Array.isArray(raw.points) ? (raw.points as RawPoint[]).slice(0, MAX_POINTS) : [];

  const points: RabbiBotPoint[] = [];
  for (const rp of rawPoints) {
    const text = str(rp?.text, 600);
    if (text.length < MIN_POINT_CHARS) continue;
    const view = VIEWS.includes(rp.view as RabbiBotView) ? rp.view as RabbiBotView : 'main';
    const cites = (Array.isArray(rp.cites) ? rp.cites as RawCite[] : []).slice(0, MAX_CITES).flatMap(c => {
      const p = typeof c?.id === 'string' ? byId.get(c.id.trim()) : undefined;
      const quote = p ? findQuote(p.text, str(c.quote, 400)) : null;
      if (!p || !quote) return [];
      if (!sourceIndex.has(p.id)) {
        sourceIndex.set(p.id, sources.length);
        sources.push({ heRef: p.heRef, book: p.book, url: p.url, text: p.text, origin: p.origin });
      }
      return [{ source: sourceIndex.get(p.id) as number, quote }];
    });
    // A derived conclusion stands on its premises, so it needs every one of them verified.
    const derived = rp.derived === true;
    const wanted = Array.isArray(rp.cites) ? Math.min(rp.cites.length, MAX_CITES) : 0;
    if (cites.length === 0 || (derived && cites.length < wanted)) continue;
    points.push(derived ? { text, view, cites, derived } : { text, view, cites });
  }

  const found = raw.status !== 'not_found' && points.length > 0;
  return {
    status: found ? 'answered' : 'not_found',
    short: found ? str(raw.short, 500) : '',
    points: found ? points : [],
    sources: found ? sources : [],
    dispute: found && (raw.dispute === true || points.some(p => p.view === 'ashkenaz')),
    topic,
    total: rawPoints.length,
    verified: points.length,
  };
}

/** A fixed reply that needs no sources (sensitive / off-topic questions). */
export function fixedAnswer(status: 'sensitive' | 'other', topic: RabbiBotTopic): RabbiBotAnswer {
  return { status, short: '', points: [], sources: [], dispute: false, topic, total: 0, verified: 0 };
}

/** Distinct books cited — kept for statistics after the text itself is purged. */
export function citedBooks(a: RabbiBotAnswer): string[] {
  return Array.from(new Set(a.sources.map(s => s.book))).slice(0, 12);
}
