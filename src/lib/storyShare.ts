import type { Chidush, SikumEntry, FeedItem, Citation, Rabbi, Book, FeedGematriaData, FeedSikumData } from '@/types';
import { HE } from './hebrewTexts';
import { trackShare } from './shareCounter';
import { renderStoryImage, StoryContent } from './storyImage';

/**
 * Generates the story image and opens the NATIVE share sheet with the file
 * attached — on mobile the user taps Instagram → "הוספה לסטורי" and the
 * image is already loaded; they only add music / publish. No Instagram API.
 * Fallback (desktop / no file-share support): the PNG is downloaded so the
 * user can upload it manually.
 */
export async function shareStory(content: StoryContent): Promise<void> {
  const blob = await renderStoryImage(content);
  const file = new File([blob], 'orayta-story.png', { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: content.badge });
      trackShare();
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') downloadBlob(blob);
    }
  } else {
    trackShare();
    downloadBlob(blob);
  }
}

function downloadBlob(blob: Blob): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'orayta-story.png';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function chidushStory(c: Chidush): StoryContent {
  const source = [c.author, c.source].filter(Boolean).join(' · ');
  return { badge: HE.FEED_TYPE_CHIDUSH, text: c.text, source: source || undefined };
}

export function sikumStory(e: SikumEntry, bookName: string, bookAuthor?: string | null): StoryContent {
  return {
    badge: HE.FEED_TYPE_SIKUM,
    title: e.title ?? undefined,
    text: e.text,
    source: bookAuthor ? `${bookName} · ${bookAuthor}` : bookName,
  };
}

export function feedStory(item: FeedItem): StoryContent {
  const d = item.data;
  switch (item.type) {
    case 'citation': {
      const c = d as Citation;
      const l = c.locations[0];
      const source = l ? `${l.masechet} ${HE.STUDY_DAF} ${l.daf}${l.amud ? ` ${HE.STUDY_AMUD} ${l.amud}` : ''}` : undefined;
      return { badge: HE.FEED_TYPE_CITATION, text: `"${c.content}"`, source };
    }
    case 'rabbi': {
      const r = d as Rabbi;
      return { badge: HE.FEED_TYPE_RABBI, title: r.name, text: r.bio, source: r.datePeriod };
    }
    case 'chidush':
      return chidushStory(d as Chidush);
    case 'book': {
      const b = d as Book;
      return { badge: HE.FEED_TYPE_BOOK, text: b.title, source: `${HE.FEED_BOOK_BY} ${b.author}` };
    }
    case 'gematria': {
      const g = d as FeedGematriaData;
      return { badge: HE.FEED_TYPE_GEMATRIA, text: `${g.word} = ${g.value} ${HE.FEED_GEMATRIA_UNIT}` };
    }
    case 'sikum': {
      const s = d as FeedSikumData;
      return { badge: HE.FEED_TYPE_SIKUM, title: s.title ?? undefined, text: s.text, source: s.bookName };
    }
  }
}
