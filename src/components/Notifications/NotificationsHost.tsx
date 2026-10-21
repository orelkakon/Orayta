'use client';

import { useEffect, useState } from 'react';
import { onOpenNotifications, readLocal, registerServiceWorker } from '@/lib/push/client';
import NotificationsSheet from './NotificationsSheet';

/**
 * Mounted once in ClientProviders. Opens the notifications sheet from anywhere
 * (openNotifications()), and keeps an enabled device's service worker fresh.
 */
export default function NotificationsHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readLocal().enabled) void registerServiceWorker();
    // Visits double as a heartbeat for the reminder dispatcher (backup for
    // GitHub's unreliable schedules); the server runs it at most once a minute.
    try {
      const last = Number(sessionStorage.getItem('orayta_push_tick') ?? 0);
      if (Date.now() - last > 5 * 60_000) {
        sessionStorage.setItem('orayta_push_tick', String(Date.now()));
        void fetch('/api/push/tick', { method: 'POST', keepalive: true }).catch(() => undefined);
      }
    } catch { /* storage blocked — skip */ }
    return onOpenNotifications(() => setOpen(true));
  }, []);

  return open ? <NotificationsSheet onClose={() => setOpen(false)} /> : null;
}
