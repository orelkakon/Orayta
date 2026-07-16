import type { Rabbi, Citation, Chidush } from '@/types';
import { HE } from './hebrewTexts';

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
 * Opens WhatsApp with the message, letting the user pick a chat.
 * Same strategy as the feed share (which works everywhere): native share
 * sheet first — the user taps WhatsApp and gets its chat picker — and the
 * wa.me link only as a fallback for browsers without navigator.share.
 */
export function shareDailyToWhatsApp(d: DailyShareData): void {
  const text = buildDailyShareMessage(d);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text, title: HE.DAILY_SHARE_TITLE }).catch(err => {
      if ((err as Error)?.name !== 'AbortError') window.open(waUrl, '_blank');
    });
  } else {
    window.open(waUrl, '_blank');
  }
}
