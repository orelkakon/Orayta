'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { GeoLocation, LocState } from './TodayView';
import { ENTRIES, fmt, nextDay, HebcalZmanim, ZmanimTimes } from './zmanimEntries';
import { Card, CardHeader } from './todayCardStyles';

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
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;
const DeniedHelp = styled.p`font-size: 0.8rem; color: ${theme.colors.textLight}; direction: rtl;`;
const RetryBtn = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.lg};
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.sm};
  font-size: 0.85rem;
  transition: all ${theme.motion.fast} ease;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:active { transform: scale(0.96); }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const Spinner = styled.span`
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation-duration: 2.4s; }
`;

const LoadingBox = styled.div`
  min-height: 120px;
  display: flex; align-items: center; justify-content: center;
`;

interface Props { location: GeoLocation | null; locState: LocState; date: string; onRetry: () => void; }

export default function ZmanimCard({ location, locState, date, onRetry }: Props) {
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
    const get = (d: string) =>
      fetch(`https://www.hebcal.com/zmanim?cfg=json&date=${d}&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(tz)}`)
        .then(r => r.json() as Promise<HebcalZmanim>);
    /* hebcal's chatzotNight for a date is the night *before* it — tonight's
       חצות הלילה (between today's sunset and tomorrow's sunrise) comes from
       tomorrow's response. Without it the card still shows the day's zmanim. */
    Promise.all([get(date), get(nextDay(date)).catch(() => null)])
      .then(([today, tomorrow]) => setTimes({ ...today.times, chatzotNight: tomorrow?.times.chatzotNight }))
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
        <Placeholder>
          <span>{HE.TODAY_LOCATION_DENIED}</span>
          <DeniedHelp>{HE.TODAY_LOCATION_DENIED_HELP}</DeniedHelp>
          <RetryBtn onClick={onRetry}>{HE.TODAY_LOCATION_RETRY}</RetryBtn>
        </Placeholder>
      )}
      {locState === 'loading' && (
        <LoadingBox role="status" aria-label={HE.LOADING}><Spinner aria-hidden="true" /></LoadingBox>
      )}
      {locState === 'granted' && error && (
        <Placeholder>{HE.TODAY_ERROR}</Placeholder>
      )}
      {locState === 'granted' && !error && times && (
        <List>
          {rows.map((e, i) => {
            /* nextIdx === -1 means every zman has passed — dimming all rows
               makes the card look broken, so keep them at full opacity. */
            const isPast = nextIdx !== -1 && i < nextIdx;
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
        <LoadingBox role="status" aria-label={HE.LOADING}><Spinner aria-hidden="true" /></LoadingBox>
      )}
    </Card>
  );
}
