'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import ZmanimCard from './ZmanimCard';
import CompassCard from './CompassCard';
import DafYomiCard from './DafYomiCard';
import EventsCard from './EventsCard';

export interface GeoLocation { lat: number; lon: number; tz: string; }
export type LocState = 'loading' | 'granted' | 'denied';

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const Header = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const Title = styled.h1`font-size: 1.8rem; color: ${theme.colors.primary};`;

const HebrewDate = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.5rem;
  color: ${theme.colors.secondary};
  font-weight: 600;
  line-height: 1.3;
`;

const Subtitle = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted};`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  align-items: start;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const Col = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

interface HebDate { hebrew: string; }

export default function TodayView() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locState, setLocState] = useState<LocState>('loading');
  const [hebrewDate, setHebrewDate] = useState('');

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetch(`https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`)
      .then(r => r.json())
      .then((d: HebDate) => setHebrewDate(d.hebrew))
      .catch(() => {});
  }, [dateStr]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocState('denied');
      return;
    }
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
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return (
    <Container>
      <Header>
        <Title>{HE.TODAY_TITLE}</Title>
        {hebrewDate && <HebrewDate>{hebrewDate}</HebrewDate>}
        <Subtitle>{HE.TODAY_SUBTITLE}</Subtitle>
      </Header>
      <Grid>
        <Col>
          <ZmanimCard location={location} locState={locState} date={dateStr} />
          <CompassCard location={location} locState={locState} />
        </Col>
        <Col>
          <DafYomiCard />
          <EventsCard date={dateStr} />
        </Col>
      </Grid>
    </Container>
  );
}
