import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

/**
 * Site-wide home settings set by the admin. Read through Vercel's data cache
 * (a home visit never wakes Neon), invalidated when the admin changes them.
 * `home_personalize`: '0' = everyone sees the same home; anything else = on.
 */
const TAG = 'home-config';
const KEY = 'home_personalize';

export interface HomeConfig { personalize: boolean }

export const cachedHomeConfig = unstable_cache(
  async (): Promise<HomeConfig> => {
    try {
      const row = await prisma.appConfig.findUnique({ where: { key: KEY } });
      return { personalize: row?.value !== '0' };
    } catch {
      return { personalize: true };
    }
  },
  ['home-config-v1'],
  { tags: [TAG], revalidate: 86400 },
);

export async function setHomePersonalize(on: boolean): Promise<void> {
  const value = on ? '1' : '0';
  await prisma.appConfig.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  revalidateTag(TAG);
}
