'use client';

/**
 * Client-side event tracking with built-in dedup, so the server stores only
 * one tiny counter row per metric per day (see /api/track and DailyStat).
 */

export type TrackMetric =
  | 'users' | 'feed' | 'content' | 'today' | 'pwa'
  | 'stories' | 'quiz' | 'rabbis' | 'study' | 'sikumim' | 'chidushim' | 'gematria' | 'live';

function post(metric: TrackMetric) {
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metric }),
  }).catch(() => {});
}

// Returns true only the first time this (key, value) pair is seen.
// If storage is unavailable we skip tracking rather than over-count.
function firstTime(storage: Storage, key: string, value: string): boolean {
  try {
    if (storage.getItem(key) === value) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Counts once per device per calendar day — daily active users. */
export function trackDaily(metric: TrackMetric) {
  const today = new Date().toLocaleDateString('en-CA');
  if (firstTime(localStorage, `orayta_track_day_${metric}`, today)) post(metric);
}

/** Counts once per browsing session — section entries. */
export function trackSession(metric: TrackMetric) {
  if (firstTime(sessionStorage, `orayta_track_ses_${metric}`, '1')) post(metric);
}

/** Counts once ever per device — e.g. PWA install. */
export function trackOnce(metric: TrackMetric) {
  if (firstTime(localStorage, `orayta_track_once_${metric}`, '1')) post(metric);
}

/** Counts every occurrence — view-style metrics like daily-story views. */
export function trackEvent(metric: TrackMetric) {
  post(metric);
}
