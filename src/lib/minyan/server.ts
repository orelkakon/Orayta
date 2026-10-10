/* Server-only helpers for the minyan API routes. */
import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { GabbaiContact, MinyanTime } from '@/types/minyan';
import { summarizeTimes, REPORT_MAX_AGE_DAYS, RawReport } from './confidence';

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/**
 * Stable pseudonymous reporter id: an HMAC of the IP, so corroboration can
 * count distinct people without ever storing an address.
 */
export function reporterId(req: NextRequest): string {
  const secret = process.env.AUTH_SECRET ?? process.env.PASSCODE ?? 'orayta-dev-secret';
  return createHmac('sha256', secret).update(`minyan:${clientIp(req)}`).digest('hex').slice(0, 24);
}

/** In-process sliding-window limiter (same approach as the contact/dedication routes). */
export function makeRateLimiter(max: number, windowMs: number) {
  const log = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const hits = (log.get(key) ?? []).filter(t => now - t < windowMs);
    if (hits.length >= max) { log.set(key, hits); return true; }
    hits.push(now);
    log.set(key, hits);
    if (log.size > 5000) log.delete(log.keys().next().value as string);
    return false;
  };
}

/** Graded times + admin gabbai contacts for a set of OSM place ids. */
export async function loadPlaceData(placeIds: string[], now = new Date()) {
  const times = new Map<string, MinyanTime[]>();
  const contacts = new Map<string, GabbaiContact>();
  if (placeIds.length === 0) return { times, contacts };

  const since = new Date(now.getTime() - REPORT_MAX_AGE_DAYS * 86_400_000);
  const [reports, rows] = await Promise.all([
    prisma.minyanReport.findMany({ where: { placeId: { in: placeIds }, createdAt: { gte: since } } }),
    prisma.synagogueContact.findMany({ where: { placeId: { in: placeIds } } }),
  ]);

  const byPlace = new Map<string, RawReport[]>();
  for (const r of reports) {
    const list = byPlace.get(r.placeId) ?? [];
    list.push(r as RawReport);
    byPlace.set(r.placeId, list);
  }
  byPlace.forEach((list, id) => times.set(id, summarizeTimes(list, now)));
  for (const c of rows) {
    contacts.set(c.placeId, { name: c.gabbaiName, phone: c.gabbaiPhone, updatedAt: c.updatedAt.toISOString() });
  }
  return { times, contacts };
}
