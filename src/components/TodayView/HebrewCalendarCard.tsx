'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { buildHebMonth, addDays, fromISO, toISO } from '@/lib/hebrewMonth';
import CalendarGrid, { CalEvent, EVENT_COLORS } from './CalendarGrid';

interface HebItem { title: string; date: string; category: string; hebrew?: string; }
interface HebResp { items?: HebItem[]; }

const SHOWN = new Set(Object.keys(HE.TODAY_CAL_CATEGORIES));

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-weight: 700; font-size: 1rem;
  font-family: ${theme.fonts.body};
`;

const Toolbar = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md} 0;
`;

const MonthTitle = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.05rem; font-weight: 700; color: ${theme.colors.text};
  flex: 1; min-width: 0;
`;

const NavBtn = styled.button`
  width: 30px; height: 30px; border-radius: ${theme.radii.sm};
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface};
  cursor: pointer; transition: background 0.15s;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const TodayBtn = styled(NavBtn)`
  width: auto; padding: 0 10px; font-size: 0.78rem;
  &:disabled { opacity: 0.45; cursor: default; background: ${theme.colors.surface}; }
`;

const Footer = styled.div`
  border-top: 1px solid ${theme.colors.borderLight};
  padding: ${theme.spacing.sm} ${theme.spacing.lg} ${theme.spacing.md};
  display: flex; flex-direction: column; gap: 4px;
`;

const FooterDate = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 0.82rem; font-weight: 700; color: ${theme.colors.textMuted};
`;

const EventRow = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

const EventName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
  min-width: 0;
`;

const Badge = styled.span<{ $cat: string }>`
  flex-shrink: 0; font-size: 0.7rem; font-weight: 700;
  padding: 2px 7px; border-radius: 10px;
  color: ${({ $cat }) => EVENT_COLORS[$cat] ?? theme.colors.textMuted};
  background: ${({ $cat }) => (EVENT_COLORS[$cat] ?? theme.colors.textMuted) + '18'};
  border: 1px solid ${({ $cat }) => (EVENT_COLORS[$cat] ?? theme.colors.textMuted) + '40'};
`;

const NoEvents = styled.div`
  font-size: 0.82rem; color: ${theme.colors.textLight};
`;

const Empty = styled.div`
  padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted};
  text-align: center; font-size: 0.9rem;
`;

interface Props { date: string; }

/** Full Hebrew month calendar: navigable months, holidays, parasha and fasts. */
export default function HebrewCalendarCard({ date }: Props) {
  const [anchorISO, setAnchorISO] = useState(date);
  const [selectedISO, setSelectedISO] = useState(date);
  const [events, setEvents] = useState<Record<string, CalEvent[]>>({});
  const [error, setError] = useState(false);

  const grid = useMemo(() => buildHebMonth(fromISO(anchorISO)), [anchorISO]);

  useEffect(() => {
    if (!grid) return;
    const url = 'https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&mf=on&ss=on&s=on'
      + `&start=${grid.startISO}&end=${grid.endISO}&lg=he&i=on`;
    void fetch(url)
      .then(r => r.json() as Promise<HebResp>)
      .then(data => {
        const byDate: Record<string, CalEvent[]> = {};
        (data.items ?? []).forEach(item => {
          if (!SHOWN.has(item.category)) return;
          const iso = item.date.slice(0, 10);
          (byDate[iso] ??= []).push({ title: item.hebrew ?? item.title, category: item.category });
        });
        setEvents(byDate);
        setError(false);
      })
      .catch(() => setError(true));
  }, [grid?.startISO, grid?.endISO]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!grid) {
    return (
      <Card>
        <CardHeader>{HE.TODAY_HEBCAL_TITLE}</CardHeader>
        <Empty>{HE.TODAY_ERROR}</Empty>
      </Card>
    );
  }

  const onCurrentMonth = date >= grid.startISO && date <= grid.endISO;
  const goToday = () => { setAnchorISO(date); setSelectedISO(date); };
  const dayEvents = events[selectedISO] ?? [];

  return (
    <Card>
      <CardHeader>{HE.TODAY_HEBCAL_TITLE}</CardHeader>
      <Toolbar>
        <MonthTitle>{grid.title}</MonthTitle>
        <TodayBtn onClick={goToday} disabled={onCurrentMonth && selectedISO === date}>
          {HE.TODAY_CAL_TODAY_BTN}
        </TodayBtn>
        <NavBtn aria-label={HE.TODAY_CAL_PREV} onClick={() => setAnchorISO(toISO(addDays(fromISO(grid.startISO), -1)))}>
          ›
        </NavBtn>
        <NavBtn aria-label={HE.TODAY_CAL_NEXT} onClick={() => setAnchorISO(toISO(addDays(fromISO(grid.endISO), 1)))}>
          ‹
        </NavBtn>
      </Toolbar>
      <CalendarGrid
        grid={grid}
        events={events}
        todayISO={date}
        selectedISO={selectedISO}
        onSelect={setSelectedISO}
      />
      <Footer>
        <FooterDate>{formatHebrewDate(fromISO(selectedISO), true)} · {selectedISO.split('-').reverse().map(Number).join('.')}</FooterDate>
        {error && <NoEvents>{HE.TODAY_ERROR}</NoEvents>}
        {!error && dayEvents.length === 0 && <NoEvents>{HE.TODAY_CAL_NO_EVENTS}</NoEvents>}
        {dayEvents.map((ev, i) => (
          <EventRow key={`${ev.title}-${i}`}>
            <Badge $cat={ev.category}>{HE.TODAY_CAL_CATEGORIES[ev.category] ?? ev.category}</Badge>
            <EventName>{ev.title}</EventName>
          </EventRow>
        ))}
      </Footer>
    </Card>
  );
}
