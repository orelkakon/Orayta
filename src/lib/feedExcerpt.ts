import type { Book, Chidush, Citation, FeedGematriaData, FeedItem, FeedSikumData, Rabbi } from '@/types';
import { HE } from '@/lib/hebrewTexts';

export interface FeedExcerpt {
  title?: string;
  text: string;
  image?: string | null;
}

/** A short, display-ready summary of a feed item (home teaser cards). */
export function feedExcerpt(item: FeedItem): FeedExcerpt {
  switch (item.type) {
    case 'citation': {
      const d = item.data as Citation;
      const l = d.locations[0];
      return { title: l ? HE.HOME_FEED_DAF(l.masechet, l.daf, l.amud ?? null) : undefined, text: d.content };
    }
    case 'rabbi': {
      const d = item.data as Rabbi;
      return { title: d.name, text: d.bio, image: d.imageUrl ?? null };
    }
    case 'book': {
      const d = item.data as Book;
      return { title: d.title, text: HE.HOME_FEED_BOOK_BY(d.author) };
    }
    case 'chidush': {
      const d = item.data as Chidush;
      return { title: d.source ?? undefined, text: d.text };
    }
    case 'gematria': {
      const d = item.data as FeedGematriaData;
      return { title: d.word, text: HE.HOME_FEED_GEMATRIA(d.value) };
    }
    case 'sikum': {
      const d = item.data as FeedSikumData;
      return { title: d.title || d.bookName, text: d.text };
    }
  }
}

/** Hand-off from a home teaser card: the feed opens on this exact item. */
export const FEED_START_KEY = 'orayta_feed_start';

export function stashFeedStart(item: FeedItem): void {
  try { sessionStorage.setItem(FEED_START_KEY, JSON.stringify(item)); } catch {}
}

export function takeFeedStart(): FeedItem | null {
  try {
    const raw = sessionStorage.getItem(FEED_START_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FEED_START_KEY);
    const parsed = JSON.parse(raw) as FeedItem;
    return parsed && typeof parsed.type === 'string' && typeof parsed.id === 'string' ? parsed : null;
  } catch {
    return null;
  }
}
