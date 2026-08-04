'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';

interface HebItem { title: string; date: string; category: string; hebrew?: string; }
interface HebResp { items?: HebItem[]; }

const CATEGORY_COLORS: Record<string, string> = {
  holiday:    'var(--color-accent)',
  roshchodesh:'var(--color-secondary)',
  fast:       '#8b3a3a',
  mevarchim:  'var(--color-primary-light)',
};
const CATEGORY_LABELS: Record<string, string> = {
  holiday:    'חג',
  roshchodesh:'ר״ח',
  fast:       'צום',
  mevarchim:  'מברכים',
};

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
  font-weight: 700;
  font-size: 1rem;
  font-family: ${theme.fonts.body};
`;
const Body = styled.div`
  display: flex; flex-direction: column;
  max-height: 340px; overflow-y: auto; overscroll-behavior: contain;
`;
const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: 10px ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const NameCol = styled.div`display: flex; flex-direction: column; gap: 1px; min-width: 0;`;
const Name = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.95rem; font-weight: 600; color: ${theme.colors.text};
`;
const DateLine = styled.span`font-size: 0.76rem; color: ${theme.colors.textMuted};`;
const Badge = styled.span<{ $cat: string }>`
  flex-shrink: 0; font-size: 0.7rem; font-weight: 700;
  padding: 2px 7px; border-radius: 10px;
  color: ${({ $cat }) => CATEGORY_COLORS[$cat] ?? theme.colors.textMuted};
  background: ${({ $cat }) => (CATEGORY_COLORS[$cat] ?? theme.colors.textMuted) + '18'};
  border: 1px solid ${({ $cat }) => (CATEGORY_COLORS[$cat] ?? theme.colors.textMuted) + '40'};
`;
const Empty = styled.div`
  padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted};
  text-align: center; font-size: 0.9rem;
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
  min-height: 120px; display: flex; align-items: center; justify-content: center;
`;

const SHOWN = new Set(['holiday', 'roshchodesh', 'fast', 'mevarchim']);

function gregorian(date: string): string {
  const [y, m, d] = date.split('-');
  return `${Number(d)}.${Number(m)}.${y}`;
}

interface Props { date: string; }

/** Upcoming Hebrew-calendar dates for the year ahead: חגים, ראשי חודשים וצומות. */
export default function HebrewCalendarCard({ date }: Props) {
  const [items, setItems] = useState<HebItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const end = new Date(date + 'T12:00:00');
    end.setFullYear(end.getFullYear() + 1);
    const endStr = end.toISOString().slice(0, 10);
    void fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&mf=on&start=${date}&end=${endStr}&lg=he&i=on`)
      .then(r => r.json() as Promise<HebResp>)
      .then(data => {
        setItems((data.items ?? []).filter(i => SHOWN.has(i.category)));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [date]);

  return (
    <Card>
      <CardHeader>{HE.TODAY_HEBCAL_TITLE}</CardHeader>
      {loading && <LoadingBox role="status" aria-label={HE.LOADING}><Spinner aria-hidden="true" /></LoadingBox>}
      {error && <Empty>{HE.TODAY_ERROR}</Empty>}
      {!loading && !error && items.length === 0 && <Empty>{HE.TODAY_HEBCAL_EMPTY}</Empty>}
      {!loading && !error && items.length > 0 && (
        <Body>
          {items.map((ev, i) => (
            <Row key={`${ev.date}-${i}`}>
              <NameCol>
                <Name>{ev.hebrew ?? ev.title}</Name>
                <DateLine>
                  {formatHebrewDate(new Date(ev.date + 'T12:00:00'), true)} · {gregorian(ev.date)}
                </DateLine>
              </NameCol>
              <Badge $cat={ev.category}>{CATEGORY_LABELS[ev.category] ?? ev.category}</Badge>
            </Row>
          ))}
        </Body>
      )}
    </Card>
  );
}
