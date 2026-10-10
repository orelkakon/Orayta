'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Synagogue } from '@/types/minyan';
import type { Origin } from './useMinyanSearch';

/* Marker colors come from theme tokens via CSS classes — SVG presentation
   attributes can't resolve CSS variables, but stylesheet rules can. */
const Wrap = styled.div`
  position: relative; overflow: hidden;
  height: clamp(240px, 42svh, 400px);
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.sm};
  .leaflet-container { font-family: ${theme.fonts.ui}; }
  .mn-pin { stroke: ${theme.colors.surface}; stroke-width: 2; fill-opacity: 0.95; }
  .mn-verified { fill: ${theme.colors.success}; }
  .mn-reported { fill: ${theme.colors.secondary}; }
  .mn-unknown  { fill: ${theme.colors.surface}; stroke: ${theme.colors.textMuted}; stroke-width: 2; stroke-dasharray: 3 2; }
  .mn-selected { stroke: ${theme.colors.primary}; stroke-width: 3.5; stroke-dasharray: none; }
  .mn-you      { fill: ${theme.colors.primary}; stroke: ${theme.colors.surface}; stroke-width: 3; fill-opacity: 1; }
  .mn-range    { fill: ${theme.colors.primary}; fill-opacity: 0.04; stroke: ${theme.colors.primary}; stroke-opacity: 0.25; stroke-width: 1; }
`;

const ZOOM_FOR_RADIUS: Record<number, number> = { 1000: 15, 2000: 14, 5000: 13 };

function Viewport({ origin, radius, selected }: { origin: Origin; radius: number; selected: Synagogue | null }) {
  const map = useMap();
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <Viewport origin={origin} radius={radius} selected={selected} />
        <Circle center={[origin.lat, origin.lng]} radius={radius} pathOptions={{ className: 'mn-range', interactive: false }} />
        {synagogues.map(s => {
          const isSel = s.id === selectedId;
          return (
            <CircleMarker
              // className is only applied on creation, so remount when it changes.
              key={`${s.id}-${s.status}-${isSel}`}
              center={[s.lat, s.lng]}
              radius={isSel ? 11 : 8}
              pathOptions={{ className: `mn-pin mn-${s.status}${isSel ? ' mn-selected' : ''}` }}
              eventHandlers={{ click: () => onSelect(s.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span style={{ direction: 'rtl', fontWeight: 600 }}>{s.name ?? HE.MN_UNNAMED}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
        <CircleMarker center={[origin.lat, origin.lng]} radius={8} pathOptions={{ className: 'mn-you' }}>
          <Tooltip direction="top" offset={[0, -8]} permanent={false}>{HE.MN_MAP_YOU}</Tooltip>
        </CircleMarker>
      </MapContainer>
    </Wrap>
  );
}
