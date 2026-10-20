import type { PushSubscriptionJSONBody } from '@/types/push';

/** Pure validation of incoming browser push subscriptions (tested). */
const B64URL = /^[A-Za-z0-9_-]+={0,2}$/;

// The dispatcher POSTs to every stored endpoint, so only real browser push
// services are accepted — anything else would let the server be aimed at
// arbitrary URLs (SSRF).
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)push\.apple\.com$/, /\.notify\.windows\.com$/];

export function isPushServiceUrl(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    return u.protocol === 'https:' && !u.port && PUSH_HOSTS.some(re => re.test(u.hostname));
  } catch { return false; }
}

// p256dh = 65-byte P-256 point (87 base64url chars), auth = 16 bytes (22 chars).
const keyLen = (s: string) => s.replace(/=+$/, '').length;

/** Validates a browser PushSubscription JSON; only https push-service endpoints. */
export function parseSubscription(body: unknown): PushSubscriptionJSONBody | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const { endpoint } = b;
  const p256dh = b.keys?.p256dh;
  const auth = b.keys?.auth;
  if (typeof endpoint !== 'string' || endpoint.length > 1000 || !isPushServiceUrl(endpoint)) return null;
  if (typeof p256dh !== 'string' || !B64URL.test(p256dh) || keyLen(p256dh) !== 87) return null;
  if (typeof auth !== 'string' || !B64URL.test(auth) || keyLen(auth) !== 22) return null;
  return { endpoint, keys: { p256dh, auth } };
}
