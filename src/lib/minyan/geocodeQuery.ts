/**
 * Nominatim matches every query word literally, and Israeli OSM street names
 * don't include the generic word "רחוב" (or its abbreviations "רח'"/"רח׳"/"רח.").
 * So "רחוב שטרוק באר שבע" finds nothing while "שטרוק באר שבע" finds the street.
 * ("שדרות", "דרך", "סמטת" etc. ARE part of the official names — left alone.)
 *
 * Returns the query with those standalone tokens removed, or null when the
 * query contains none. The route only uses it as a retry after the original
 * query returned no results, so queries that already work are never altered.
 */
const STREET_WORD = /(^|[\s,])(?:ב?רחוב|ב?רח['׳".])(?=[\s,]|$)/g;

export function withoutStreetWord(q: string): string | null {
  if (!STREET_WORD.test(q)) return null;
  STREET_WORD.lastIndex = 0;
  const out = q
    .replace(STREET_WORD, '$1')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,]+|[\s,]+$/g, '');
  return out.length >= 2 && out !== q ? out : null;
}
