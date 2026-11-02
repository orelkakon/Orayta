'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NearbyResponse } from '@/types/minyan';
import { DEFAULT_RADIUS_M } from '@/lib/minyan/geo';

export type Phase = 'idle' | 'locating' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'error' | 'rate-limited';

export interface Origin { lat: number; lng: number; label: string | null; }

/**
 * Location + results state for a "near me" page (מניין קרוב, מקווה בסביבה).
 * Never prompts for location on its own: the browser prompt only appears
 * after the user taps "use my location", except when permission was already
 * granted earlier (then we locate at once).
 */
export function useNearbySearch<T>(endpoint: string, defaultRadius: number) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [radius, setRadius] = useState<number>(defaultRadius);
  const [data, setData] = useState<T | null>(null);
  const reqId = useRef(0);

  const load = useCallback(async (o: Origin, r: number) => {
    const id = ++reqId.current;
    setPhase('loading');
    try {
      // The server gives up on slow sources by itself; this only guards a hung connection.
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25_000);
      const res = await fetch(`${endpoint}?lat=${o.lat.toFixed(5)}&lng=${o.lng.toFixed(5)}&r=${r}&via=${o.label ? 'place' : 'gps'}`, { signal: ctrl.signal })
        .finally(() => clearTimeout(timer));
      if (id !== reqId.current) return;
      if (res.status === 429) { setPhase('rate-limited'); return; }
      if (!res.ok) { setPhase('error'); return; }
      setData(await res.json() as T);
      setPhase('ready');
    } catch {
      if (id === reqId.current) setPhase('error');
    }
  }, [endpoint]);

  const searchAt = useCallback((o: Origin) => {
    setOrigin(o);
    void load(o, radius);
  }, [load, radius]);

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setPhase('unavailable'); return; }
    setPhase('locating');
    navigator.geolocation.getCurrentPosition(
      pos => searchAt({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: null }),
      err => setPhase(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [searchAt]);

  // Auto-locate only when the visitor already granted permission before.
  useEffect(() => {
    let cancelled = false;
    navigator.permissions?.query({ name: 'geolocation' })
      .then(p => { if (!cancelled && p.state === 'granted') locate(); })
      .catch(() => {});
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRadius = useCallback((r: number) => {
    setRadius(r);
    if (origin) void load(origin, r);
  }, [origin, load]);

  const retry = useCallback(() => {
    if (origin) void load(origin, radius); else locate();
  }, [origin, radius, load, locate]);

  return { phase, origin, radius, data, locate, searchAt, changeRadius, retry };
}

export const useMinyanSearch = () => useNearbySearch<NearbyResponse>('/api/minyan/nearby', DEFAULT_RADIUS_M);
