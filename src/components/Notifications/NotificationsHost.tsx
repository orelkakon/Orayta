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
    return onOpenNotifications(() => setOpen(true));
  }, []);

  return open ? <NotificationsSheet onClose={() => setOpen(false)} /> : null;
}
