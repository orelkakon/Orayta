import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every minute and when the tab comes back.
 * Null on the server and before mount, so time-based UI never mismatches
 * the server render.
 */
export function useMinute(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  return now;
}
