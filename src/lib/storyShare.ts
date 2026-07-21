import type { Chidush, SikumEntry, FeedItem, Citation, Rabbi, Book, FeedGematriaData, FeedSikumData } from '@/types';
import { HE } from './hebrewTexts';
import { trackShare } from './shareCounter';
import { renderStoryImage, StoryContent } from './storyImage';

const SITE_URL = 'https://orayta-eight.vercel.app';

/**
 * Generates the story image and opens the NATIVE share sheet with the file
 * attached — on mobile the user taps Instagram → "הוספה לסטורי" and the
 * image is already loaded; they only add music / publish. No Instagram API.
 * Fallback (desktop / no file-share support): the PNG is downloaded so the
 * user can upload it manually.
 */
export async function shareStory(content: StoryContent): Promise<void> {
  // Instagram can't receive a clickable link with a shared image — the user
  // adds it via the Link sticker. Pre-copy the URL so it's one paste away.
  try { await navigator.clipboard?.writeText(SITE_URL); } catch { /* non-blocking */ }
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

/** Promotional story inviting people to the site (שתף את אורייתא). */
export function inviteStory(): StoryContent {
  return { badge: HE.STORY_INVITE_BADGE, title: HE.STORY_INVITE_TITLE, text: HE.STORY_INVITE_TEXT };
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
