'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { HebMonthGrid } from '@/lib/hebrewMonth';

export interface CalEvent { title: string; category: string; }

export const EVENT_COLORS: Record<string, string> = {
  holiday:    'var(--color-accent)',
  roshchodesh:'var(--color-secondary)',
  fast:       '#8b3a3a',
  mevarchim:  'var(--color-primary-light)',
  parashat:   'var(--color-primary)',
};

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px;
  direction: rtl; padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const Weekday = styled.div`
  text-align: center; font-size: 0.68rem; font-weight: 700;
  color: ${theme.colors.textLight}; padding-bottom: 2px;
`;

const Cell = styled.button<{ $today: boolean; $selected: boolean; $shabbat: boolean }>`
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 4px 1px 3px; min-height: 44px;
  border-radius: ${theme.radii.sm};
  cursor: pointer; border: 1px solid transparent;
  background: ${({ $today, $shabbat }) =>
    $today ? theme.colors.primary : $shabbat ? theme.colors.surfaceAlt : 'transparent'};
  ${({ $today }) => $today && 'box-shadow: ' + theme.shadows.sm + ';'}
  ${({ $selected, $today }) => $selected && !$today && `border-color: ${theme.colors.primary};`}
  transition: background 0.15s, border-color 0.15s;
  &:hover { border-color: ${theme.colors.primary}; }
`;

const HebNum = styled.span<{ $today: boolean }>`
  font-family: ${theme.fonts.body};
  font-size: 0.82rem; font-weight: 700; line-height: 1.1;
  color: ${({ $today }) => ($today ? theme.colors.onPrimary : theme.colors.text)};
`;

const GregNum = styled.span<{ $today: boolean }>`
  font-size: 0.58rem; line-height: 1;
  color: ${({ $today }) => ($today ? theme.colors.onPrimary : theme.colors.textLight)};
`;

const Dots = styled.span`
  display: flex; gap: 2px; min-height: 5px; margin-top: 1px;
`;

const Dot = styled.span<{ $color: string; $onToday: boolean }>`
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
  background: ${({ $color, $onToday }) => ($onToday ? theme.colors.onPrimary : $color)};
`;

interface Props {
  grid: HebMonthGrid;
  events: Record<string, CalEvent[]>;
  todayISO: string;
  selectedISO: string;
  onSelect: (iso: string) => void;
}

export default function CalendarGrid({ grid, events, todayISO, selectedISO, onSelect }: Props) {
  return (
    <Grid>
      {HE.TODAY_CAL_WEEKDAYS.map(d => <Weekday key={d}>{d}</Weekday>)}
      {Array.from({ length: grid.leading }, (_, i) => <span key={`pad-${i}`} />)}
      {grid.cells.map(cell => {
        const dayEvents = events[cell.iso] ?? [];
        const isToday = cell.iso === todayISO;
        return (
          <Cell
            key={cell.iso}
            $today={isToday}
            $selected={cell.iso === selectedISO}
            $shabbat={cell.weekday === 6}
            onClick={() => onSelect(cell.iso)}
            title={dayEvents.map(e => e.title).join(' · ')}
          >
            <HebNum $today={isToday}>{cell.hebDayLetters}</HebNum>
            <GregNum $today={isToday}>{cell.gregDay}</GregNum>
            <Dots>
              {dayEvents.slice(0, 3).map((e, i) => (
                <Dot
                  key={`${e.category}-${i}`}
                  $color={EVENT_COLORS[e.category] ?? theme.colors.textMuted}
                  $onToday={isToday}
                />
              ))}
            </Dots>
          </Cell>
        );
      })}
    </Grid>
  );
}
