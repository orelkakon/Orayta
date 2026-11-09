import type { FeedItem } from '@/types';

/**
 * The `?i=<type>.<id>` of a shared post link, taken once: it is removed from
 * the address so a reload continues the normal feed instead of re-pinning it.
 */
export function takeSharedLink(): string | null {
  try {
    const url = new URL(window.location.href);
    const i = url.searchParams.get('i');
    if (!i) return null;
    url.searchParams.delete('i');
    window.history.replaceState(window.history.state, '', url.toString());
    return i;
  } catch {
    return null;
  }
}

export async function fetchSharedItem(i: string): Promise<FeedItem | null> {
  try {
    const res = await fetch(`/api/feed/item?i=${encodeURIComponent(i)}`);
    return res.ok ? await res.json() as FeedItem : null;
  } catch {
    return null;
  }
}
