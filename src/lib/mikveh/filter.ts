/* מקווה בסביבה — list filtering + marker tone (pure, tested). */
import type { Mikveh } from '@/types/mikveh';

export type Audience = 'all' | 'women' | 'men' | 'vessels';
export interface MikvehFilter { audience: Audience; accessible: boolean }

export const DEFAULT_FILTER: MikvehFilter = { audience: 'all', accessible: false };

export function filterMikvaot(list: Mikveh[], f: MikvehFilter): Mikveh[] {
  return list.filter(m =>
    (f.audience === 'all' || m[f.audience] === true)
    && (!f.accessible || m.accessibility === 'full' || m.accessibility === 'partial'));
}

export function mikvehTone(m: Mikveh): 'women' | 'men' | 'both' | 'unknown' {
  if (m.women && m.men) return 'both';
  if (m.women) return 'women';
  if (m.men) return 'men';
  return 'unknown';
}

/** Restores a stored filter, ignoring anything malformed. */
export function parseFilter(raw: string | null): MikvehFilter {
  try {
    const v = JSON.parse(raw ?? '') as Partial<MikvehFilter>;
    const audience = (['all', 'women', 'men', 'vessels'] as const).find(a => a === v.audience) ?? 'all';
    return { audience, accessible: v.accessible === true };
  } catch {
    return DEFAULT_FILTER;
  }
}
