'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, CircleMarker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { TILE_URL, TILE_ATTRIBUTION, TILE_MAX_ZOOM } from '@/lib/mapTiles';

/**
 * One map for every "near me" page: teardrop pins coloured by `tone`
 * (`approx` = dashed and faded), the search radius, and "you". Height comes
 * from --map-h set by the page layout.
 */
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: 'women' | 'men' | 'both' | 'unknown' | 'kever' | 'sched' | 'nosched';
  approx?: boolean;
}

/* Pin colours come from theme tokens via CSS classes (SVG presentation
   attributes can't resolve CSS variables, stylesheet rules can). */
const Wrap = styled.div`
  position: relative; overflow: hidden; isolation: isolate;
  height: var(--map-h, clamp(260px, 44svh, 420px));
  border-radius: 20px;
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
  background: ${theme.colors.surfaceAlt};
  .leaflet-container { font-family: ${theme.fonts.ui}; background: ${theme.colors.surfaceAlt}; }
  html[data-theme='dark'] & .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.88) saturate(0.55); }
  .nb-pin-wrap { background: none; border: none; }
  .nb-pin {
    display: block; width: 30px; height: 40px; color: ${theme.colors.primary};
    transform-origin: 50% 100%; transition: transform 0.2s ${theme.motion.outStrong};
    filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.28));
  }
  .nb-pin path { fill: currentColor; stroke: ${theme.colors.surface}; stroke-width: 2; }
  .nb-pin circle { fill: ${theme.colors.surface}; }
  .nb-pin.is-sel { transform: scale(1.3); }
  .nb-pin.is-approx { opacity: 0.7; }
  .nb-pin.is-approx path { stroke-dasharray: 3 2; }
  .nb-t-women { color: ${theme.colors.accent}; }
  .nb-t-men { color: ${theme.colors.primary}; }
  .nb-t-both { color: ${theme.colors.success}; }
  .nb-t-unknown, .nb-t-nosched { color: ${theme.colors.textMuted}; }
  .nb-t-sched { color: ${theme.colors.success}; }
  .nb-t-kever { color: ${theme.colors.gold}; }
  .nb-you { fill: ${theme.colors.primary}; stroke: ${theme.colors.surface}; stroke-width: 3; fill-opacity: 1; }
  .nb-range { fill: ${theme.colors.primary}; fill-opacity: 0.04; stroke: ${theme.colors.primary}; stroke-opacity: 0.25; stroke-width: 1; }
`;

const PIN_SVG = '<svg viewBox="0 0 30 40" width="30" height="40" aria-hidden="true"><path d="M15 38.5s11.5-11.7 11.5-22.2a11.5 11.5 0 1 0-23 0C3.5 26.8 15 38.5 15 38.5z"/><circle cx="15" cy="15.8" r="4.6"/></svg>';

function pinIcon(tone: MapPoint['tone'], selected: boolean, approx: boolean): L.DivIcon {
  const cls = ['nb-pin', `nb-t-${tone}`, selected ? 'is-sel' : '', approx ? 'is-approx' : ''].filter(Boolean).join(' ');
  return L.divIcon({ className: 'nb-pin-wrap', html: `<span class="${cls}">${PIN_SVG}</span>`, iconSize: [30, 40], iconAnchor: [15, 39] });
}

function Viewport({ center, radius, selected }: { center: [number, number]; radius: number; selected: MapPoint | null }) {
  const map = useMap();
  const [lat, lng] = center;
  const bounds = useRef(L.latLng(lat, lng).toBounds(radius * 2));
  bounds.current = L.latLng(lat, lng).toBounds(radius * 2);
  // The map can mount hidden (the list/map switch) or inside a still-settling
  // layout. Re-measure on every size change, and fit the search area the
  // first time it actually gets a size — otherwise Leaflet keeps a zero-size
  // view and leaves gray tile gaps.
  useEffect(() => {
    let sized = false;
    const sync = () => {
      map.invalidateSize();
      const s = map.getSize();
      const now = s.x > 0 && s.y > 0;
      if (now && !sized) map.fitBounds(bounds.current, { animate: false });
      sized = now;
    };
    const t = setTimeout(sync, 0);
    const ro = new ResizeObserver(sync);
    ro.observe(map.getContainer());
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  useEffect(() => {
    map.fitBounds(L.latLng(lat, lng).toBounds(radius * 2), { animate: true });
  }, [map, lat, lng, radius]);
  useEffect(() => {
    if (selected) map.panTo([selected.lat, selected.lng], { animate: true });
  }, [map, selected]);
  return null;
}

interface Props {
  center: [number, number];
  radius: number;
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  youLabel: string;
}

export default function NearbyMapInner({ center, radius, points, selectedId, onSelect, ariaLabel, youLabel }: Props) {
  const selected = points.find(p => p.id === selectedId) ?? null;
  const icons = useMemo(() => new Map(points.map(p => [p.id, pinIcon(p.tone, p.id === selectedId, !!p.approx)])), [points, selectedId]);
  return (
    <Wrap role="region" aria-label={ariaLabel}>
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <Viewport center={center} radius={radius} selected={selected} />
        <Circle center={center} radius={radius} className="nb-range" interactive={false} />
        <CircleMarker center={center} radius={8} className="nb-you" interactive={false} aria-label={youLabel} />
        {points.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icons.get(p.id)!}
            title={p.label}
            alt={p.label}
            zIndexOffset={p.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p.id) }}
          />
        ))}
      </MapContainer>
    </Wrap>
  );
}
