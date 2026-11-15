/**
 * UTM tags on links we share ourselves, so a visit that arrives from one can
 * be attributed even when the app sends no referrer (WhatsApp, iOS apps).
 * Pure — the rest of the URL is left byte-for-byte as it was.
 */

/** Where a share went. The native sheet and copy don't tell us the app. */
export type ShareChannel = 'whatsapp' | 'telegram' | 'instagram' | 'native' | 'copy';

/** utm_campaign values — the section the link was shared from. */
export type ShareCampaign =
  | 'feed' | 'tehillim' | 'play' | 'about' | 'ask' | 'today' | 'shabbat'
  | 'sikumim' | 'chidushim' | 'stories';

const NAMED: ReadonlySet<ShareChannel> = new Set<ShareChannel>(['whatsapp', 'telegram', 'instagram']);

export function withShareUtm(url: string, campaign: ShareCampaign, channel: ShareChannel): string {
  const hashAt = url.indexOf('#');
  const base = hashAt < 0 ? url : url.slice(0, hashAt);
  const hash = hashAt < 0 ? '' : url.slice(hashAt);
  const tags = [
    ...(NAMED.has(channel) ? [`utm_source=${channel}`] : []),
    'utm_medium=share',
    `utm_campaign=${campaign}`,
  ].join('&');
  const sep = base.includes('?') ? (base.endsWith('?') || base.endsWith('&') ? '' : '&') : '?';
  return `${base}${sep}${tags}${hash}`;
}

const UTM_PARAM = /^utm_(source|medium|campaign|term|content)$/;

/** The same URL without utm_* parameters (for cleaning the address bar). */
export function stripUtm(url: URL): URL | null {
  const keys = Array.from(url.searchParams.keys()).filter(k => UTM_PARAM.test(k));
  if (!keys.length) return null;
  const next = new URL(url.toString());
  keys.forEach(k => next.searchParams.delete(k));
  return next;
}
