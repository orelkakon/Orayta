/* Search radii for מקווה בסביבה — mikvaot are far sparser than synagogues. */
export const MIKVEH_RADII_M = [2000, 5000, 10000, 20000] as const;
export const MIKVEH_DEFAULT_RADIUS_M = 5000;

export function clampMikvehRadius(r: number): number {
  return (MIKVEH_RADII_M as readonly number[]).includes(r) ? r : MIKVEH_DEFAULT_RADIUS_M;
}
