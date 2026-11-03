/* Stories row + viewer — spread into HE (src/lib/hebrewTexts.ts). */
export const STORIES_HE = {
  STORY_GROUP_LABELS: {
    learn: 'לימוד יומי',
    rabbis: 'גדולי ישראל',
    play: 'חידון',
    chidush: 'חידוש',
    watch: 'צפייה',
  } as Record<string, string>,
  STORY_GROUP_ARIA: (label: string, count: number, seen: boolean) =>
    `${label} — ${count} סטוריז${seen ? ', נצפו' : ', חדשים'}`,
};
