/* Search radii for קברי צדיקים באזור — graves are sparse, so wider than minyan/mikveh. */
export const KIVREI_RADII_M = [5000, 15000, 30000, 60000] as const;
export const KIVREI_DEFAULT_RADIUS_M = 15000;

export function clampKivreiRadius(r: number): number {
  return (KIVREI_RADII_M as readonly number[]).includes(r) ? r : KIVREI_DEFAULT_RADIUS_M;
}
