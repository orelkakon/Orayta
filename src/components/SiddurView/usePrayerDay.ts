'use client';

import { useEffect, useState } from 'react';
import type { ServiceId } from '@/lib/siddur';
import { prayerDay, suggestService, PrayerDay } from '@/lib/siddur/calendar';

const keyOf = (d: PrayerDay) => `${d.service}|${d.heb?.month}|${d.heb?.day}|${d.weekday}`;

/**
 * The prayer-day for a service ('auto' = the one that fits the current time).
 * Client-only, and re-checked every minute and whenever the tab comes back,
 * so a page left open from the afternoon moves on to tonight's date.
 * Re-renders only when the day itself changes.
 */
export function usePrayerDay(service: ServiceId | 'auto'): PrayerDay | null {
  const [day, setDay] = useState<PrayerDay | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = prayerDay(now, service === 'auto' ? suggestService(now) : service);
      setDay(prev => (prev && keyOf(prev) === keyOf(next) ? prev : next));
    };
    tick();
    const timer = window.setInterval(tick, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [service]);
  return day;
}
