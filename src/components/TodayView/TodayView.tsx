'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import PageHeader from '@/components/ui/PageHeader';
import ZmanimCard from './ZmanimCard';
import HebrewCalendarCard from './HebrewCalendarCard';
import CompassCard from './CompassCard';
import DafYomiCard from './DafYomiCard';
import OmerTodayCard from './OmerTodayCard';
import EventsCard from './EventsCard';
import PushOptInCard from '@/components/Notifications/PushOptInCard';
import DailySection from './DailySection';
import ShabbatTimes from './ShabbatTimes';
import PlaceChip from './PlaceChip';
import { placeFromGps, readPlace, savePlace } from '@/lib/myPlace';
import { useMyPlace } from '@/components/Place/useMyPlace';

export interface GeoLocation { lat: number; lon: number; tz: string; }
export type LocState = 'loading' | 'granted' | 'denied';

/**
 * "יומי": the day at a glance — zmanim, events, the omer in season, the
 * Hebrew calendar and the direction to Jerusalem, then today in Orayta
 * (#daily, linked from home), and the external learning cycles last.
 */
const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.lg}; align-items: start;
  ${theme.up.md} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const ParashaLink = styled(Link)`
  color: ${theme.colors.secondary}; font-weight: 600;
  text-decoration: underline dotted; text-underline-offset: 3px;
`;

const Col = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;`;

interface ShabbatItem { title: string; category: string; }
interface ShabbatResp { items?: ShabbatItem[]; }

export default function TodayView() {
  const { place, ready } = useMyPlace();
  const [gpsLocation, setGpsLocation] = useState<GeoLocation | null>(null);
  const [gpsState, setGpsState] = useState<LocState>('loading');
  // "המקום שלי" wins; without one, ask the browser once and keep the answer as the place.
  const location: GeoLocation | null = place ? { lat: place.lat, lon: place.lng, tz: place.tz } : gpsLocation;
  const locState: LocState = place ? 'granted' : gpsState;
  const [hebrewDate, setHebrewDate] = useState('');
  const [parasha, setParasha] = useState('');

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const d = new Date(dateStr + 'T12:00:00');
    const y = d.getFullYear(), mo = d.getMonth() + 1, dd = d.getDate();
    setHebrewDate(formatHebrewDate(d, true));
    void fetch(`https://www.hebcal.com/shabbat?cfg=json&gy=${y}&gm=${mo}&gd=${dd}&m=50&lg=he&i=on`)
      .then(r => r.json() as Promise<ShabbatResp>)
      .then(sh => {
        const p = sh.items?.find(i => i.category === 'parashat');
        if (p) setParasha(p.title);
      }).catch(() => {});
  }, [dateStr]);

  const dayIdx = today.getDay();
  const weekday = dayIdx === 6 ? HE.TODAY_SHABBAT : HE.TODAY_WEEKDAY(HE.TODAY_DAYS[dayIdx]);
  // The parasha links to its page (/parasha).
  const subtitle = hebrewDate
    ? <>{hebrewDate} · {weekday}{parasha && <> · <ParashaLink href="/parasha">{parasha}</ParashaLink></>}</>
    : HE.TODAY_SUBTITLE;

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsState('denied');
      return;
    }
    setGpsState('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setGpsLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, tz });
        setGpsState('granted');
        if (!readPlace()) savePlace(placeFromGps(pos.coords.latitude, pos.coords.longitude, tz));
      },
      () => setGpsState('denied'),
      { timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (ready && !readPlace()) requestLocation();
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <PageHeader icon="calendar" title={HE.TODAY_TITLE} subtitle={subtitle} />
      {place && <PlaceChip place={place} />}
      {dayIdx === 5 && ready && <ShabbatTimes date={dateStr} place={place} />}
      <Grid>
        <Col>
          <ZmanimCard location={location} locState={locState} date={dateStr} onRetry={requestLocation} />
          <EventsCard date={dateStr} />
          <OmerTodayCard />
        </Col>
        <Col>
          <HebrewCalendarCard date={dateStr} />
          <CompassCard location={location} locState={locState} onRetry={requestLocation} />
          <PushOptInCard />
        </Col>
      </Grid>
      <DailySection />
      <DafYomiCard />
    </Container>
  );
}
