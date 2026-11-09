'use client';

import { useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { dayToLetters } from '@/lib/hebrewDate';
import { omerCount, SEFIROT } from '@/lib/omer';
import OmerDayPanel from './OmerDayPanel';

type CellState = 'done' | 'now' | 'missed' | 'future';

const glow = keyframes`0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 35%, transparent); } 50% { box-shadow: 0 0 0 6px transparent; }`;

const Card = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.md} ${theme.spacing.ms}; }
`;
const Head = styled.div`display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: ${theme.spacing.xs};`;
const Title = styled.h2`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${theme.colors.primary};`;
const Hint = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

const Weeks = styled.div`display: grid; grid-template-columns: auto repeat(7, minmax(0, 1fr)); gap: 5px; align-items: center;`;
const WeekLabel = styled.span`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};
  padding-inline-end: 6px; white-space: nowrap;
  ${theme.media.xs} { font-size: ${theme.fontSizes.xs}; }
`;

const Cell = styled.button<{ $s: CellState; $sel: boolean }>`
  aspect-ratio: 1; min-width: 0; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; font-weight: 700;
  transition: transform ${theme.motion.fast}, background ${theme.motion.base};
  &:active { transform: scale(0.92); }
  ${p => p.$s === 'done' && css`color: ${theme.colors.onPrimary}; background: ${theme.colors.secondary};`}
  ${p => p.$s === 'now' && css`
    color: ${theme.colors.primary}; background: ${theme.colors.surface}; border: 2px solid ${theme.colors.primary};
    animation: ${glow} 2.4s ease-in-out infinite;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
  ${p => p.$s === 'missed' && css`color: ${theme.colors.textLight}; background: ${theme.colors.surfaceAlt};`}
  ${p => p.$s === 'future' && css`color: ${theme.colors.textMuted}; border: 1px solid ${theme.colors.borderLight};`}
  ${p => p.$sel && css`outline: 2px solid ${theme.colors.primary}; outline-offset: 2px;`}
`;

const Legend = styled.div`
  display: flex; flex-wrap: wrap; gap: ${theme.spacing.md}; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  span { display: inline-flex; align-items: center; gap: 6px; }
  i { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }
`;

interface Props {
  /** The count in focus (tonight / today); null out of season. */
  current: number | null;
  counted: number[];
  selected: number;
  onSelect: (day: number) => void;
  /** Days up to this one can be ticked off from the map; null = none. */
  markUpTo: number | null;
  onToggle: (day: number) => void;
}

/** 7 weeks × 7 days, each week under its sefira; tap a day to read its bracha and count. */
export default function OmerGrid({ current, counted, selected, onSelect, markUpTo, onToggle }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const done = new Set(counted);
  const stateOf = (d: number): CellState => {
    if (done.has(d)) return 'done';
    if (current === null) return 'future';
    if (d === current) return 'now';
    return d < current ? 'missed' : 'future';
  };

  // Bring the reading into view when it starts below the fold (phones).
  const pick = (d: number) => {
    onSelect(d);
    const el = panel.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top > window.innerHeight - 160) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }
  };

  return (
    <Card aria-labelledby="omer-grid">
      <Head><Title id="omer-grid">{HE.OMER_GRID_TITLE}</Title><Hint>{HE.OMER_GRID_HINT}</Hint></Head>
      <Weeks>
        {SEFIROT.map((week, w) => (
          <div key={week} style={{ display: 'contents' }}>
            <WeekLabel title={HE.OMER_WEEK(week)}>{week}</WeekLabel>
            {Array.from({ length: 7 }, (_, i) => {
              const d = w * 7 + i + 1;
              const s = stateOf(d);
              return (
                <Cell key={d} $s={s} $sel={d === selected} onClick={() => pick(d)}
                  aria-pressed={d === selected} aria-current={s === 'now' ? 'date' : undefined}
                  aria-label={HE.OMER_CELL_ARIA(d, omerCount(d)?.sefira ?? '', s === 'done')}>
                  {dayToLetters(d).replace(/[׳״]/g, '')}
                </Cell>
              );
            })}
          </div>
        ))}
      </Weeks>
      <Legend aria-hidden>
        <span><i style={{ background: theme.colors.secondary }} />{HE.OMER_LEGEND_DONE}</span>
        {current !== null && <span><i style={{ border: `2px solid ${theme.colors.primary}` }} />{HE.OMER_LEGEND_NOW}</span>}
        {current !== null && <span><i style={{ background: theme.colors.surfaceAlt }} />{HE.OMER_LEGEND_MISSED}</span>}
      </Legend>
      <OmerDayPanel ref={panel} day={selected} onStep={d => onSelect(Math.min(49, Math.max(1, d)))}
        marked={markUpTo !== null && selected <= markUpTo ? done.has(selected) : null}
        onMark={() => onToggle(selected)} />
    </Card>
  );
}
