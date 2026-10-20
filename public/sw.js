/* Orayta service worker — push notifications only.
   Deliberately has NO fetch handler and no caches: it must never change how
   the site loads. Payload shape: src/types/push.ts (PushPayload). */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  const title = data.title || 'אורייתא';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icon',
    badge: '/icon',
    tag: data.tag || data.kind || 'orayta',
    lang: 'he',
    dir: 'rtl',
    data: { url: typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin);
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (new URL(client.url).origin === target.origin && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) { try { await client.navigate(target.href); } catch (e) { /* cross-origin guard */ } }
        return;
      }
    }
    await self.clients.openWindow(target.href);
  })());
});

/* The push service rotated our subscription: re-subscribe with the same key
   and tell the server, so reminders keep arriving without the user noticing. */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const old = event.oldSubscription;
    let sub = event.newSubscription;
    if (!sub) {
      const res = await fetch('/api/push/key');
      if (!res.ok) return;
      const { key } = await res.json();
      const pad = '='.repeat((4 - (key.length % 4)) % 4);
      const raw = atob((key + pad).replace(/-/g, '+').replace(/_/g, '/'));
      const appKey = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
    }
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), previousEndpoint: old ? old.endpoint : undefined }),
    });
  })());
});
