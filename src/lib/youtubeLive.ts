import { prisma } from '@/lib/db';
import type { LiveSnapshot, LiveStream } from '@/types';

/**
 * "Live Torah" detection — no YouTube API key. Each channel's public
 * youtube.com/channel/<id>/live page says whether a stream is on the air
 * (canonical watch link + "isLive":true). Results are cached in AppConfig so
 * concurrent visitors share one sweep instead of each hitting YouTube.
 */

const SNAPSHOT_KEY = 'live_snapshot';
const SNAPSHOT_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 6_000;

/* A desktop UA + pre-accepted consent cookie keep YouTube serving the plain
   HTML page instead of a consent interstitial. */
const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'Accept-Language': 'en',
  Cookie: 'CONSENT=YES+cb; SOCS=CAI',
};

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: YT_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: 'no-store',
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/** Normalize any accepted admin input (handle URL, channel URL, @handle, bare id) to a fetchable URL. */
export function channelInputToUrl(input: string): string | null {
  const t = input.trim();
  if (/^UC[\w-]{22}$/.test(t)) return `https://www.youtube.com/channel/${t}`;
  if (/^@[^\s/]+$/.test(t)) return `https://www.youtube.com/${t}`;
  const m = /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(@[^\s/?]+|channel\/UC[\w-]{22}|c\/[^\s/?]+|user\/[^\s/?]+)/.exec(t);
  return m ? `https://www.youtube.com/${m[1]}` : null;
}

/** Resolve a channel URL/handle to its canonical id + display name (scraped, no API). */
export async function resolveChannel(
  input: string,
): Promise<{ channelId: string; name: string; url: string } | null> {
  const url = channelInputToUrl(input);
  if (!url) return null;
  const html = await fetchPage(url);
  if (!html) return null;
  const id =
    /"externalId":"(UC[\w-]{22})"/.exec(html)?.[1] ??
    /rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/.exec(html)?.[1];
  if (!id) return null;
  const rawTitle = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? id;
  const name = decodeEntities(rawTitle).replace(/\s*-\s*YouTube\s*$/, '').trim() || id;
  return { channelId: id, name, url };
}

/** Check one channel's /live page; null when nothing is on the air. */
export async function fetchLiveStream(
  channelId: string,
  channelName: string,
): Promise<LiveStream | null> {
  const html = await fetchPage(`https://www.youtube.com/channel/${channelId}/live?hl=en`);
  if (!html) return null;
  // Marker choice is constrained by what YouTube serves datacenter IPs: the
  // live watch page keeps "isLive":true (viewer counter) but may ship
  // canonical="undefined" and omit videoDetails. Waiting rooms carry
  // "isUpcoming":true; an offline channel page has no "isLive":true at all.
  if (!html.includes('"isLive":true') || html.includes('"isUpcoming":true')) return null;
  const videoId =
    /rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/.exec(html)?.[1] ??
    /"currentVideoEndpoint":.{0,300}?"videoId":"([\w-]{11})"/.exec(html)?.[1];
  if (!videoId) return null;
  const rawTitle =
    /<meta name="title" content="([^"]*)"/.exec(html)?.[1] ??
    /property="og:title" content="([^"]*)"/.exec(html)?.[1];
  return {
    channelId,
    channelName,
    videoId,
    title: rawTitle ? decodeEntities(rawTitle) : channelName,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault_live.jpg`,
  };
}

async function sweep(): Promise<LiveStream[]> {
  const channels = await prisma.liveChannel.findMany({ where: { active: true } });
  const results = await Promise.allSettled(
    channels.map(c => fetchLiveStream(c.channelId, c.name)),
  );
  return results
    .map(r => (r.status === 'fulfilled' ? r.value : null))
    .filter((s): s is LiveStream => s !== null);
}

/** Cached liveness snapshot; refreshes at most once per TTL across all visitors. */
export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  const row = await prisma.appConfig.findUnique({ where: { key: SNAPSHOT_KEY } });
  if (row) {
    try {
      const cached = JSON.parse(row.value) as LiveSnapshot;
      if (Date.now() - cached.checkedAt < SNAPSHOT_TTL_MS) return cached;
    } catch { /* corrupt cache — fall through to refresh */ }
  }
  const snapshot: LiveSnapshot = { checkedAt: Date.now(), streams: await sweep() };
  await prisma.appConfig.upsert({
    where: { key: SNAPSHOT_KEY },
    update: { value: JSON.stringify(snapshot) },
    create: { key: SNAPSHOT_KEY, value: JSON.stringify(snapshot) },
  });
  return snapshot;
}

/** Drop the cached snapshot (after admin edits the channel list). */
export async function invalidateLiveSnapshot(): Promise<void> {
  await prisma.appConfig.deleteMany({ where: { key: SNAPSHOT_KEY } });
}

/** TEMP diagnostics: what does YouTube serve this host for each channel? */
export async function debugProbe(): Promise<unknown[]> {
  const channels = await prisma.liveChannel.findMany({ where: { active: true } });
  return Promise.all(channels.map(async c => {
    try {
      const res = await fetch(`https://www.youtube.com/channel/${c.channelId}/live?hl=en`, {
        headers: YT_HEADERS, redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store',
      });
      const html = res.ok ? await res.text() : '';
      return {
        name: c.name, status: res.status, finalUrl: res.url, length: html.length,
        canonical: /rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? null,
        currentVideo: /"currentVideoEndpoint":.{0,300}?"videoId":"([\w-]{11})"/.exec(html)?.[1] ?? null,
        metaTitle: /<meta name="title" content="([^"]{0,80})/.exec(html)?.[1] ?? null,
        anyIsLive: html.includes('"isLive":true'),
        upcoming: html.includes('"isUpcoming":true'),
      };
    } catch (e) {
      return { name: c.name, error: String(e) };
    }
  }));
}
