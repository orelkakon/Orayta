/* Server-only helpers for the audience stats (traffic sources + devices). */
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jerusalemDay } from '@/lib/adminStatsUtils';
import { addDays, DEVICE_RETENTION_DAYS } from './devices';

/** Salt for device-id hashes. No fallback: without it nothing is recorded. */
export function statsSalt(): string | null {
  const s = process.env.STATS_SALT?.trim();
  return s ? s : null;
}

export const hashDevice = (id: string, salt: string) =>
  createHash('sha256').update(`${id.toLowerCase()}:${salt}`).digest('hex');

export const israelToday = () => jerusalemDay(new Date());

/** The audience tables may not exist yet (they're applied by hand before
 *  merge). Any DB error resolves to `fallback`, logged once per instance. */
let warned = false;
export async function quietly<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!warned) {
      warned = true;
      const code = e instanceof Prisma.PrismaClientKnownRequestError ? e.code : (e as Error)?.name;
      console.warn('[audience] stats table unavailable:', code);
    }
    return fallback;
  }
}

/** Deletes device rows past the retention window — at most once an hour per instance. */
let lastPurge = 0;
export async function purgeOldDevices(force = false): Promise<void> {
  if (!force && Date.now() - lastPurge < 3600_000) return;
  lastPurge = Date.now();
  const cutoff = addDays(israelToday(), -DEVICE_RETENTION_DAYS);
  await quietly(() => prisma.deviceDay.deleteMany({ where: { day: { lt: cutoff } } }), { count: 0 });
}
