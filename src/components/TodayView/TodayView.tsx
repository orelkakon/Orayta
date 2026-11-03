'use client';

import { useState, useEffect } from 'react';
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

export interface GeoLocation { lat: number; lon: number; tz: string; }
export type LocState = 'loading' | 'granted' | 'denied';

/**
 * "יומי": the day at a glance. Phones read top-down in order of urgency —
 * zmanim, today's learning, the omer in season, today in Orayta, then the
 * calendar tools. From tablet width the cards flow into two columns.
 */
const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.lg}; align-items: start;
  ${theme.up.md} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Col = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;`;

interface ShabbatItem { title: string; category: string; }
interface ShabbatResp { items?: ShabbatItem[]; }

export default function TodayView() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locState, setLocState] = useState<LocState>('loading');
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
  const subtitle = hebrewDate ? `${hebrewDate} · ${HE.TODAY_DAY_LINE(weekday, parasha)}` : HE.TODAY_SUBTITLE;

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocState('denied');
      return;
    }
    setLocState('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setLocState('granted');
      },
      () => setLocState('denied'),
      { timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => { requestLocation(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <PageHeader icon="calendar" title={HE.TODAY_TITLE} subtitle={subtitle} />
      {dayIdx === 5 && <ShabbatTimes date={dateStr} />}
      <Grid>
        <Col>
          <ZmanimCard location={location} locState={locState} date={dateStr} onRetry={requestLocation} />
          <EventsCard date={dateStr} />
          <CompassCard location={location} locState={locState} onRetry={requestLocation} />
        </Col>
        <Col>
          <OmerTodayCard />
          <DafYomiCard />
          <PushOptInCard />
          <HebrewCalendarCard date={dateStr} />
        </Col>
      </Grid>
      <DailySection />
    </Container>
  );
}
