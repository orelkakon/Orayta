'use client';

import { Fragment } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { TehillimCell, TehillimMode } from '@/types/tehillim';
import { unitAt, unitShort, unitTitle } from '@/lib/tehillim/units';
import { Section, SectionTitle } from '../styles';

/**
 * The open book as a grid: read (gold), being read (breathing outline),
 * free (tap to take that one). Chapter 119's 22 letters get their own row
 * label. Nothing is tappable once the reading closed.
 */
const breathe = keyframes`0%, 100% { border-color: ${theme.colors.secondary}; } 50% { border-color: transparent; }`;

const Grid = styled.div<{ $wide: boolean }>`
  display: grid; gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(${p => (p.$wide ? '72px' : '40px')}, 1fr));
`;
const Cell = styled.button<{ $state: TehillimCell; $sub: boolean }>`
  height: 40px; border-radius: 9px; padding: 0 2px;
  font-family: ${theme.fonts.body}; font-size: ${p => (p.$sub ? theme.fontSizes.sm : theme.fontSizes.md)}; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s ${theme.motion.outStrong}, background ${theme.motion.base};
  ${p => p.$state === 'done' && css`
    background: ${theme.gilded.fill}; color: ${theme.gilded.ink}; border: 1px solid transparent;
  `}
  ${p => p.$state === 'held' && css`
    background: ${theme.colors.surfaceAlt}; color: ${theme.colors.textMuted}; border: 1.5px solid ${theme.colors.secondary};
    animation: ${breathe} 2.4s ease-in-out infinite;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
  ${p => p.$state === 'free' && css`
    background: ${theme.colors.surface}; color: ${theme.colors.text}; border: 1px solid ${theme.colors.border};
    &:not(:disabled):active { transform: scale(0.92); }
    @media (hover: hover) and (pointer: fine) { &:not(:disabled):hover { border-color: ${theme.colors.primary}; } }
  `}
  ${p => p.$sub && css`border-style: dashed;`}
  &:disabled { cursor: default; }
`;
const RowLabel = styled.div`
  grid-column: 1 / -1; margin-top: 6px; font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textMuted};
`;
const Legend = styled.div`display: flex; gap: ${theme.spacing.md}; flex-wrap: wrap; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;
const Swatch = styled.span<{ $state: TehillimCell }>`
  display: inline-block; width: 12px; height: 12px; border-radius: 4px; margin-inline-end: 5px; vertical-align: -2px;
  background: ${p => (p.$state === 'done' ? theme.gilded.fill : p.$state === 'held' ? theme.colors.surfaceAlt : theme.colors.surface)};
  border: 1px solid ${p => (p.$state === 'held' ? theme.colors.secondary : p.$state === 'done' ? 'transparent' : theme.colors.border)};
`;

interface Props {
  mode: TehillimMode;
  round: number;
  cells: TehillimCell[];
  disabled: boolean;
  onPick: (unit: number) => void;
}

export default function UnitMap({ mode, round, cells, disabled, onPick }: Props) {
  return (
    <Section aria-labelledby="th-map">
      <SectionTitle id="th-map">{HE.TH_MAP_TITLE(round)}</SectionTitle>
      <Legend>
        {(['free', 'held', 'done'] as const).map(s => <span key={s}><Swatch $state={s} />{HE.TH_MAP_LEGEND[s]}</span>)}
      </Legend>
      <Grid $wide={mode !== 'chapter'}>
        {cells.map((state, i) => {
          const sub = !!unitAt(mode, i)?.segments[0].from && mode === 'chapter';
          const first119 = sub && unitAt(mode, i)?.segments[0].from === 1;
          return (
            <Fragment key={i}>
              {first119 && <RowLabel>{HE.TH_MAP_119}</RowLabel>}
              <Cell
                type="button" $state={state} $sub={sub}
                disabled={disabled || state !== 'free'}
                onClick={() => onPick(i)}
                aria-label={`${unitTitle(mode, i)} — ${HE.TH_MAP_LEGEND[state]}`}
              >
                {unitShort(mode, i)}
              </Cell>
              {sub && unitAt(mode, i)?.segments[0].to === 176 && <RowLabel aria-hidden="true" />}
            </Fragment>
          );
        })}
      </Grid>
    </Section>
  );
}
