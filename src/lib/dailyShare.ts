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

const clip = (s: string, max = 130) =>
  s.length > max ? `${s.slice(0, max).trimEnd()}...` : s;

/**
 * WhatsApp-formatted daily digest. Kept intentionally plain:
 * short, one emoji, *bold* markers only — long/emoji-heavy texts
 * break the wa.me URL and WhatsApp then opens without the message.
 */
export function buildDailyShareMessage(d: DailyShareData): string {
  const parts: string[] = [];

  parts.push(`📖 *${HE.DAILY_SHARE_TITLE}*${d.hebrewDate ? ` — ${d.hebrewDate}` : ''}`);

  if (d.rabbi) {
    parts.push(`*${HE.DAILY_RABBI_AND_BOOK}:* ${d.rabbi.name} (${d.rabbi.datePeriod})\n${clip(d.rabbi.bio)}`);
  }

  const loc = d.citation?.locations[0];
  if (d.citation) {
    const src = loc ? ` (${loc.masechet} ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''})` : '';
    parts.push(`*${HE.DAILY_CITATION}*${src}:\n"${clip(d.citation.content)}"`);
  }

  if (d.sikum) {
    const by = d.sikum.book.author ? ` — ${d.sikum.book.author}` : '';
    const title = d.sikum.title ? ` (${d.sikum.title})` : '';
    parts.push(`*${HE.DAILY_SIKUM}:* ${d.sikum.book.name}${by}${title}\n${clip(d.sikum.text)}`);
  }

  if (d.chidush) {
    const by = d.chidush.author ? ` ${d.chidush.author}` : '';
    const src = d.chidush.source ? ` (${d.chidush.source})` : '';
    parts.push(`*${HE.DAILY_CHIDUSH}:*${by}${src}\n${clip(d.chidush.text)}`);
  }

  if (d.yahrzeitNames.length > 0) {
    parts.push(`*${HE.YAHRZEIT_BADGE} ${HE.DAILY_SHARE_TODAY}:* ${d.yahrzeitNames.join(', ')}`);
  }

  parts.push(`${HE.DAILY_SHARE_LINK_LABEL}: ${SITE_URL}`);

  return parts.join('\n\n');
}

/** Opens WhatsApp with the message, letting the user pick a chat. */
export function shareDailyToWhatsApp(d: DailyShareData): void {
  const url = `https://wa.me/?text=${encodeURIComponent(buildDailyShareMessage(d))}`;
  // window.open is blocked in some in-app/PWA contexts — fall back to direct navigation
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
}
