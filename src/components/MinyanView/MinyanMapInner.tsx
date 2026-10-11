'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TILE_URL, TILE_ATTRIBUTION, TILE_MAX_ZOOM } from '@/lib/mapTiles';
import type { Synagogue } from '@/types/minyan';
import type { Origin } from './useMinyanSearch';

/* Marker colors come from theme tokens via CSS classes — SVG presentation
   attributes can't resolve CSS variables, but stylesheet rules can.
   Filled = a source publishes prayer times; hollow = times unknown;
   dashed outline = low reliability of the location itself. */
const Wrap = styled.div`
  position: relative; overflow: hidden;
  height: clamp(240px, 42svh, 400px);
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.sm};
  .leaflet-container { font-family: ${theme.fonts.ui}; }
  .mn-pin   { stroke: ${theme.colors.primary}; stroke-width: 2; fill-opacity: 1; }
  .mn-sched { fill: ${theme.colors.success}; stroke: ${theme.colors.surface}; }
  .mn-nosched { fill: ${theme.colors.surface}; }
  .mn-ex-low { stroke-dasharray: 3 2; }
  .mn-selected { stroke: ${theme.colors.accent}; stroke-width: 4; stroke-dasharray: none; }
  .mn-you   { fill: ${theme.colors.primary}; stroke: ${theme.colors.surface}; stroke-width: 3; fill-opacity: 1; }
  .mn-range { fill: ${theme.colors.primary}; fill-opacity: 0.04; stroke: ${theme.colors.primary}; stroke-opacity: 0.25; stroke-width: 1; }
`;

const ZOOM_FOR_RADIUS: Record<number, number> = { 1000: 15, 2000: 14, 5000: 13 };

function Viewport({ origin, radius, selected }: { origin: Origin; radius: number; selected: Synagogue | null }) {
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
  useEffect(() => {
    map.setView([origin.lat, origin.lng], ZOOM_FOR_RADIUS[radius] ?? 14, { animate: true });
  }, [map, origin.lat, origin.lng, radius]);
  useEffect(() => {
    if (selected) map.panTo([selected.lat, selected.lng], { animate: true });
  }, [map, selected]);
  return null;
}

interface Props {
  origin: Origin;
  radius: number;
  synagogues: Synagogue[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function MinyanMapInner({ origin, radius, synagogues, selectedId, onSelect }: Props) {
  const selected = synagogues.find(s => s.id === selectedId) ?? null;
  return (
    <Wrap role="region" aria-label={HE.MN_ARIA_MAP}>
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={ZOOM_FOR_RADIUS[radius] ?? 14}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <Viewport origin={origin} radius={radius} selected={selected} />
        <Circle center={[origin.lat, origin.lng]} radius={radius} className="mn-range" interactive={false} />
        {synagogues.map(s => {
          const isSel = s.id === selectedId;
          const cls = ['mn-pin', s.schedule ? 'mn-sched' : 'mn-nosched', s.existence.level === 'low' ? 'mn-ex-low' : '', isSel ? 'mn-selected' : '']
            .filter(Boolean).join(' ');
          return (
            <CircleMarker
              // Leaflet reads className only at creation (setStyle ignores it), so it
              // must be a creation prop — not pathOptions — and changes remount.
              key={`${s.id}-${cls}`}
              center={[s.lat, s.lng]}
              radius={isSel ? 11 : 8}
              className={cls}
              eventHandlers={{ click: () => onSelect(s.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span style={{ direction: 'rtl', fontWeight: 600 }}>{s.name ?? HE.MN_UNNAMED}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
        <CircleMarker center={[origin.lat, origin.lng]} radius={8} className="mn-you">
          <Tooltip direction="top" offset={[0, -8]}>{HE.MN_MAP_YOU}</Tooltip>
        </CircleMarker>
      </MapContainer>
    </Wrap>
  );
}
