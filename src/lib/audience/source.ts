/**
 * Traffic-source classification — pure, shared by the client (which only
 * reduces the referrer to a hostname) and the server (which classifies).
 * Nothing here ever sees a full URL, a path or a query string of the referrer.
 */

export const TRAFFIC_SOURCES = [
  'instagram', 'whatsapp', 'telegram', 'facebook', 'google', 'other-search', 'direct', 'internal', 'other',
] as const;
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];

/** Hostname suffixes per bucket. Android apps send `android-app://<package>`,
 *  whose hostname is the package name — listed alongside the web domains. */
const HOSTS: [TrafficSource, string[]][] = [
  ['instagram', ['instagram.com', 'cdninstagram.com', 'com.instagram.android', 'com.instagram.barcelona']],
  ['whatsapp', ['wa.me', 'whatsapp.com', 'whatsapp.net', 'com.whatsapp', 'com.whatsapp.w4b']],
  ['telegram', ['t.me', 'telegram.me', 'telegram.org', 'telegram.dog', 'org.telegram.messenger', 'org.telegram.plus', 'org.thunderdog.challegram']],
  ['facebook', ['facebook.com', 'fb.com', 'fb.me', 'messenger.com', 'com.facebook.katana', 'com.facebook.orca', 'com.facebook.lite']],
  ['google', ['com.google.android.googlequicksearchbox']],
  ['other-search', [
    'bing.com', 'duckduckgo.com', 'search.yahoo.com', 'yahoo.com', 'ecosia.org', 'baidu.com', 'search.brave.com',
    'startpage.com', 'qwant.com', 'yandex.com', 'yandex.ru', 'naver.com', 'perplexity.ai', 'com.microsoft.bing',
  ]],
];

/** google.com, google.co.il, news.google.com … but not Gmail or Docs. */
const GOOGLE = /(^|\.)google\.(com|[a-z]{2}|com?\.[a-z]{2})$/;
const GOOGLE_NOT_SEARCH = /^(mail|docs|drive|calendar|accounts|meet|chat)\.google\./;

/** utm_source aliases → bucket (our own share links use the first of each). */
const UTM_ALIASES: Record<string, TrafficSource> = {
  instagram: 'instagram', ig: 'instagram',
  whatsapp: 'whatsapp', wa: 'whatsapp',
  telegram: 'telegram', tg: 'telegram',
  facebook: 'facebook', fb: 'facebook',
  google: 'google',
  bing: 'other-search', duckduckgo: 'other-search', yahoo: 'other-search',
};

const HOST_RE = /^[a-z0-9.-]{1,253}$/;

/** Lowercased hostname without `www.`; '' for anything that isn't one. */
export function cleanHost(v: unknown): string {
  if (typeof v !== 'string') return '';
  const h = v.trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  return HOST_RE.test(h) && h.includes('.') ? h : '';
}

/** A referrer reduced to its hostname ('' when absent or unparsable). */
export function referrerHost(referrer: string): string {
  if (!referrer) return '';
  try { return cleanHost(new URL(referrer).hostname); } catch { return ''; }
}

/** A UTM value as stored: lowercase, [a-z0-9._-], ≤40 chars; '' otherwise. */
export function cleanUtm(v: unknown): string {
  if (typeof v !== 'string') return '';
  const s = v.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '').slice(0, 40);
  return s;
}

/** The utm_source stored: our own native-sheet / copy shares carry only
 *  utm_medium=share, so they're kept apart as 'share'. */
export function storedUtmSource(source: unknown, medium: unknown): string {
  return cleanUtm(source) || (cleanUtm(medium) === 'share' ? 'share' : '');
}

const matches = (host: string, suffix: string) => host === suffix || host.endsWith(`.${suffix}`);

function bucketOfHost(host: string): TrafficSource {
  if (GOOGLE.test(host)) return GOOGLE_NOT_SEARCH.test(host) ? 'other' : 'google';
  for (const [bucket, list] of HOSTS) if (list.some(s => matches(host, s))) return bucket;
  return 'other';
}

export interface SourceInput {
  host: string;      // referrer hostname, already cleaned ('' = none)
  ownHost: string;   // the site's own host, from the request
  utmSource: string; // cleaned
}

/**
 * A known utm_source wins (our share links say where they were sent);
 * otherwise the referrer decides. No referrer: direct, unless an unknown
 * utm_source marks a campaign link (newsletter, poster…) → other. A share
 * whose app isn't known ('share') with no referrer stays direct.
 */
export function classifySource({ host, ownHost, utmSource }: SourceInput): TrafficSource {
  const alias = UTM_ALIASES[utmSource];
  if (alias) return alias;
  const own = cleanHost(ownHost.split(':')[0]);
  if (host && own && host === own) return 'internal';
  if (host) return bucketOfHost(host);
  return utmSource && utmSource !== 'share' ? 'other' : 'direct';
}
