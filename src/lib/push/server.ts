import webpush from 'web-push';
import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/siteUrl';
import type { PushPayload, PushSubscriptionJSONBody } from '@/types/push';

let configured: boolean | null = null;

/** Configures web-push from env once; false when the VAPID keys are missing. */
export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return (configured = false);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || SITE_URL, pub, priv);
  return (configured = true);
}

export const vapidPublicKey = () => process.env.VAPID_PUBLIC_KEY ?? null;

export function pushIpHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(`${ip}|orayta_push_v1`).digest('hex');
}

const SIGNUPS_PER_HOUR = 10;

/** DB-backed signup cap per hashed IP (holds across serverless instances). */
export async function isPushRateLimited(ipHash: string): Promise<boolean> {
  const n = await prisma.pushSubscription.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - 3600_000) } },
  });
  return n >= SIGNUPS_PER_HOUR;
}

const B64URL = /^[A-Za-z0-9_-]+={0,2}$/;

/** Validates a browser PushSubscription JSON; only https push-service endpoints. */
export function parseSubscription(body: unknown): PushSubscriptionJSONBody | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const { endpoint } = b;
  const p256dh = b.keys?.p256dh;
  const auth = b.keys?.auth;
  if (typeof endpoint !== 'string' || endpoint.length > 1000 || !endpoint.startsWith('https://')) return null;
  if (typeof p256dh !== 'string' || p256dh.length > 200 || !B64URL.test(p256dh)) return null;
  if (typeof auth !== 'string' || auth.length > 100 || !B64URL.test(auth)) return null;
  try { new URL(endpoint); } catch { return null; }
  return { endpoint, keys: { p256dh, auth } };
}

/** Finds a row by endpoint, but only if the caller also holds its auth secret. */
export async function findOwnedSubscription(endpoint: unknown, auth: unknown) {
  if (typeof endpoint !== 'string' || typeof auth !== 'string') return null;
  const row = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  return row && row.auth === auth ? row : null;
}

export type SendOutcome = 'sent' | 'gone' | 'failed';

interface Target { endpoint: string; p256dh: string; auth: string; }

export async function sendPush(sub: Target, payload: PushPayload): Promise<SendOutcome> {
  if (!pushConfigured()) return 'failed';
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      // Daily content goes stale — don't let the push service hold it past a few hours.
      { TTL: 4 * 3600, urgency: 'normal', topic: payload.kind.slice(0, 32) },
    );
    return 'sent';
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    return status === 404 || status === 410 ? 'gone' : 'failed';
  }
}

/** Runs `fn` over `items` with at most `limit` in flight. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
