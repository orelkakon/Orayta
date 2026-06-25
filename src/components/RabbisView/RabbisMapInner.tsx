'use client';

import { Fragment, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/rabbisData';
import { extractLocations } from '@/lib/rabbiLocations';

const slideUp = keyframes`from { transform: translateY(100%); } to { transform: translateY(0); }`;

const Wrap = styled.div`
  position: relative;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.md};
  height: min(520px, calc(100svh - 200px));
`;

const HintBubble = styled.div`
  position: absolute; bottom: ${theme.spacing.lg}; left: 50%; transform: translateX(-50%);
  z-index: 1050; pointer-events: none;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(4px);
  border-radius: ${theme.radii.md}; padding: 5px ${theme.spacing.md};
  font-size: 0.75rem; color: ${theme.colors.textMuted};
  white-space: nowrap; box-shadow: ${theme.shadows.sm};
`;

const Sheet = styled.div<{ $open: boolean }>`
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 1100;
  background: ${theme.colors.surface};
  border-top: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  padding: ${theme.spacing.sm} ${theme.spacing.lg} ${theme.spacing.xl};
  max-height: 58%; overflow-y: auto;
  transform: translateY(${p => p.$open ? '0' : '102%'});
  transition: transform 0.28s cubic-bezier(.32,.72,0,1);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
`;

const Handle = styled.div`
  width: 38px; height: 4px; border-radius: 2px;
  background: ${theme.colors.borderLight}; margin: 4px auto ${theme.spacing.md};
`;

const CloseBtn = styled.button`
  position: absolute; top: ${theme.spacing.md}; left: ${theme.spacing.md};
  color: ${theme.colors.textMuted}; font-size: 1.1rem; padding: 2px 6px;
  border-radius: ${theme.radii.sm};
  &:hover { background: ${theme.colors.surfaceAlt}; color: ${theme.colors.text}; }
`;

const RName = styled.h3`
  font-size: 1.08rem; font-weight: 700; color: ${theme.colors.primary};
  margin-bottom: 2px; padding-left: ${theme.spacing.xl};
`;

const RFullName = styled.div`
  font-size: 0.78rem; color: ${theme.colors.textMuted}; font-style: italic;
  margin-bottom: ${theme.spacing.xs};
`;

const MetaRow = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  flex-wrap: wrap; margin-bottom: ${theme.spacing.sm};
`;

const CatBadge = styled.span<{ $c: string }>`
  font-size: 0.7rem; font-weight: 700;
  color: ${p => p.$c}; background: ${p => p.$c}18;
  border: 1px solid ${p => p.$c}44;
  border-radius: ${theme.radii.sm}; padding: 2px ${theme.spacing.sm};
`;

const DateSpan = styled.span`font-size: 0.76rem; color: ${theme.colors.textMuted};`;

const AliveBadge = styled.span`
  font-size: 0.7rem; font-weight: 600; color: ${theme.colors.success};
  background: ${theme.colors.bgSuccess}; border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
`;

const Bio = styled.p`
  font-size: 0.86rem; line-height: 1.75; color: ${theme.colors.text};
  border-right: 2px solid ${theme.colors.borderLight};
  padding-right: ${theme.spacing.sm};
`;

const LocationTag = styled.span`
  font-size: 0.68rem; color: ${theme.colors.textLight};
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.sm}; padding: 1px ${theme.spacing.sm};
`;

function jitter(lat: number, lng: number, idx: number, total: number): [number, number] {
  if (total <= 1) return [lat, lng];
  const ring = Math.floor(idx / 8);
  const posInRing = idx % 8;
  const countInRing = Math.min(8, total - ring * 8);
  const angle = (2 * Math.PI * posInRing) / countInRing;
  // Cap at 0.42° to prevent coastal dots from landing in the sea (~47km max offset)
  const r = Math.min(0.22 + ring * 0.2, 0.42);
  return [lat + r * Math.sin(angle), lng + r * Math.cos(angle)];
}

interface Placed { rabbi: Rabbi; dot: [number, number]; trail: [number, number] | null; color: string; location: string; }

export default function RabbisMapInner({ rabbis }: { rabbis: Rabbi[] }) {
  const [sel, setSel] = useState<Rabbi | null>(null);
  const [selLoc, setSelLoc] = useState('');

  const placed = useMemo((): Placed[] => {
    // Group by 1° grid so rabbis at the same region cluster and jitter together,
    // even if they matched different label strings (e.g. "ירושלים" vs "ארץ ישראל")
    const groups = new Map<string, Array<{ rabbi: Rabbi; locs: ReturnType<typeof extractLocations> }>>();
    for (const rabbi of rabbis) {
      const locs = extractLocations(rabbi.bio, rabbi.category);
      const primary = locs[0];
      if (!primary) continue;
      const key = `${Math.round(primary.lat)},${Math.round(primary.lng)}`;
      const g = groups.get(key) ?? [];
      g.push({ rabbi, locs });
      groups.set(key, g);
    }
    const result: Placed[] = [];
    for (const group of Array.from(groups.values())) {
      group.forEach(({ rabbi, locs }, idx) => {
        const primary = locs[0];
        if (!primary) return;
        const dot = jitter(primary.lat, primary.lng, idx, group.length);
        const trail = locs[1] ? [locs[1].lat, locs[1].lng] as [number, number] : null;
        const color = CATEGORY_COLORS[rabbi.category as RabbiCategory] ?? '#374151';
        result.push({ rabbi, dot, trail, color, location: primary.label });
      });
    }
    return result;
  }, [rabbis]);

  const handleClick = (p: Placed) => {
    setSel(prev => prev?.id === p.rabbi.id ? null : p.rabbi);
    setSelLoc(p.location);
  };

  return (
    <Wrap>
      <MapContainer center={[38, 22]} zoom={4} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
          subdomains="abcd"
          maxZoom={18}
        />
        {placed.map(p => (
          <Fragment key={p.rabbi.id}>
            {p.trail && (
              <Polyline
                positions={[p.dot, p.trail]}
                pathOptions={{ color: p.color, weight: 1.5, dashArray: '5 7', opacity: 0.5, interactive: false }}
              />
            )}
            <CircleMarker
              center={p.dot}
              radius={sel?.id === p.rabbi.id ? 11 : 8}
              pathOptions={{
                color: p.color, fillColor: p.color,
                fillOpacity: sel?.id === p.rabbi.id ? 1 : 0.82,
                weight: sel?.id === p.rabbi.id ? 2.5 : 1.5,
              }}
              eventHandlers={{ click: () => handleClick(p) }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, direction: 'rtl' }}>{p.rabbi.name}</span>
              </Tooltip>
            </CircleMarker>
          </Fragment>
        ))}
      </MapContainer>

      {!sel && <HintBubble>לחץ על נקודה לפרטי הרב</HintBubble>}

      <Sheet $open={!!sel}>
        <Handle />
        {sel && (
          <>
            <CloseBtn onClick={() => setSel(null)} aria-label="סגור">✕</CloseBtn>
            <RName>{sel.name}</RName>
            {sel.fullName && <RFullName>{sel.fullName}</RFullName>}
            <MetaRow>
              <CatBadge $c={CATEGORY_COLORS[sel.category as RabbiCategory] ?? '#374151'}>
                {CATEGORY_LABELS[sel.category as RabbiCategory] ?? sel.category}
              </CatBadge>
              <DateSpan>{sel.datePeriod}</DateSpan>
              {sel.isAlive && <AliveBadge>⬤ חי וקיים</AliveBadge>}
              {selLoc && <LocationTag>📍 {selLoc}</LocationTag>}
            </MetaRow>
            <Bio>{sel.bio}</Bio>
          </>
        )}
      </Sheet>
    </Wrap>
  );
}
