'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayErrorCode, PlayState } from '@/types/play';
import { playFetch, type Identity } from './playClient';

/**
 * Polls one game about once a second and keeps a server-synced clock, so a
 * countdown reads the same on the projector and on every phone. The offset
 * comes from the lowest-latency sample seen (half the round trip).
 */
export interface PlayConn {
  state: PlayState | null;
  fatal: PlayErrorCode | null;
  reconnecting: boolean;
  now: () => number;
  refresh: () => void;
}

const HIDDEN_MS = 4000;
const MAX_BACKOFF_MS = 5000;

export function usePlayState(code: string, identity: Identity, intervalMs = 1000): PlayConn {
  const [state, setState] = useState<PlayState | null>(null);
  const [fatal, setFatal] = useState<PlayErrorCode | null>(null);
  const [failures, setFailures] = useState(0);
  const failRef = useRef(0);
  const offset = useRef(0);
  const bestRtt = useRef(Infinity);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const inflight = useRef(false);
  const stopped = useRef(false);
  const idRef = useRef(identity);
  idRef.current = identity;
  const idKey = `${identity.hostKey ?? ''}|${identity.me?.playerId ?? ''}`;

  const poll = useCallback(async () => {
    if (inflight.current || stopped.current) return;
    inflight.current = true;
    clearTimeout(timer.current);
    const t0 = Date.now();
    const res = await playFetch<PlayState>(`/api/play/${code}`, { identity: idRef.current });
    const t1 = Date.now();
    inflight.current = false;
    if (stopped.current) return;
    let next = document.visibilityState === 'hidden' ? HIDDEN_MS : intervalMs;
    if (res.ok) {
      const rtt = t1 - t0;
      if (rtt <= bestRtt.current * 1.5 || bestRtt.current === Infinity) {
        bestRtt.current = Math.min(bestRtt.current, rtt);
        offset.current = res.data.serverNow - (t0 + rtt / 2);
      }
      setState(res.data);
      failRef.current = 0;
      setFailures(0);
    } else if (res.error === 'not_found') {
      setFatal('not_found');
      return;
    } else {
      failRef.current += 1;
      next = Math.min(MAX_BACKOFF_MS, intervalMs * 2 ** failRef.current);
      setFailures(failRef.current);
    }
    timer.current = setTimeout(() => { void poll(); }, next);
  }, [code, intervalMs]);

  useEffect(() => {
    stopped.current = false;
    void poll();
    const onVis = () => { if (document.visibilityState === 'visible') void poll(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', onVis);
    return () => {
      stopped.current = true;
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('online', onVis);
    };
  }, [poll, idKey]);

  const now = useCallback(() => Date.now() + offset.current, []);
  const refresh = useCallback(() => { void poll(); }, [poll]);
  return { state, fatal, reconnecting: failures >= 2, now, refresh };
}

/** Re-renders every `ms` while active — for countdown text, not animation. */
export function useTicker(active: boolean, ms = 250): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(t => t + 1), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return tick;
}

/** Keeps the screen awake during a game where the browser allows it. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () => {
      navigator.wakeLock.request('screen').then(l => {
        if (cancelled) void l.release(); else lock = l;
      }).catch(() => { /* denied or unsupported — harmless */ });
    };
    acquire();
    const onVis = () => { if (document.visibilityState === 'visible') acquire(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      void lock?.release();
    };
  }, [active]);
}
