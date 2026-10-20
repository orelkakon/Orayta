import type { AmudRef, TalmudSegment } from '@/types/talmudContext';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { parseSefariaRef, sefariaRef } from './tractates';

// The Bavli text never changes in practice — keep each amud in Next's data
// cache for a month.
const TEXT_TTL = 30 * 24 * 3600;
const ARAMAIC = 'William Davidson Edition - Vocalized Aramaic';
const STEINSALTZ = 'William Davidson Edition - Hebrew';
const API = 'https://www.sefaria.org/api/v3/texts/';

interface V3Version { versionTitle?: string; text?: unknown }
interface V3Response { versions?: V3Version[]; next?: string | null; prev?: string | null; error?: string }

export type AmudFetch =
  | { ok: true; segments: TalmudSegment[]; prev: AmudRef | null; next: AmudRef | null }
  | { ok: false; reason: 'not_found' | 'upstream' };

function urlFor(ref: string, version: string): string {
  const path = ref.replace(/ /g, '_');
  return `${API}${encodeURIComponent(path)}?version=${encodeURIComponent(`hebrew|${version}`)}`;
}

/** Footnote markers + their bodies would read as stray text once tags are stripped. */
function clean(html: string): string {
  const noNotes = html
    .replace(/<sup[^>]*class="footnote-marker"[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/gi, '');
  return sanitizeSiddurHtml(noNotes);
}

function textOf(data: V3Response, version: string): string[] | null {
  const v = data.versions?.find(x => x.versionTitle === version) ?? data.versions?.[0];
  if (!v || !Array.isArray(v.text)) return null;
  return v.text.map(s => (typeof s === 'string' ? clean(s) : ''));
}

async function getJson(url: string): Promise<{ status: number; data: V3Response | null }> {
  try {
    const res = await fetch(url, { next: { revalidate: TEXT_TTL } });
    const data = await res.json().catch(() => null) as V3Response | null;
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

/** Sefaria's prev/next can cross into a neighbouring tractate — stay inside this one. */
function sameTractate(tractate: string, ref: string | null | undefined): AmudRef | null {
  return ref && ref.startsWith(`${tractate} `) ? parseSefariaRef(ref) : null;
}

/** One amud: Aramaic segments with their aligned Steinsaltz explanation (empty if missing). */
export async function fetchAmud(tractate: string, at: AmudRef): Promise<AmudFetch> {
  const ref = sefariaRef(tractate, at);
  const [main, expl] = await Promise.all([
    getJson(urlFor(ref, ARAMAIC)),
    getJson(urlFor(`Steinsaltz on ${ref}`, STEINSALTZ)),
  ]);
  if (main.status === 404 || main.status === 400 || main.data?.error) return { ok: false, reason: 'not_found' };
  if (main.status !== 200 || !main.data) return { ok: false, reason: 'upstream' };

  const he = textOf(main.data, ARAMAIC);
  if (!he || he.length === 0) return { ok: false, reason: 'not_found' };
  const ex = (expl.status === 200 && expl.data && textOf(expl.data, STEINSALTZ)) || [];

  return {
    ok: true,
    segments: he.map((h, i) => ({ he: h, ex: ex.length === he.length ? ex[i] : '' })),
    prev: sameTractate(tractate, main.data.prev),
    next: sameTractate(tractate, main.data.next),
  };
}

export function sefariaPageUrl(tractate: string, at: AmudRef): string {
  return `https://www.sefaria.org/${sefariaRef(tractate, at).replace(/ /g, '_')}?lang=he`;
}
