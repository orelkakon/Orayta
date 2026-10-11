/* Server-only helpers for the minyan API routes. */
import { NextRequest } from 'next/server';

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
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
