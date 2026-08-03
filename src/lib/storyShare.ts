import type { Chidush, SikumEntry, FeedItem, Citation, Rabbi, Book, FeedGematriaData, FeedSikumData } from '@/types';
import { HE } from './hebrewTexts';
import { trackShare } from './shareCounter';
import { renderStoryImage, StoryContent } from './storyImage';
import { renderStoryTemplate } from './storyTemplate';
import { SITE_URL } from './siteUrl';

/**
 * Generates the story image and opens the NATIVE share sheet with the file
 * attached — on mobile the user taps Instagram → "הוספה לסטורי" and the
 * image is already loaded; they only add music / publish. No Instagram API.
 * Fallback (desktop / no file-share support): the PNG is downloaded so the
 * user can upload it manually.
 */
/**
 * Instagram can't receive a clickable link with a shared image, so the site
 * URL is pre-copied for pasting inside Instagram. Must run synchronously in
 * the click gesture — mobile browsers reject clipboard writes after an await.
 */
function copySiteUrl(): void {
  try {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(SITE_URL).catch(() => copySiteUrlLegacy());
    } else {
      copySiteUrlLegacy();
    }
  } catch { /* non-blocking */ }
}

function copySiteUrlLegacy(): void {
  const ta = document.createElement('textarea');
  ta.value = SITE_URL;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch { /* non-blocking */ }
  ta.remove();
}

export async function shareStory(content: StoryContent): Promise<void> {
  copySiteUrl();
  const blob = await renderStoryImage(content);
  await shareImageBlob(blob, content.badge);
}

/** The empty branded story template — for composing posts inside Instagram. */
export async function shareTemplateStory(): Promise<void> {
  copySiteUrl();
  const blob = await renderStoryTemplate();
  await shareImageBlob(blob, HE.ABOUT_TEMPLATE_BTN);
}

async function shareImageBlob(blob: Blob, title: string): Promise<void> {
  const file = new File([blob], 'orayta-story.png', { type: 'image/png' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      trackShare('story');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') downloadBlob(blob);
    }
  } else {
    trackShare('story');
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

/* Per-type accent triplets — kept in sync with FEED_TYPE_STYLES in
   components/FeedView/feedTypes.ts so a shared card carries the same color
   signature as the slide it came from. */
const STORY_ACCENTS: Record<FeedItem['type'], string> = {
  citation: '232,203,118',
  rabbi: '226,168,98',
  book: '124,212,156',
  chidush: '255,158,84',
  gematria: '148,158,255',
  sikum: '214,150,244',
};

/** Streak celebration card — shared from the daily seal moment. */
export function sealStory(days: number): StoryContent {
  return {
    badge: HE.FEED_SEAL_KICKER,
    title: days > 1 ? HE.FEED_SEAL_STREAK(days) : undefined,
    text: HE.FEED_SEAL_TITLE,
  };
}

export function feedStory(item: FeedItem): StoryContent {
  const base = feedStoryBase(item);
  return { ...base, accent: STORY_ACCENTS[item.type] };
}

function feedStoryBase(item: FeedItem): StoryContent {
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
