'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { omerCount } from '@/lib/omer';
import { LineIcon } from '@/components/common/LineIcons';
import OmerReading from './OmerReading';

const Panel = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.background};
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 30%, ${theme.colors.borderLight});
  scroll-margin-top: calc(var(--header-h, 0px) + 12px);
`;
const Top = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;
const Titles = styled.div`
  flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; text-align: center;
  strong { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800; color: ${theme.colors.primary}; }
  span { font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary}; }
`;
const Step = styled.button`
  width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  color: ${theme.colors.primary}; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.92); }
  &:disabled { opacity: 0.35; pointer-events: none; }
`;
const Mark = styled.button<{ $done: boolean }>`
  align-self: center; display: inline-flex; align-items: center; gap: 6px;
  min-height: 40px; padding: 0 16px; border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${p => (p.$done ? theme.colors.onPrimary : theme.colors.secondary)};
  background: ${p => (p.$done ? theme.colors.secondary : 'transparent')};
  border: 1.5px solid ${theme.colors.secondary};
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.96); }
`;

interface Props {
  day: number;
  onStep: (day: number) => void;
  /** null = this day can't be ticked (future / out of season). */
  marked: boolean | null;
  onMark: () => void;
}

/** The tapped day of the map: its full reading, step to the next/previous day, tick it off. */
const OmerDayPanel = forwardRef<HTMLDivElement, Props>(function OmerDayPanel({ day, onStep, marked, onMark }, ref) {
  const c = omerCount(day);
  if (!c) return null;
  return (
    <Panel ref={ref} aria-live="polite" aria-labelledby="omer-day-title">
      <Top>
        <Step onClick={() => onStep(day - 1)} disabled={day <= 1} aria-label={HE.OMER_PREV_DAY}>
          <LineIcon name="chevronBack" size={20} strokeWidth={2} />
        </Step>
        <Titles>
          <strong id="omer-day-title">{HE.OMER_DAY_N(day)}</strong>
          <span>{c.sefira}</span>
        </Titles>
        <Step onClick={() => onStep(day + 1)} disabled={day >= 49} aria-label={HE.OMER_NEXT_DAY}>
          <LineIcon name="chevron" size={20} strokeWidth={2} />
        </Step>
      </Top>
      <OmerReading day={day} />
      {marked !== null && (
        <Mark $done={marked} onClick={onMark} aria-pressed={marked}>
          {marked && <LineIcon name="check" size={16} strokeWidth={2.2} />}
          {marked ? HE.OMER_MARKED(day) : HE.OMER_MARK(day)}
        </Mark>
      )}
    </Panel>
  );
});

export default OmerDayPanel;
