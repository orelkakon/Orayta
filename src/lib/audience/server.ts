/* Server-only helpers for the audience stats (traffic sources + devices). */
import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jerusalemDay } from '@/lib/adminStatsUtils';
import { addDays, DEVICE_RETENTION_DAYS } from './devices';
import { isMissingTable } from './missingTable';

export { isMissingTable };

/** Salt for device-id hashes. No fallback: without it nothing is recorded. */
export function statsSalt(): string | null {
  const s = process.env.STATS_SALT?.trim();
  return s ? s : null;
}

export const hashDevice = (id: string, salt: string) =>
  createHash('sha256').update(`${id.toLowerCase()}:${salt}`).digest('hex');

export const israelToday = () => jerusalemDay(new Date());

/**
 * The audience tables are applied by hand before merge. A missing table
 * resolves to `fallback` (logged once per instance); every other error is
 * logged and rethrown so it surfaces as a real failure.
 */
let warned = false;
export async function orMissing<T, F>(fn: () => Promise<T>, fallback: F): Promise<T | F> {
  try {
    return await fn();
  } catch (e) {
    if (isMissingTable(e)) {
      if (!warned) { warned = true; console.warn('[audience] stats table does not exist yet'); }
      return fallback;
    }
    console.error('[audience] db error:', e);
    throw e;
  }
}

/** Deletes device rows past the retention window — at most once an hour per
 *  instance. A failed purge is logged and never fails the caller. */
let lastPurge = 0;
export async function purgeOldDevices(force = false): Promise<void> {
  if (!force && Date.now() - lastPurge < 3600_000) return;
  lastPurge = Date.now();
  const cutoff = addDays(israelToday(), -DEVICE_RETENTION_DAYS);
  await orMissing(() => prisma.deviceDay.deleteMany({ where: { day: { lt: cutoff } } }), null).catch(() => undefined);
}

/** Outcome of a tracking ping, as the client reads it. */
export type TrackReason = 'admin' | 'disabled' | 'rate_limited' | 'unavailable' | 'error' | 'bad_request';

const STATUS: Record<TrackReason, number> = {
  admin: 200, disabled: 503, rate_limited: 429, unavailable: 503, error: 500, bad_request: 400,
};

/** `{ recorded: false, reason }` with a status that says why. */
export const notRecorded = (reason: TrackReason) =>
  NextResponse.json({ recorded: false, reason }, { status: STATUS[reason] });

export const recorded = () => NextResponse.json({ recorded: true });
