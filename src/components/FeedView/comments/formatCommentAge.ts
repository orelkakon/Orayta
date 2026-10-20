import { HE } from '@/lib/hebrewTexts';
import { commentAge } from '@/lib/feedComments';

/** "לפני 5 דק׳" / "אתמול" / a short date — shared by the feed and admin stats. */
export function formatCommentAge(iso: string): string {
  const a = commentAge(new Date(iso), new Date());
  switch (a.unit) {
    case 'now':  return HE.COMMENTS_AGE_NOW;
    case 'min':  return HE.COMMENTS_AGE_MIN(a.n);
    case 'hour': return HE.COMMENTS_AGE_HOUR(a.n);
    case 'day':  return HE.COMMENTS_AGE_DAY(a.n);
    case 'week': return HE.COMMENTS_AGE_WEEK(a.n);
    case 'date': return a.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
