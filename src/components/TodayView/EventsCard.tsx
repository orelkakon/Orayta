'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

interface HebItem { title: string; date: string; category: string; hebrew?: string; memo?: string; }
interface HebResp { items: HebItem[]; }

const CATEGORY_COLORS: Record<string, string> = {
  holiday:    'var(--color-accent)',
  roshchodesh:'var(--color-secondary)',
  parashat:   'var(--color-primary)',
  omer:       'var(--color-text-muted)',
  mevarchim:  'var(--color-primary-light)',
  shabbat:    'var(--color-primary)',
};
const CATEGORY_LABELS: Record<string, string> = {
  holiday:    'חג',
  roshchodesh:'ר״ח',
  parashat:   'פרשה',
  omer:       'עומר',
  mevarchim:  'מברכים',
  shabbat:    'שבת',
};

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
const Body = styled.div`display: flex; flex-direction: column;`;
const EventRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const EventName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;
const NameHe = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text};
  overflow-wrap: break-word;
`;
const Memo = styled.span`font-size: 0.8rem; color: ${theme.colors.textMuted};`;
const Badge = styled.span<{ $cat: string }>`
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  color: ${({ $cat }) => CATEGORY_COLORS[$cat] ?? theme.colors.textMuted};
  background: ${({ $cat }) => (CATEGORY_COLORS[$cat] ?? theme.colors.textMuted) + '18'};
  border: 1px solid ${({ $cat }) => (CATEGORY_COLORS[$cat] ?? theme.colors.textMuted) + '40'};
`;
const Empty = styled.div`
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  text-align: center;
  font-size: 0.9rem;
`;

const SKIP = new Set(['parashat']); // shown in DafYomiCard

interface Props { date: string; }

export default function EventsCard({ date }: Props) {
  const [events, setEvents] = useState<HebItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const d = new Date(date + 'T12:00:00');
    const year = d.getFullYear(), month = d.getMonth() + 1;
    fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&nx=on&mf=on&ss=on&omer=on&year=${year}&month=${month}&gy=gregorian&lg=he`)
      .then(r => r.json())
      .then((data: HebResp) => {
        const today = (data.items ?? []).filter(
          item => item.date.startsWith(date) && !SKIP.has(item.category)
        );
        setEvents(today);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [date]);

  return (
    <Card>
      <CardHeader>{HE.TODAY_EVENTS_TITLE}</CardHeader>
      <Body>
        {loading && <Empty>{HE.LOADING}</Empty>}
        {error && <Empty>{HE.TODAY_ERROR}</Empty>}
        {!loading && !error && events.length === 0 && (
          <Empty>{HE.TODAY_EVENTS_EMPTY}</Empty>
        )}
        {!loading && !error && events.map((ev, i) => (
          <EventRow key={i}>
            <EventName>
              <NameHe>{ev.hebrew ?? ev.title}</NameHe>
              {ev.memo && <Memo>{ev.memo}</Memo>}
            </EventName>
            <Badge $cat={ev.category}>
              {CATEGORY_LABELS[ev.category] ?? ev.category}
            </Badge>
          </EventRow>
        ))}
      </Body>
    </Card>
  );
}
