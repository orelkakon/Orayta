import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import type { ScheduleEntry } from './wake';

/**
 * What the heartbeat needs to know, kept in Vercel's data cache so the
 * 5-minute pings don't wake Neon: subscribers' chosen times, and the hilula
 * dates of the directory. Invalidated on every change (subscribe / prefs /
 * unsubscribe / dead rows removed; rabbi added, edited or deleted), and
 * refreshed daily as a safety net.
 */
const SCHEDULE_TAG = 'push-schedule';
const HILULA_TAG = 'push-hilula-dates';

export const cachedSchedule = unstable_cache(
  async (): Promise<ScheduleEntry[]> => prisma.pushSubscription.findMany({
    select: { timeZone: true, dailyMinutes: true, daily: true, hilula: true, omer: true },
  }),
  ['push-schedule-v1'],
  { tags: [SCHEDULE_TAG], revalidate: 86400 },
);

export const cachedHilulaDates = unstable_cache(
  async (): Promise<string[]> => (await prisma.rabbi.findMany({
    where: { deathDate: { not: null } },
    select: { deathDate: true },
  })).map(r => r.deathDate as string),
  ['push-hilula-dates-v1'],
  { tags: [HILULA_TAG], revalidate: 86400 },
);

export const invalidateSchedule = () => revalidateTag(SCHEDULE_TAG);
export const invalidateHilulaDates = () => revalidateTag(HILULA_TAG);
