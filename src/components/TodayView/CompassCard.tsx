'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { GeoLocation, LocState } from './TodayView';

const JLM = { lat: 31.7767, lon: 35.2345 };

function toRad(d: number) { return d * Math.PI / 180; }
function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dL = toRad(lon2 - lon1);
  const y = Math.sin(dL) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dL);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;
const CardTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  font-family: ${theme.fonts.body};
  color: ${theme.colors.primary};
  align-self: flex-start;
`;
const CompassWrap = styled.div`position: relative; width: 190px; height: 190px;`;
const InfoRow = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  text-align: center;
`;
const InfoItem = styled.div`display: flex; flex-direction: column; gap: 2px;`;
const InfoVal = styled.span`font-size: 1.1rem; font-weight: 700; color: ${theme.colors.primary};`;
const InfoLabel = styled.span`font-size: 0.75rem; color: ${theme.colors.textMuted};`;
const Placeholder = styled.div`color: ${theme.colors.textMuted}; font-size: 0.9rem; text-align: center; padding: ${theme.spacing.lg};`;
const PermBtn = styled.button`
  font-size: 0.82rem;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
`;

type IOSOrientationEvt = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

interface Props { location: GeoLocation | null; locState: LocState; }

export default function CompassCard({ location, locState }: Props) {
  const [heading, setHeading] = useState<number | null>(null);
  const [iosPermission, setIosPermission] = useState(false);
  const cleanupRef = useRef<() => void>();

  const bearing = location ? calcBearing(location.lat, location.lon, JLM.lat, JLM.lon) : null;
  const distance = location ? calcDistance(location.lat, location.lon, JLM.lat, JLM.lon) : null;
  const needleAngle = bearing !== null ? (heading !== null ? bearing - heading : bearing) : 0;

  const startOrientation = () => {
    const handler = (e: DeviceOrientationEvent) => {
      const alpha = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ?? e.alpha;
      if (alpha !== null) setHeading(alpha);
    };
    window.addEventListener('deviceorientationabsolute' as 'deviceorientation', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    cleanupRef.current = () => {
      window.removeEventListener('deviceorientationabsolute' as 'deviceorientation', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  };

  useEffect(() => {
    const Evt = DeviceOrientationEvent as unknown as IOSOrientationEvt;
    if (typeof Evt.requestPermission === 'function') {
      setIosPermission(true);
    } else {
      startOrientation();
    }
    return () => cleanupRef.current?.();
  }, []);

  const requestIosPermission = async () => {
    const Evt = DeviceOrientationEvent as unknown as IOSOrientationEvt;
    if (typeof Evt.requestPermission === 'function') {
      const result = await Evt.requestPermission();
      if (result === 'granted') { setIosPermission(false); startOrientation(); }
    }
  };

  const c = 95; // center
  const r = 82; // ring radius
  const cardinals = [
    { label: 'צ', x: c, y: 12 }, { label: 'מז', x: 188, y: c + 4 },
    { label: 'ד', x: c, y: 188 }, { label: 'מע', x: 6, y: c + 4 },
  ];

  return (
    <Card>
      <CardTitle>{HE.TODAY_COMPASS_TITLE}</CardTitle>
      {locState !== 'granted' || bearing === null ? (
        <Placeholder>{locState === 'denied' ? HE.TODAY_LOCATION_DENIED : HE.LOADING}</Placeholder>
      ) : (
        <>
          <CompassWrap>
            <svg viewBox="0 0 190 190" width="190" height="190">
              <defs>
                <radialGradient id="cg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-surface-alt)" />
                  <stop offset="100%" stopColor="var(--color-surface)" />
                </radialGradient>
              </defs>
              <circle cx={c} cy={c} r={r + 8} fill="url(#cg)" stroke="var(--color-border)" strokeWidth="1.5" />
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i * 15 - 90) * Math.PI / 180;
                const len = i % 6 === 0 ? 12 : i % 3 === 0 ? 7 : 4;
                const x1 = c + r * Math.cos(a), y1 = c + r * Math.sin(a);
                const x2 = c + (r - len) * Math.cos(a), y2 = c + (r - len) * Math.sin(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-border)" strokeWidth={i % 6 === 0 ? 2 : 1} />;
              })}
              {cardinals.map(cd => (
                <text key={cd.label} x={cd.x} y={cd.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="600" fill="var(--color-text-muted)">{cd.label}</text>
              ))}
              <g transform={`rotate(${needleAngle}, ${c}, ${c})`} style={{ transition: heading !== null ? 'transform 0.3s ease' : 'none' }}>
                <polygon points={`${c},${c - 56} ${c - 7},${c + 6} ${c + 7},${c + 6}`} fill="var(--color-primary)" opacity="0.95" />
                <polygon points={`${c},${c + 52} ${c - 7},${c + 6} ${c + 7},${c + 6}`} fill="var(--color-border)" />
                <circle cx={c} cy={c} r="5" fill="var(--color-text)" />
                <circle cx={c} cy={c} r="2.5" fill="var(--color-surface)" />
              </g>
              <text x={c} y={c - 66} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--color-primary)">ירושלים</text>
            </svg>
          </CompassWrap>
          <InfoRow>
            <InfoItem>
              <InfoVal>{HE.TODAY_COMPASS_BEARING(bearing)}</InfoVal>
              <InfoLabel>כיוון מצפון</InfoLabel>
            </InfoItem>
            {distance !== null && (
              <InfoItem>
                <InfoVal>{HE.TODAY_COMPASS_DISTANCE(distance)}</InfoVal>
                <InfoLabel>מרחק לירושלים</InfoLabel>
              </InfoItem>
            )}
          </InfoRow>
          {iosPermission && (
            <PermBtn onClick={requestIosPermission}>{HE.TODAY_COMPASS_PERMISSION}</PermBtn>
          )}
        </>
      )}
    </Card>
  );
}
