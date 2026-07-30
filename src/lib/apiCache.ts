import { NextResponse } from 'next/server';

/**
 * Cache headers for public, read-only collections that only an admin can change
 * (rabbis, books, gematria, chidushim, sikum books).
 *
 * The CDN serves a cached copy for `sMaxAge` seconds and may keep serving the
 * stale copy for `staleWhileRevalidate` seconds while it refreshes in the
 * background — so an admin edit becomes visible within about a minute rather
 * than instantly. That trade buys a large reduction in database round-trips,
 * since these lists are otherwise re-queried in full for every visitor.
 */
export function cachedJson<T>(
  data: T,
  { sMaxAge = 60, staleWhileRevalidate = 300 } = {},
): NextResponse {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}
