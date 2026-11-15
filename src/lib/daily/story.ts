import { HE } from '@/lib/hebrewTexts';
import type { StoryContent } from '@/lib/storyImage';
import type { DailyShareData } from '@/lib/dailyShare';

/** ~1300 chars is what the story card holds at its smallest font without
 *  the renderer having to ellipsize (see storyImage.ts font-fitting). */
const BUDGET = 1300;

/**
 * The Instagram-story card of the daily digest — pure, shared by the
 * "שתף בסטורי" button on /today and the server-rendered /api/story/daily.png.
 * Items are FULL text, never cut mid-sentence: they fill the card in priority
 * order (chidush → citation → sikum → rabbi) and an item that doesn't fit is
 * skipped whole.
 */
export function dailyStoryContent(d: Omit<DailyShareData, 'yahrzeitNames'>): StoryContent {
  const items: string[] = [];
  if (d.chidush) items.push(`${HE.DAILY_CHIDUSH}:\n${d.chidush.text}`);
  const loc = d.citation?.locations[0];
  if (d.citation) {
    const src = loc ? ` (${loc.masechet} ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''})` : '';
    items.push(`${HE.DAILY_CITATION}${src}:\n"${d.citation.content}"`);
  }
  if (d.sikum) items.push(`${HE.DAILY_SIKUM}: ${d.sikum.book.name}\n${d.sikum.text}`);
  if (d.rabbi) items.push(`${HE.DAILY_RABBI_AND_BOOK}: ${d.rabbi.name}\n${d.rabbi.bio}`);

  const parts: string[] = [];
  let used = 0;
  for (const item of items) {
    if (parts.length > 0 && used + item.length > BUDGET) continue;
    parts.push(item);
    used += item.length;
  }

  return {
    badge: HE.DAILY_SHARE_TITLE,
    title: d.hebrewDate || undefined,
    text: parts.join('\n\n'),
  };
}
