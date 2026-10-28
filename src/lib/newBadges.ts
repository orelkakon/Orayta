/**
 * "חדש" badges that retire themselves. Add a feature with an end date when
 * launching it; after that date the badge simply stops rendering — no
 * follow-up commit needed. Remove stale entries whenever convenient.
 */
export const NEW_FEATURE_UNTIL: Record<string, string> = {
  '/minyan': '2026-12-31',
  '/ask': '2026-12-31',
};

export function isNewFeature(key: string, now: Date = new Date()): boolean {
  const until = NEW_FEATURE_UNTIL[key];
  if (!until) return false;
  // Inclusive of the whole end day, Israel time.
  return now.getTime() < Date.parse(`${until}T23:59:59+02:00`);
}
