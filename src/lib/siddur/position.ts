import type { ServiceId } from './types';

/**
 * Where the reader was in a service today (section id), so reopening the
 * same service on the same Israel day offers to continue there. A new day
 * starts fresh. Storage failures just mean no resume offer.
 */
const KEY = 'orayta_siddur_pos';

interface Saved { service: ServiceId; date: string; section: string }

export function savePosition(service: ServiceId, date: string, section: string): void {
  try { localStorage.setItem(KEY, JSON.stringify({ service, date, section } satisfies Saved)); } catch {}
}

export function loadPosition(service: ServiceId, date: string): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null;
    return v && v.service === service && v.date === date && typeof v.section === 'string' ? v.section : null;
  } catch {
    return null;
  }
}
