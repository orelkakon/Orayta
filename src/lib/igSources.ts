/**
 * Instagram post sources for the backfill (server-only).
 *
 * 1. Graph API "Business Discovery" — official, paginated, free (200 calls/h).
 *    Used when IG_GRAPH_TOKEN + IG_GRAPH_USER_ID are set (an IG professional
 *    account linked to a Meta app). Works for business/creator target pages.
 * 2. Public profile embed (`/<user>/embed/`) — no key, but Instagram exposes
 *    only the ~6 newest posts there and no pagination.
 *
 * Instagram's private web JSON endpoints (web_profile_info, graphql/query) now
 * require a logged-in session, so they are deliberately not used.
 */
import { parseReelCode } from './instagram';
import type { IgListing, IgPost, ReelInspection } from './igBackfill';

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const FETCH_TIMEOUT_MS = 12000;

async function fetchText(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  return { status: res.status, body: await res.text() };
}

/* ── Profile embed ───────────────────────────────────────────────────── */

interface EmbedMedia {
  shortcode_media?: { shortcode?: string; is_video?: boolean; __typename?: string; pinned_for_users?: unknown[] };
}
interface EmbedContext { context?: { graphql_media?: EmbedMedia[] } }

/** Parses the `contextJSON` blob of a profile embed page into posts, newest first. */
export function parseProfileEmbed(html: string): IgPost[] | null {
  const m = /"contextJSON":"((?:[^"\\]|\\.)*)"/.exec(html);
  if (!m) return null;
  try {
    const ctx = JSON.parse(JSON.parse(`"${m[1]}"`) as string) as EmbedContext;
    const media = ctx.context?.graphql_media;
    if (!Array.isArray(media)) return null;
    return media
      .map(x => x.shortcode_media)
      .filter((n): n is NonNullable<EmbedMedia['shortcode_media']> => !!n?.shortcode)
      .map(n => ({
        code: n.shortcode as string,
        isVideo: n.is_video === true && n.__typename === 'GraphVideo',
        pinned: Array.isArray(n.pinned_for_users) && n.pinned_for_users.length > 0,
      }));
  } catch {
    return null;
  }
}

export function embedLister(username: string) {
  return async (cursor: string | null): Promise<IgListing> => {
    if (cursor) return { posts: [], nextCursor: null };
    const { status, body } = await fetchText(`https://www.instagram.com/${encodeURIComponent(username)}/embed/`);
    if (status !== 200) throw new Error(`instagram embed HTTP ${status}`);
    const posts = parseProfileEmbed(body);
    if (!posts) throw new Error('instagram embed: profile data not found (blocked or private page)');
    return { posts, nextCursor: null };
  };
}

/* ── Graph API business discovery ────────────────────────────────────── */

interface GraphMedia { permalink?: string; media_type?: string; media_product_type?: string; }
interface GraphResp {
  business_discovery?: { media?: { data?: GraphMedia[]; paging?: { cursors?: { after?: string } } } };
  error?: { message?: string; code?: number };
}

export function graphConfigured(): boolean {
  return !!(process.env.IG_GRAPH_TOKEN && process.env.IG_GRAPH_USER_ID);
}

/** Maps a Graph API media page to posts. The /media edge is chronological (no pins). */
export function parseGraphMedia(resp: GraphResp): IgListing {
  const media = resp.business_discovery?.media;
  const posts: IgPost[] = (media?.data ?? []).flatMap(item => {
    const code = item.permalink ? parseReelCode(item.permalink) : null;
    return code ? [{ code, isVideo: item.media_type === 'VIDEO', pinned: false }] : [];
  });
  const after = media?.paging?.cursors?.after;
  return { posts, nextCursor: after && posts.length > 0 ? after : null };
}

export function graphLister(username: string) {
  const version = process.env.IG_GRAPH_VERSION ?? 'v24.0';
  return async (cursor: string | null): Promise<IgListing> => {
    const after = cursor ? `.after(${cursor})` : '';
    const fields = `business_discovery.username(${username}){media.limit(25)${after}{permalink,media_type,media_product_type}}`;
    const url = `https://graph.facebook.com/${version}/${process.env.IG_GRAPH_USER_ID}`
      + `?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(process.env.IG_GRAPH_TOKEN ?? '')}`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const data = await res.json() as GraphResp;
    if (!res.ok || data.error) throw new Error(`graph api: ${data.error?.message ?? `HTTP ${res.status}`}`);
    return parseGraphMedia(data);
  };
}

/* ── Per-reel inspection (duration + inline playability) ─────────────── */

/** Reads duration and playability from a reel embed page (same rule as scripts/validate-reels.js). */
export function parseReelEmbed(status: number, html: string): ReelInspection {
  // Login walls / blocks return short pages — unverifiable, never a verdict.
  if (status !== 200 || html.length < 20000) return { durationSec: null, playable: null };
  const playable = html.includes('video_url');
  const m = /video_duration\\*"\s*:\s*([\d.]+)/.exec(html);
  return { durationSec: m ? Number(m[1]) : (playable ? null : 0), playable };
}

export async function inspectReel(code: string): Promise<ReelInspection> {
  try {
    const { status, body } = await fetchText(`https://www.instagram.com/reel/${code}/embed/captioned/`);
    return parseReelEmbed(status, body);
  } catch {
    return { durationSec: null, playable: null };
  }
}
