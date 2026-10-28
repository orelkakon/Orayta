import { stripHtml } from './text';

// Server-only: Hebrew Wikisource (CC BY-SA) — books Sefaria lacks and a
// search that copes better with plain-language questions. MediaWiki API, no key.
const API = 'https://he.wikisource.org/w/api.php';
const TEXT_TTL = 7 * 24 * 3600;
const TIMEOUT_MS = 8000;
const HEADERS = { 'User-Agent': 'Orayta/1.0 (https://orayta-eight.vercel.app)' };

export interface WikiPage {
  title: string;
  url: string;
  paragraphs: string[];
}

async function api<T>(params: Record<string, string>, ttl?: number): Promise<T | null> {
  const u = new URL(API);
  Object.entries({ ...params, format: 'json', formatversion: '2' }).forEach(([k, v]) => u.searchParams.set(k, v));
  try {
    const res = await fetch(u, {
      headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(ttl ? { next: { revalidate: ttl } } : { cache: 'no-store' }),
    } as RequestInit);
    return res.ok ? await res.json() as T : null;
  } catch {
    return null;
  }
}

export const wikiUrl = (title: string) => `https://he.wikisource.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** Main-namespace page titles matching `query`, best first. */
export async function searchTitles(query: string, limit: number): Promise<string[]> {
  const d = await api<{ query?: { search?: { title: string }[] } }>({
    action: 'query', list: 'search', srsearch: query, srlimit: String(limit), srnamespace: '0', srprop: '',
  });
  return (d?.query?.search ?? []).map(s => s.title);
}

/** A page's plain text, split into paragraphs (navigation lines dropped). */
export async function fetchPage(title: string): Promise<WikiPage | null> {
  const d = await api<{ query?: { pages?: { title: string; extract?: string; missing?: boolean }[] } }>({
    action: 'query', prop: 'extracts', explaintext: '1', titles: title,
  }, TEXT_TTL);
  const page = d?.query?.pages?.[0];
  if (!page?.extract || page.missing) return null;
  const paragraphs = page.extract
    .split(/\n+/)
    .map(p => stripHtml(p.replace(/^=+\s*|\s*=+$/g, '')))
    .filter(p => p.length > 40 && !/^(<<|·)/.test(p));
  return paragraphs.length ? { title: page.title, url: wikiUrl(page.title), paragraphs } : null;
}
