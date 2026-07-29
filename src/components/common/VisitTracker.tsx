'use client';

import { useEffect } from 'react';
import { trackDaily, trackOnce } from '@/lib/track';

export default function VisitTracker() {
  useEffect(() => {
    void fetch('/api/visits', { method: 'POST' });
    trackDaily('users');

    // PWA: count a device once — either the install event fires (Android/Chrome)
    // or the app is already running from the home screen (iOS has no event).
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (window.matchMedia('(display-mode: standalone)').matches || nav.standalone) {
      trackOnce('pwa');
    }
    const onInstalled = () => trackOnce('pwa');
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);
  return null;
}
