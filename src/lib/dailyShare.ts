import type { Rabbi, Citation, Chidush } from '@/types';
import { HE } from './hebrewTexts';
import { trackShare } from './shareCounter';
import { shareStory } from './storyShare';

export interface DailySikum {
  id: string; title: string | null; text: string; date: string;
  book: { name: string; author: string | null; };
}

export interface DailyShareData {
  hebrewDate: string;
  rabbi: Rabbi | null;
  citation: Citation | null;
  sikum: DailySikum | null;
  chidush: Chidush | null;
  yahrzeitNames: string[];
}

const SITE_URL = 'https://orayta-eight.vercel.app';

/**
 * WhatsApp-formatted daily digest — plain style (one emoji, *bold* markers
 * only), with the FULL text of every item. Length is fine: the message goes
 * through the native share sheet, not through a length-limited wa.me URL.
 */
export function buildDailyShareMessage(d: DailyShareData): string {
  const parts: string[] = [];

  parts.push(`📖 *${HE.DAILY_SHARE_TITLE}*${d.hebrewDate ? ` — ${d.hebrewDate}` : ''}`);

  if (d.rabbi) {
    parts.push(`*${HE.DAILY_RABBI_AND_BOOK}:* ${d.rabbi.name} (${d.rabbi.datePeriod})\n${d.rabbi.bio}`);
  }

  const loc = d.citation?.locations[0];
  if (d.citation) {
    const src = loc ? ` (${loc.masechet} ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''})` : '';
    parts.push(`*${HE.DAILY_CITATION}*${src}:\n"${d.citation.content}"`);
  }

  if (d.sikum) {
    const by = d.sikum.book.author ? ` — ${d.sikum.book.author}` : '';
    const title = d.sikum.title ? ` (${d.sikum.title})` : '';
    parts.push(`*${HE.DAILY_SIKUM}:* ${d.sikum.book.name}${by}${title}\n${d.sikum.text}`);
  }

  if (d.chidush) {
    const by = d.chidush.author ? ` ${d.chidush.author}` : '';
    const src = d.chidush.source ? ` (${d.chidush.source})` : '';
    parts.push(`*${HE.DAILY_CHIDUSH}:*${by}${src}\n${d.chidush.text}`);
  }

  if (d.yahrzeitNames.length > 0) {
    parts.push(`*${HE.YAHRZEIT_BADGE} ${HE.DAILY_SHARE_TODAY}:* ${d.yahrzeitNames.join(', ')}`);
  }

  parts.push(`${HE.DAILY_SHARE_LINK_LABEL}: ${SITE_URL}`);

  return parts.join('\n\n');
}

/**
 * Instagram-story version of the daily digest. Items are FULL text, never
 * cut mid-sentence: they fill the card in priority order (chidush →
 * citation → sikum → rabbi) and an item that doesn't fit is skipped whole.
 */
export function shareDailyToStory(d: DailyShareData): Promise<void> {
  const items: string[] = [];
  if (d.chidush) items.push(`${HE.DAILY_CHIDUSH}:\n${d.chidush.text}`);
  const loc = d.citation?.locations[0];
  if (d.citation) {
    const src = loc ? ` (${loc.masechet} ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''})` : '';
    items.push(`${HE.DAILY_CITATION}${src}:\n"${d.citation.content}"`);
  }
  if (d.sikum) items.push(`${HE.DAILY_SIKUM}: ${d.sikum.book.name}\n${d.sikum.text}`);
  if (d.rabbi) items.push(`${HE.DAILY_RABBI_AND_BOOK}: ${d.rabbi.name}\n${d.rabbi.bio}`);

  // ~600 chars is what the story card holds at its smallest font without
  // the renderer having to ellipsize (see storyImage.ts sizing).
  const BUDGET = 600;
  const parts: string[] = [];
  let used = 0;
  for (const item of items) {
    if (parts.length > 0 && used + item.length > BUDGET) continue;
    parts.push(item);
    used += item.length;
  }

  return shareStory({
    badge: HE.DAILY_SHARE_TITLE,
    title: d.hebrewDate || undefined,
    text: parts.join('\n\n'),
  });
}

/**
 * Opens WhatsApp with the message, letting the user pick a chat.
 * Same strategy as the feed share (which works everywhere): native share
 * sheet first — the user taps WhatsApp and gets its chat picker — and the
 * wa.me link only as a fallback for browsers without navigator.share.
 */
export function shareDailyToWhatsApp(d: DailyShareData): void {
  const text = buildDailyShareMessage(d);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text, title: HE.DAILY_SHARE_TITLE }).then(trackShare).catch(err => {
      if ((err as Error)?.name !== 'AbortError') {
        trackShare();
        window.open(waUrl, '_blank');
      }
    });
  } else {
    trackShare();
    window.open(waUrl, '_blank');
  }
}
