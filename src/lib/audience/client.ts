'use client';

import { isAdminBrowser } from '@/lib/adminBrowser';
import { referrerHost, cleanUtm } from './source';
import { stripUtm } from './shareUtm';

/**
 * The visit's arrival pings, deduped on the device:
 *  - source: once per browser session — the referrer's hostname and the
 *    utm_* tags (then removed from the address bar);
 *  - device: once per Israel day — a random anonymous id from localStorage
 *    and the day it was first seen.
 * Storage unavailable → skip rather than over-count.
 */

const SOURCE_FLAG = 'orayta_src_ses';
const ID_KEY = 'orayta_anon_id';
const FIRST_KEY = 'orayta_first_seen';
const DAY_KEY = 'orayta_dev_day';
/** Set by the daily-users counter since before the id existed. */
const LEGACY_KEY = 'orayta_track_day_users';
const UNKNOWN = '-';

const israelDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());

function send(path: string, body: object): Promise<boolean> {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).then(r => r.ok, () => false);
}

function captureSource(): void {
  const url = new URL(window.location.href);
  try {
    if (!sessionStorage.getItem(SOURCE_FLAG)) {
      sessionStorage.setItem(SOURCE_FLAG, '1');
      const p = url.searchParams;
      void send('/api/track/source', {
        ref: referrerHost(document.referrer),
        utmSource: cleanUtm(p.get('utm_source')),
        utmMedium: cleanUtm(p.get('utm_medium')),
        utmCampaign: cleanUtm(p.get('utm_campaign')),
      });
    }
  } catch { /* storage blocked — not counted */ }
  // Clean the address bar so a re-shared link doesn't carry our tags.
  const clean = stripUtm(url);
  if (clean) {
    try { window.history.replaceState(window.history.state, '', clean.toString()); } catch { /* ignore */ }
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

let inflight = false;

function pingDevice(): void {
  if (inflight) return;
  try {
    const day = israelDay();
    if (localStorage.getItem(DAY_KEY) === day) return;
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
    inflight = true;
    void send('/api/track/device', { id, firstDay }).then(ok => {
      inflight = false;
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
