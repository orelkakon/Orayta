'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { DayType, MinyanTime } from '@/types/minyan';
import { LevelBadge, evidenceText } from './ConfidenceBadge';
import { Muted } from './minyanStyles';

const Day = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const DayTitle = styled.div`
  font-size: ${theme.fontSizes.xs}; font-weight: 800; letter-spacing: 0.04em;
  color: ${theme.colors.secondary};
`;

const TimeRow = styled.button<{ $disputed: boolean }>`
  width: 100%; display: grid; align-items: center; text-align: right;
  grid-template-columns: 56px 56px 1fr; gap: ${theme.spacing.sm};
  padding: 8px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt};
  opacity: ${p => (p.$disputed ? 0.7 : 1)};
  transition: background ${theme.motion.fast} ease;
  &:hover { background: color-mix(in srgb, ${theme.colors.secondary} 12%, ${theme.colors.surfaceAlt}); }
  &:active { transform: scale(0.99); }
  @media (max-width: 400px) { grid-template-columns: 48px 52px 1fr; }
`;

const Service = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.text};`;

const Clock = styled.span<{ $disputed: boolean }>`
  font-size: ${theme.fontSizes.md}; font-weight: 800; color: ${theme.colors.primary};
  font-variant-numeric: tabular-nums; direction: ltr; text-align: right;
  text-decoration: ${p => (p.$disputed ? 'line-through' : 'none')};
`;

const Meta = styled.span`display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0;`;

interface Props { times: MinyanTime[]; now: Date; onPick: (t: MinyanTime) => void; }

const DAYS: DayType[] = ['weekday', 'shabbat'];

/** Reported/verified times grouped by חול/שבת. Each row opens confirm/correct. */
export default function ScheduleList({ times, now, onPick }: Props) {
  return (
    <>
      {DAYS.map(day => {
        const rows = times.filter(t => t.dayType === day);
        if (rows.length === 0) return null;
        return (
          <Day key={day}>
            <DayTitle>{HE.MN_DAYTYPES[day]}</DayTitle>
            {rows.map(t => {
              const disputed = t.level === 'disputed';
              return (
                <TimeRow key={`${t.service}-${t.time}`} $disputed={disputed} onClick={() => onPick(t)}>
                  <Service>{HE.MN_SERVICES[t.service]}</Service>
                  <Clock $disputed={disputed}>{t.time}</Clock>
                  <Meta>
                    <LevelBadge level={t.level} />
                    <Muted>{evidenceText(t, now)}</Muted>
                  </Meta>
                </TimeRow>
              );
            })}
          </Day>
        );
      })}
    </>
  );
}
