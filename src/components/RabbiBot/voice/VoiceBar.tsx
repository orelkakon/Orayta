'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { RECORD_MAX_SEC } from '@/lib/rabbiBot/voice/transcript';
import type { VoicePhase } from './useVoiceQuestion';

/**
 * Stands in for the text field while a question is spoken: a live waveform
 * (the last ~2 seconds of loudness), the time, cancel and "done". While the
 * audio is being written out it turns into a calm progress line.
 */
const BARS = 32;

const pulse = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.8); }`;
const sweep = keyframes`from { transform: translateX(100%); } to { transform: translateX(-100%); }`;

const Wrap = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 2px 4px;`;
const Row = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; min-height: 42px;`;
const Dot = styled.span`
  width: 10px; height: 10px; border-radius: 50%; flex: none; background: ${theme.colors.error};
  animation: ${pulse} 1.2s ${theme.motion.inOut} infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Wave = styled.div`flex: 1; min-width: 0; height: 34px; display: flex; align-items: center; gap: 3px; overflow: hidden;`;
const Bar = styled.span`
  flex: 1; min-width: 2px; height: 100%; border-radius: 2px; background: ${theme.colors.primary};
  transform: scaleY(0.08); transform-origin: center; transition: transform 90ms linear;
`;
const Time = styled.span`
  flex: none; font-size: ${theme.fontSizes.sm}; font-variant-numeric: tabular-nums; direction: ltr;
  color: ${theme.colors.textMuted};
`;
const Label = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.text};`;
const Hint = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight};`;
const Track = styled.div`
  position: relative; flex: 1; height: 3px; border-radius: 2px; overflow: hidden; background: ${theme.colors.borderLight};
  &::after {
    content: ''; position: absolute; inset: 0; width: 40%; border-radius: 2px; background: ${theme.colors.secondary};
    animation: ${sweep} 1.1s ${theme.motion.inOut} infinite;
  }
  @media (prefers-reduced-motion: reduce) { &::after { animation: none; width: 100%; opacity: 0.5; } }
`;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Waveform({ levelRef }: { levelRef: MutableRefObject<number> }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const history = new Array<number>(BARS).fill(0);
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      if (t - last > 65) {
        last = t;
        history.shift();
        history.push(levelRef.current);
        // Newest on the reading side (right), older samples drift left.
        history.forEach((v, i) => {
          const el = bars.current[BARS - 1 - i];
          if (el) el.style.transform = `scaleY(${Math.max(0.08, Math.min(1, v * 1.6))})`;
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [levelRef]);
  return <Wave aria-hidden="true">{Array.from({ length: BARS }, (_, i) => <Bar key={i} ref={el => { bars.current[i] = el; }} />)}</Wave>;
}

interface Props { phase: VoicePhase; seconds: number; levelRef: MutableRefObject<number> }

export default function VoiceBar({ phase, seconds, levelRef }: Props) {
  if (phase === 'transcribing') {
    return (
      <Wrap role="status">
        <Label>{HE.RB_MIC_TRANSCRIBING}</Label>
        <Row style={{ minHeight: 24 }}><Track /></Row>
      </Wrap>
    );
  }
  return (
    <Wrap role="status" aria-live="polite">
      <Row>
        <Dot />
        <Waveform levelRef={levelRef} />
        <Time>{clock(seconds)} / {clock(RECORD_MAX_SEC)}</Time>
      </Row>
      <Row style={{ minHeight: 0, justifyContent: 'space-between' }}>
        <Label>{HE.RB_MIC_LISTENING}</Label>
        <Hint>{HE.RB_MIC_AUTO}</Hint>
      </Row>
    </Wrap>
  );
}
