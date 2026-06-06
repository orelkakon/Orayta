'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { GeoLocation, LocState } from './TodayView';

interface ZmanimTimes {
  alotHaShachar?: string;
  sunrise?: string;
  sofZmanShma?: string;
  sofZmanTfilla?: string;
  chatzot?: string;
  minchaGedola?: string;
  plagHaMincha?: string;
  sunset?: string;
  tzeit7083deg?: string;
  dusk?: string;
}
interface HebcalZmanim { times: ZmanimTimes; }

const ENTRIES: { key: keyof ZmanimTimes; label: string }[] = [
  { key: 'alotHaShachar',  label: HE.TODAY_ALOT },
  { key: 'sunrise',        label: HE.TODAY_SUNRISE },
  { key: 'sofZmanShma',    label: HE.TODAY_SHMA },
  { key: 'sofZmanTfilla',  label: HE.TODAY_TFILLA },
  { key: 'chatzot',        label: HE.TODAY_CHATZOT },
  { key: 'minchaGedola',   label: HE.TODAY_MINCHA_GEDOLA },
  { key: 'plagHaMincha',   label: HE.TODAY_PLAG },
  { key: 'sunset',         label: HE.TODAY_SUNSET },
  { key: 'tzeit7083deg',   label: HE.TODAY_TZEIT },
];

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;
const CardHeader = styled.div`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-weight: 700;
  font-size: 1rem;
  font-family: ${theme.fonts.body};
`;
const List = styled.div`display: flex; flex-direction: column;`;
const Row = styled.div<{ $past: boolean; $next: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  border-inline-start: 3px solid ${({ $next }) => $next ? theme.colors.secondary : 'transparent'};
  background: ${({ $next }) => $next ? theme.colors.surfaceAlt : 'transparent'};
  opacity: ${({ $past }) => $past ? 0.4 : 1};
  transition: opacity 0.2s;
  &:last-child { border-bottom: none; }
`;
const Label = styled.span<{ $next: boolean }>`
  font-size: 0.9rem;
  color: ${({ $next }) => $next ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ $next }) => $next ? '700' : '400'};
`;
const Time = styled.span<{ $next: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ $next }) => $next ? theme.colors.secondary : theme.colors.textMuted};
  direction: ltr;
`;
const NextBadge = styled.span`
  font-size: 0.68rem;
  background: ${theme.colors.secondary};
  color: white;
  border-radius: 10px;
  padding: 1px 6px;
  margin-inline-end: ${theme.spacing.xs};
`;
const Placeholder = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  line-height: 1.6;
`;
const LocBtn = styled.button`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.sm};
  font-size: 0.85rem;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

interface Props { location: GeoLocation | null; locState: LocState; date: string; }

export default function ZmanimCard({ location, locState, date }: Props) {
  const [times, setTimes] = useState<ZmanimTimes | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!location) return;
    const { lat, lon, tz } = location;
    fetch(`https://www.hebcal.com/zmanim?cfg=json&date=${date}&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(tz)}`)
      .then(r => r.json())
      .then((d: HebcalZmanim) => setTimes(d.times))
      .catch(() => setError(true));
  }, [location, date]);

  const rows = ENTRIES.map(e => ({
    ...e,
    dt: times?.[e.key] ? new Date(times[e.key]!) : null,
  })).filter(e => e.dt);

  const nextIdx = rows.findIndex(e => e.dt! > now);

  return (
    <Card>
      <CardHeader>{HE.TODAY_ZMANIM_TITLE}</CardHeader>
      {locState === 'denied' && (
        <Placeholder>{HE.TODAY_LOCATION_DENIED}</Placeholder>
      )}
      {locState === 'loading' && (
        <Placeholder>{HE.LOADING}</Placeholder>
      )}
      {locState === 'granted' && error && (
        <Placeholder>{HE.TODAY_ERROR}</Placeholder>
      )}
      {locState === 'granted' && !error && times && (
        <List>
          {rows.map((e, i) => {
            const isPast = i < nextIdx || (nextIdx === -1 && i < rows.length);
            const isNext = i === nextIdx;
            return (
              <Row key={e.key} $past={isPast} $next={isNext}>
                <Label $next={isNext}>
                  {isNext && <NextBadge>עכשיו</NextBadge>}
                  {e.label}
                </Label>
                <Time $next={isNext}>{fmt(e.dt!.toISOString())}</Time>
              </Row>
            );
          })}
        </List>
      )}
      {locState === 'granted' && !error && !times && (
        <Placeholder>{HE.LOADING}</Placeholder>
      )}
    </Card>
  );
}
