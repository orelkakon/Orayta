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
const SEP = '\n━━━━━━━━━━━━━━\n';

const clip = (s: string, max = 220) =>
  s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;

/** Builds a WhatsApp-formatted (bold/italic markdown) daily digest message. */
export function buildDailyShareMessage(d: DailyShareData): string {
  const parts: string[] = [];

  let header = `📖 *${HE.DAILY_SHARE_TITLE}* 📖`;
  if (d.hebrewDate) header += `\n🗓️ _${d.hebrewDate}_`;
  parts.push(header);

  if (d.rabbi) {
    const lines = [`👤 *${HE.DAILY_RABBI_AND_BOOK}:* ${d.rabbi.name}`, `_${d.rabbi.datePeriod}_`];
    if (d.rabbi.bio) lines.push(clip(d.rabbi.bio));
    parts.push(lines.join('\n'));
  }

  const loc = d.citation?.locations[0];
  if (d.citation) {
    const src = loc ? ` (${loc.masechet} ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''})` : '';
    parts.push(`📜 *${HE.DAILY_CITATION}:*${src}\n"${clip(d.citation.content)}"`);
  }

  if (d.sikum) {
    const by = d.sikum.book.author ? ` — _${d.sikum.book.author}_` : '';
    const title = d.sikum.title ? `\n*${d.sikum.title}*` : '';
    parts.push(`📝 *${HE.DAILY_SIKUM}:* ${d.sikum.book.name}${by}${title}\n${clip(d.sikum.text)}`);
  }

  if (d.chidush) {
    const by = d.chidush.author ? ` ${d.chidush.author}` : '';
    const src = d.chidush.source ? ` (_${d.chidush.source}_)` : '';
    parts.push(`💡 *${HE.DAILY_CHIDUSH}:*${by}${src}\n${clip(d.chidush.text)}`);
  }

  if (d.yahrzeitNames.length > 0) {
    parts.push(`🕯️ *${HE.YAHRZEIT_BADGE} ${HE.DAILY_SHARE_TODAY}:* ${d.yahrzeitNames.join(', ')}`);
  }

  parts.push(`🔗 ${HE.DAILY_SHARE_LINK_LABEL}: ${SITE_URL}`);

  return parts.join(SEP);
}

/** Opens WhatsApp with the message, letting the user pick a chat. */
export function shareDailyToWhatsApp(d: DailyShareData): void {
  const text = buildDailyShareMessage(d);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
