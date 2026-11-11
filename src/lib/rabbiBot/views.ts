import type { RabbiBotAnswer, RabbiBotSource, RabbiBotView } from '@/types/rabbiBot';
import { HE } from '@/lib/hebrewTexts';

/**
 * The communities an answer's rulings are grouped by. The main view is the
 * Sephardi ruling (Maran) — named as עדות המזרח only when the communities
 * differ; when everyone agrees it is just "להלכה". Pure — unit-tested.
 */
export const VIEW_ORDER: RabbiBotView[] = ['main', 'ashkenaz', 'teiman', 'note'];

export function viewLabels(answer: RabbiBotAnswer): Record<RabbiBotView, string> {
  if (answer.kind === 'torah') return HE.RB_VIEW_TORAH;
  return answer.dispute ? HE.RB_VIEW : HE.RB_VIEW_AGREED;
}

/** Ashkenazi codes and commentaries, by their Hebrew title on Sefaria (the site's own summaries never count). */
const ASHKENAZI_BOOKS = [
  HE.RB_REMA_BOOK, 'משנה ברורה', 'ביאור הלכה', 'ערוך השולחן', 'קיצור שלחן ערוך', 'חיי אדם', 'חכמת אדם',
  'שולחן ערוך הרב', 'מגן אברהם', 'מחצית השקל',
];

export const isAshkenaziSource = (s: Pick<RabbiBotSource, 'book' | 'origin'>) =>
  s.origin !== 'sikum' && ASHKENAZI_BOOKS.some(b => s.book === b || s.book.startsWith(`${b},`));
