'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { TILE_URL, TILE_ATTRIBUTION, TILE_MAX_ZOOM } from '@/lib/mapTiles';

/** One marker. `tone` picks its colour class; `approx` draws a dashed outline. */
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: 'women' | 'men' | 'both' | 'unknown' | 'kever';
  approx?: boolean;
}

/* Marker colours come from theme tokens via CSS classes — SVG presentation
   attributes can't resolve CSS variables, but stylesheet rules can. */
const Wrap = styled.div`
  position: relative; overflow: hidden;
  height: clamp(240px, 42svh, 400px);
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.sm};
  .leaflet-container { font-family: ${theme.fonts.ui}; }
  .nb-pin { stroke: ${theme.colors.surface}; stroke-width: 2.5; fill-opacity: 1; }
  .nb-women { fill: ${theme.colors.accent}; }
  .nb-men { fill: ${theme.colors.primary}; }
  .nb-both { fill: ${theme.colors.success}; }
  .nb-unknown { fill: ${theme.colors.textMuted}; }
  .nb-kever { fill: ${theme.colors.secondary}; stroke: ${theme.colors.primary}; stroke-width: 2; }
  .nb-approx { fill-opacity: 0.55; stroke: ${theme.colors.text}; stroke-dasharray: 3 2; stroke-width: 1.5; }
  .nb-selected { stroke: ${theme.colors.text}; stroke-width: 4; stroke-dasharray: none; }
  .nb-you { fill: ${theme.colors.primary}; stroke: ${theme.colors.surface}; stroke-width: 3; fill-opacity: 1; }
  .nb-range { fill: ${theme.colors.primary}; fill-opacity: 0.04; stroke: ${theme.colors.primary}; stroke-opacity: 0.25; stroke-width: 1; }
`;

function Viewport({ center, radius, selected }: { center: [number, number]; radius: number; selected: MapPoint | null }) {
  const map = useMap();
  // The map mounts inside a lazily-loaded, still-settling layout; without a
  // re-measure Leaflet keeps its first (wrong) size and leaves gray tile gaps.
  useEffect(() => {
    const el = map.getContainer();
    const t = setTimeout(() => map.invalidateSize(), 0);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  const [lat, lng] = center;
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
  return (
    <Wrap role="region" aria-label={ariaLabel}>
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <Viewport center={center} radius={radius} selected={selected} />
        <Circle center={center} radius={radius} className="nb-range" interactive={false} />
        {points.map(p => {
          const isSel = p.id === selectedId;
          const cls = ['nb-pin', `nb-${p.tone}`, p.approx ? 'nb-approx' : '', isSel ? 'nb-selected' : ''].filter(Boolean).join(' ');
          return (
            <CircleMarker
              // Leaflet reads className only at creation (setStyle ignores it), so
              // it must be a creation prop and changes remount the marker.
              key={`${p.id}-${cls}`}
              center={[p.lat, p.lng]}
              radius={isSel ? 12 : 9}
              className={cls}
              eventHandlers={{ click: () => onSelect(p.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span style={{ direction: 'rtl', fontWeight: 600 }}>{p.label}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
        <CircleMarker center={center} radius={8} className="nb-you">
          <Tooltip direction="top" offset={[0, -8]}>{youLabel}</Tooltip>
        </CircleMarker>
      </MapContainer>
    </Wrap>
  );
}
