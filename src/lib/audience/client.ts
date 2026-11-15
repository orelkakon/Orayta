'use client';

import { isAdminBrowser } from '@/lib/adminBrowser';
import { jerusalemDay } from '@/lib/adminStatsUtils';
import { referrerHost, cleanUtm } from './source';
import { stripUtm } from './shareUtm';

/**
 * The visit's arrival pings, deduped on the device:
 *  - source: once per browser session — the referrer's hostname and the
 *    utm_* tags (then removed from the address bar);
 *  - device: once per Israel day — a random anonymous id from localStorage
 *    and the day it was first seen.
 * A ping counts as done only when the server answers `recorded: true`; until
 * then it is retried on a later page view (see `send`). Storage unavailable
 * → skip rather than over-count.
 */

const SOURCE_DONE = 'orayta_src_ses';
const SOURCE_PENDING = 'orayta_src_pending';
const PAUSE = 'orayta_aud_pause_';
const ID_KEY = 'orayta_anon_id';
const FIRST_KEY = 'orayta_first_seen';
const DAY_KEY = 'orayta_dev_day';
/** Set by the daily-users counter since before the id existed. */
const LEGACY_KEY = 'orayta_track_day_users';
const UNKNOWN = '-';
const BACKOFF_MS = 2 * 60_000;

export const israelDay = () => jerusalemDay(new Date());

type Ping = 'source' | 'device';
const inflight: Record<Ping, boolean> = { source: false, device: false };
const retryAt: Record<Ping, number> = { source: 0, device: 0 };

/**
 * POST and say whether the row was written. Rate-limited / offline → retry
 * after a short backoff; disabled, missing table, server error or a refused
 * body → leave it for this browser session (the next session tries again).
 */
async function send(ping: Ping, body: object): Promise<boolean> {
  inflight[ping] = true;
  try {
    const r = await fetch(`/api/track/${ping}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
    const data = (await r.json().catch(() => null)) as { recorded?: boolean } | null;
    if (r.ok && data?.recorded === true) return true;
    if (r.status === 429) retryAt[ping] = Date.now() + BACKOFF_MS;
    else { try { sessionStorage.setItem(PAUSE + ping, '1'); } catch { /* ignore */ } }
    return false;
  } catch {
    retryAt[ping] = Date.now() + BACKOFF_MS;
    return false;
  } finally {
    inflight[ping] = false;
  }
}

/** Not now: a request is out, we're backing off, or paused for the session. */
function waiting(ping: Ping): boolean {
  return inflight[ping] || Date.now() < retryAt[ping] || sessionStorage.getItem(PAUSE + ping) === '1';
}

function captureSource(): void {
  const url = new URL(window.location.href);
  try {
    if (sessionStorage.getItem(SOURCE_DONE)) return;
    // Captured once per session and kept, so a retry sends the original
    // referrer and tags after they're gone from the address bar.
    if (!sessionStorage.getItem(SOURCE_PENDING)) {
      const p = url.searchParams;
      sessionStorage.setItem(SOURCE_PENDING, JSON.stringify({
        ref: referrerHost(document.referrer),
        utmSource: cleanUtm(p.get('utm_source')),
        utmMedium: cleanUtm(p.get('utm_medium')),
        utmCampaign: cleanUtm(p.get('utm_campaign')),
      }));
    }
    if (waiting('source')) return;
    const payload = JSON.parse(sessionStorage.getItem(SOURCE_PENDING) ?? '{}') as object;
    void send('source', payload).then(ok => {
      if (!ok) return;
      try { sessionStorage.setItem(SOURCE_DONE, '1'); sessionStorage.removeItem(SOURCE_PENDING); } catch { /* ignore */ }
    });
  } catch { /* storage blocked — not counted */ } finally {
    // Clean the address bar so a re-shared link doesn't carry our tags.
    const clean = stripUtm(url);
    if (clean) {
      try { window.history.replaceState(window.history.state, '', clean.toString()); } catch { /* ignore */ }
    }
  }
}

function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function pingDevice(): void {
  try {
    const day = israelDay();
    if (localStorage.getItem(DAY_KEY) === day || waiting('device')) return;
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = newId();
      // A device that was already counted before the id existed isn't new.
      const first = localStorage.getItem(LEGACY_KEY) !== null ? UNKNOWN : day;
      localStorage.setItem(ID_KEY, id);
      localStorage.setItem(FIRST_KEY, first);
    }
    const first = localStorage.getItem(FIRST_KEY);
    const firstDay = first && first !== UNKNOWN ? first : null;
    void send('device', { id, firstDay }).then(ok => {
      if (ok) { try { localStorage.setItem(DAY_KEY, day); } catch { /* ignore */ } }
    });
  } catch { /* storage blocked — not counted */ }
}

/** Runs before the daily-users counter marks the day (see track.ts). */
export function trackArrival(): void {
  if (typeof window === 'undefined' || isAdminBrowser()) return;
  captureSource();
  pingDevice();
}
