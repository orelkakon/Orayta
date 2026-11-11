'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { saveName, savedName } from '@/lib/tehillim/client';
import { READER_NAME_MAX } from '@/lib/tehillim/rules';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import GrowthOffers from './GrowthOffers';

/**
 * After "done": thanks, a bigger moment when a whole book was completed,
 * how much this device read here, an optional name for the next reads,
 * the next unit in one tap, and the offers to open a reading of one's own
 * and to keep Orayta on the home screen.
 */
export interface Finished { title: string; bookDone: boolean; read: number }

const pop = keyframes`0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); }`;

const Wrap = styled.div`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md}; text-align: center; padding: ${theme.spacing.lg} 0;`;
const Seal = styled.div`
  width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink}; box-shadow: 0 10px 30px -10px ${theme.gilded.glow};
  animation: ${pop} 0.5s ${theme.motion.spring} both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Title = styled.h3`margin: 0; font-family: ${theme.fonts.body}; font-size: 1.8rem; color: ${theme.colors.text};`;
const Text = styled.p`margin: 0; font-size: ${theme.fontSizes.md}; line-height: 1.6; color: ${theme.colors.textMuted}; max-width: 34ch;`;
const Book = styled.p`
  margin: 0; padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.md}; font-weight: 800;
  background: ${theme.colors.goldSoft}; color: ${theme.colors.text};
`;
const NameBox = styled.label`display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 340px; text-align: start; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;
const Input = styled.input`
  height: 44px; padding: 0 ${theme.spacing.ms}; border-radius: ${theme.radii.md}; font-size: 16px;
  border: 1px solid ${theme.colors.border}; background: ${theme.colors.surface}; color: ${theme.colors.text};
`;
const Actions = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; width: 100%; max-width: 340px;`;
const Err = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error};`;

interface Props {
  finished: Finished; heading: string; busy: boolean; note: string; closed: boolean;
  onNext: () => void; onClose: () => void;
}

export default function DoneView({ finished, heading, busy, note, closed, onNext, onClose }: Props) {
  const [name, setName] = useState(savedName);
  const [asked] = useState(() => !savedName());
  const keep = () => { if (asked && name.trim()) saveName(name.trim().slice(0, READER_NAME_MAX)); };
  return (
    <Wrap>
      <Seal aria-hidden="true"><LineIcon name="check" size={44} strokeWidth={2.6} /></Seal>
      <Title>{HE.TH_THANKS}</Title>
      <Text>{HE.TH_THANKS_TEXT(finished.title, heading)} {finished.read > 0 && HE.TH_MY_READ(finished.read)}</Text>
      {finished.bookDone && <Book>{HE.TH_BOOK_DONE}</Book>}
      {asked && (
        <NameBox>
          {HE.TH_NAME_ASK}
          <Input value={name} maxLength={READER_NAME_MAX} placeholder={HE.TH_NAME_PH} onChange={e => setName(e.target.value)} />
        </NameBox>
      )}
      {note && <Err role="alert">{note}</Err>}
      <Actions>
        {!closed && <Button $variant="gold" $size="lg" $block disabled={busy} onClick={() => { keep(); onNext(); }}>{HE.TH_NEXT}</Button>}
        <Button $variant="ghost" $size="md" $block onClick={() => { keep(); onClose(); }}>{HE.TH_FINISH}</Button>
      </Actions>
      <GrowthOffers />
    </Wrap>
  );
}
