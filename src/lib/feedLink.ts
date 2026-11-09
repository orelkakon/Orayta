import type { FeedItemType } from '@/types';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * A link that opens the feed on one item (`/feed?i=<type>.<id>`), so a shared
 * post previews as itself and lands on itself. Pure — used on both sides.
 */
export const FEED_TYPES: readonly FeedItemType[] = ['citation', 'rabbi', 'book', 'chidush', 'gematria', 'sikum'];

export const feedItemUrl = (type: FeedItemType, id: string) => `${SITE_URL}/feed?i=${type}.${id}`;

export function parseFeedLink(v: unknown): { type: FeedItemType; id: string } | null {
  if (typeof v !== 'string') return null;
  const m = /^([a-z]+)\.([\w-]{1,40})$/.exec(v);
  if (!m || !FEED_TYPES.includes(m[1] as FeedItemType)) return null;
  return { type: m[1] as FeedItemType, id: m[2] };
}
