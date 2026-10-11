/* Geo + navigation helpers for מניין קרוב (pure, client- and server-safe). */
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

/**
 * Outbound link to the Nedarim Plus national prayer-times directory for the
 * same area. It's a link to their public page (opened in a new tab), not a
 * data integration — they offer no documented API for this data.
 * Their page accepts 0.5–3 km.
 */
export function nedarimAreaUrl(lat: number, lng: number, radiusM: number): string {
  const km = Math.min(3, Math.max(0.5, radiusM / 1000));
  return `https://www.matara.pro/nedarimplus/Zmanim/result.html?radius=${km}&lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`;
}
