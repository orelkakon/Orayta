'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import { RATES, type useSpeech } from './useSpeech';

/**
 * Read-aloud controls above an answer: one button to listen; while reading,
 * pause / stop, how far along it is, and the speed (×0.85 / ×1 / ×1.2).
 * `autoPlay` starts it once — the question was spoken, so the answer is heard.
 */
type Speech = ReturnType<typeof useSpeech>;

const Bar = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
  padding: ${theme.spacing.xs} ${theme.spacing.sm}; border-radius: ${theme.radii.pill};
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
`;
const Status = styled.div`flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 4px;`;
const Label = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.text};`;
const Track = styled.div`height: 3px; border-radius: 2px; background: ${theme.colors.border}; overflow: hidden;`;
const Fill = styled.div`
  height: 100%; border-radius: 2px; background: ${theme.colors.secondary};
  transition: width ${theme.motion.base} ${theme.motion.out};
`;
const Rate = styled.button`
  min-width: 52px; height: 36px; padding: 0 10px; border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: 700; font-variant-numeric: tabular-nums; direction: ltr;
  color: ${theme.colors.primary}; border: 1px solid ${theme.colors.border}; background: ${theme.colors.surface};
`;

const rateLabel = (r: number) => `×${r}`;

export default function ListenBar({ speech, autoPlay }: { speech: Speech; autoPlay: boolean }) {
  const started = useRef(false);
  useEffect(() => {
    if (autoPlay && speech.supported && !started.current) { started.current = true; speech.play(); }
  }, [autoPlay, speech]);

  if (!speech.supported) return null;
  const cycleRate = () => speech.setRate(RATES[(RATES.indexOf(speech.rate as typeof RATES[number]) + 1) % RATES.length]);
  const rate = (
    <Rate type="button" onClick={cycleRate} aria-label={HE.RB_LISTEN_RATE(rateLabel(speech.rate))}>{rateLabel(speech.rate)}</Rate>
  );

  if (speech.status === 'idle') {
    return (
      <Bar>
        <Button $variant="tonal" $size="sm" onClick={speech.play}><LineIcon name="volume" size={18} /> {HE.RB_LISTEN}</Button>
        <span style={{ flex: 1 }} />
        {rate}
      </Bar>
    );
  }
  const playing = speech.status === 'playing';
  return (
    <Bar role="group" aria-label={HE.RB_LISTEN}>
      <IconButton $variant="primary" $size="sm" onClick={playing ? speech.pause : speech.play} aria-label={playing ? HE.RB_LISTEN_PAUSE : HE.RB_LISTEN_RESUME}>
        <LineIcon name={playing ? 'pause' : 'play'} size={16} strokeWidth={2.2} />
      </IconButton>
      <IconButton $variant="plain" $size="sm" onClick={speech.stop} aria-label={HE.RB_LISTEN_STOP}>
        <LineIcon name="stop" size={16} />
      </IconButton>
      <Status aria-live="polite">
        <Label>{playing ? HE.RB_LISTEN_READING : HE.RB_LISTEN_PAUSED}</Label>
        <Track><Fill style={{ width: `${Math.round(((speech.index + 1) / speech.total) * 100)}%` }} /></Track>
      </Status>
      {rate}
    </Bar>
  );
}
