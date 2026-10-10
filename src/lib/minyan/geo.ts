/* Geo + navigation helpers for מניין קרוב (pure, client- and server-safe). */
import type { DayType, MinyanTime, PrayerService } from '@/types/minyan';
import { toMinutes } from './confidence';

const EARTH_R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in meters. */
export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

export function isValidCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export const RADIUS_OPTIONS_M = [1000, 2000, 5000] as const;
export const DEFAULT_RADIUS_M = 2000;

export function clampRadius(r: number): number {
  return (RADIUS_OPTIONS_M as readonly number[]).includes(r) ? r : DEFAULT_RADIUS_M;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function wazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

/** tel: href for a display phone, or null if it has too few digits to dial. */
export function telHref(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.replace(/\D/g, '').length >= 7 ? `tel:${cleaned}` : null;
}

/** Day type for "now" — Saturday counts as Shabbat, every other day as a weekday. */
export function dayTypeFor(date: Date): DayType {
  return date.getDay() === 6 ? 'shabbat' : 'weekday';
}

export interface NextPrayer { service: PrayerService; time: string; minutesUntil: number; }

/**
 * The next not-disputed minyan later today (within `horizonMin`), or null.
 * Used for the "next prayer" hint on each card — only from reported times.
 */
export function nextPrayer(times: MinyanTime[], now: Date, horizonMin = 180): NextPrayer | null {
  const day = dayTypeFor(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let best: NextPrayer | null = null;
  for (const t of times) {
    if (t.dayType !== day || t.level === 'disputed') continue;
    const diff = toMinutes(t.time) - nowMin;
    if (diff < 0 || diff > horizonMin) continue;
    if (!best || diff < best.minutesUntil) best = { service: t.service, time: t.time, minutesUntil: diff };
  }
  return best;
}
