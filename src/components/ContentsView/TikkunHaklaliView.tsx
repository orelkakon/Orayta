'use client';

import { useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import { TIKKUN_HAKLALI_CHAPTERS, TIKKUN_HAKLALI_INTRO } from '@/lib/prayers/tikkunHaklali';
import SpeakButton from '@/components/common/SpeakButton';
import StaticGroupsView from './StaticGroupsView';
import VersesCard from './VersesCard';
import { useSefariaChapter } from './useSefariaChapter';
import { Wrap, Controls, NavBtn, JumpBtn, RefLabel } from './readerStyles';

const Steps = styled.div`
  display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
`;

const Step = styled.button<{ $active: boolean; $done: boolean }>`
  flex-shrink: 0; min-width: 40px; padding: 5px 10px;
  border-radius: ${theme.radii.xl};
  border: 1.5px solid ${p => p.$active ? theme.colors.primary : theme.colors.border};
  background: ${p => p.$active ? theme.colors.primary : theme.colors.surface};
  color: ${p => p.$active ? theme.colors.surface : p.$done ? theme.colors.primary : theme.colors.textMuted};
  font-family: ${theme.fonts.body}; font-size: 0.85rem; font-weight: 700;
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primary}; }
`;

const Done = styled.div`
  text-align: center; font-family: ${theme.fonts.body}; font-weight: 700;
  color: ${theme.colors.primary}; padding: ${theme.spacing.sm};
`;

const BottomNav = styled.div`display: flex; justify-content: space-between;`;

interface Props { onExit: () => void; }

const TOTAL = TIKKUN_HAKLALI_CHAPTERS.length;

// Step 0 = הקדמה, steps 1..10 = the ten psalms in order
export default function TikkunHaklaliView({ onExit }: Props) {
  const [step, setStep] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const chapter = step > 0 ? TIKKUN_HAKLALI_CHAPTERS[step - 1] : null;
  const { verses, refLabel, loading } = useSefariaChapter(chapter ? `Psalms.${chapter}` : null);
  const isLast = step === TOTAL;

  const go = (next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nav = (
    <>
      <NavBtn disabled={step <= 0} onClick={() => go(step - 1)}>→</NavBtn>
      <NavBtn disabled={isLast} onClick={() => go(step + 1)}>←</NavBtn>
    </>
  );

  return (
    <Wrap ref={topRef}>
      <Controls>
        <JumpBtn onClick={onExit}>{HE.TIKKUN_BACK}</JumpBtn>
        {nav}
        <RefLabel>
          {chapter ? `${HE.TIKKUN_PROGRESS(toHebrewNumeral(step), toHebrewNumeral(TOTAL))} · ${refLabel}` : HE.TIKKUN_TITLE}
        </RefLabel>
        {verses.length > 0 && <SpeakButton text={verses.join(' ')} />}
      </Controls>

      <Steps>
        <Step $active={step === 0} $done={step > 0} onClick={() => go(0)}>{HE.TIKKUN_INTRO}</Step>
        {TIKKUN_HAKLALI_CHAPTERS.map((c, i) => (
          <Step key={c} $active={step === i + 1} $done={step > i + 1} onClick={() => go(i + 1)}>
            {toHebrewNumeral(c)}
          </Step>
        ))}
      </Steps>

      {chapter
        ? <VersesCard verses={verses} loading={loading} />
        : <StaticGroupsView groups={TIKKUN_HAKLALI_INTRO} />}

      {isLast && !loading && <Done>{HE.TIKKUN_DONE}</Done>}
      <BottomNav>{nav}</BottomNav>
    </Wrap>
  );
}
