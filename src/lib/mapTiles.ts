/**
 * Raster basemap shared by every Leaflet map on the site.
 *
 * Default: OpenStreetMap's standard tiles — no key, labels in local script
 * (Hebrew in Israel). Allowed for third-party sites under the OSMF tile usage
 * policy (operations.osmfoundation.org/policies/tiles) with attribution and a
 * valid Referer, for light, interactive use only (no bulk/offline download).
 *
 * The previous provider (CARTO basemaps) now returns an "API KEY REQUIRED"
 * image for every tile. To switch providers without code changes — e.g.
 * CARTO with a free key, if traffic outgrows OSMF's community servers — set:
 *   NEXT_PUBLIC_MAP_TILE_URL, NEXT_PUBLIC_MAP_TILE_ATTRIBUTION
 */
export const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION
  ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const TILE_MAX_ZOOM = 19;
