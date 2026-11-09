'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { FONT_STEPS } from '@/components/Reader/useReaderPrefs';
import IconButton from '@/components/ui/IconButton';

/** Above the verses: for whom, what this unit covers, the hold time left, and text size. */
const Bar = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
  margin-bottom: ${theme.spacing.lg}; padding-bottom: ${theme.spacing.ms}; border-bottom: 1px solid ${theme.colors.borderLight};
`;
const Info = styled.div`flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 2px;`;
const For = styled.p`margin: 0; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.primary};`;
const Sub = styled.p<{ $late?: boolean }>`
  margin: 0; font-size: ${theme.fontSizes.xs}; color: ${p => (p.$late ? theme.colors.error : theme.colors.textMuted)};
`;
const Size = styled.div`display: flex; align-items: center; gap: 2px;`;
const A = styled.span<{ $big?: boolean }>`font-family: ${theme.fonts.body}; font-weight: 700; font-size: ${p => (p.$big ? '1.25rem' : '0.9rem')};`;

function minutesLeft(until: string): number {
  return Math.ceil((Date.parse(until) - Date.now()) / 60_000);
}

interface Props { heading: string; range: string; heldUntil: string; step: number; onStep: (s: number) => void }

export default function ReadingTop({ heading, range, heldUntil, step, onStep }: Props) {
  const [left, setLeft] = useState(() => minutesLeft(heldUntil));
  useEffect(() => {
    setLeft(minutesLeft(heldUntil));
    const t = window.setInterval(() => setLeft(minutesLeft(heldUntil)), 20_000);
    return () => window.clearInterval(t);
  }, [heldUntil]);
  return (
    <Bar>
      <Info>
        <For>{HE.TH_READING_FOR(heading)}</For>
        {range && <Sub>{range}</Sub>}
        <Sub $late={left <= 0}>{left > 0 ? HE.TH_HOLD_LEFT(left) : HE.TH_HOLD_OVER}</Sub>
      </Info>
      <Size role="group" aria-label={HE.TH_TEXT_SIZE}>
        <IconButton $size="sm" $variant="tonal" disabled={step <= 0} onClick={() => onStep(step - 1)} aria-label={`${HE.TH_TEXT_SIZE} −`}><A>א</A></IconButton>
        <IconButton $size="sm" $variant="tonal" disabled={step >= FONT_STEPS.length - 1} onClick={() => onStep(step + 1)} aria-label={`${HE.TH_TEXT_SIZE} +`}><A $big>א</A></IconButton>
      </Size>
    </Bar>
  );
}
