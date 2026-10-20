'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Citation } from '@/types';
import type { SrsCard, SrsGrade } from '@/types/quizModes';
import { nextStep, MAX_BOX } from '@/lib/srs';
import { pressable } from '../quizChrome';
import ContextButton from '@/components/TalmudContext/ContextButton';

const Scene = styled.div`perspective: 1400px;`;
const Inner = styled.div<{ $flipped: boolean }>`
  display: grid; transform-style: preserve-3d; transition: transform 0.55s ${theme.motion.out};
  transform: ${({ $flipped }) => ($flipped ? 'rotateY(180deg)' : 'none')};
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;
const face = css`
  grid-area: 1 / 1; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.lg}; min-height: 220px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
`;
const Front = styled.button`
  ${face}; text-align: right; background: ${theme.colors.surfaceAlt}; cursor: pointer; width: 100%;
  &:focus-visible { outline: 3px solid ${theme.colors.accentLight}; outline-offset: 2px; }
`;
const Back = styled.div`${face}; background: ${theme.colors.surface}; transform: rotateY(180deg);`;
const CardTop = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;
const Kind = styled.span<{ $fresh: boolean }>`
  font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 12px;
  color: ${({ $fresh }) => ($fresh ? theme.colors.secondaryText : theme.colors.primary)};
  background: ${({ $fresh }) => ($fresh ? theme.colors.secondary : theme.colors.background)};
`;
const Dots = styled.span`display: inline-flex; gap: 3px;`;
const Dot = styled.span<{ $on: boolean }>`
  width: 7px; height: 7px; border-radius: 50%;
  background: ${({ $on }) => ($on ? theme.colors.success : theme.colors.border)};
`;
const Quote = styled.p`
  margin: 0; font-family: ${theme.fonts.body}; font-size: 1.15rem; line-height: 1.9; color: ${theme.colors.text};
  border-right: 4px solid ${theme.colors.secondary}; padding-right: ${theme.spacing.md}; overflow-wrap: anywhere;
`;
const FlipHint = styled.span`margin-top: auto; font-size: 0.8rem; color: ${theme.colors.textMuted}; text-align: center;`;
const Where = styled.span`font-size: 0.8rem; font-weight: 700; color: ${theme.colors.textMuted};`;
const Locs = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;
const Loc = styled.span`
  font-family: ${theme.fonts.body}; font-size: 1.3rem; font-weight: 700; color: ${theme.colors.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.border};
`;
const Small = styled.p`margin: 0; font-size: 0.9rem; line-height: 1.7; color: ${theme.colors.textMuted}; overflow-wrap: anywhere;`;
const Grades = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.sm};`;
const GradeBtn = styled.button<{ $tone: SrsGrade }>`
  ${pressable};
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: ${theme.spacing.ms} ${theme.spacing.xs}; border-radius: ${theme.radii.md}; font-weight: 700; font-size: 0.95rem;
  border: 2px solid ${({ $tone }) => ($tone === 'again' ? theme.colors.error : $tone === 'hard' ? theme.colors.accent : theme.colors.success)};
  background: ${({ $tone }) => ($tone === 'again' ? theme.colors.bgError : $tone === 'hard' ? theme.colors.bgWarning : theme.colors.bgSuccess)};
  color: ${theme.colors.text};
  small { font-size: 0.72rem; font-weight: 600; color: ${theme.colors.textMuted}; }
`;
const RevealBtn = styled.button`
  ${pressable};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md}; font-weight: 700; font-size: 1rem;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
`;

const fmt = (l: Citation['locations'][0]) => `${l.masechet} ${l.daf}${l.amud ? ` ${l.amud}` : ''}`;
const GRADES: { g: SrsGrade; label: string; key: string }[] = [
  { g: 'again', label: HE.QUIZ_REVIEW_AGAIN, key: '1' },
  { g: 'hard', label: HE.QUIZ_REVIEW_HARD, key: '2' },
  { g: 'good', label: HE.QUIZ_REVIEW_GOOD, key: '3' },
];

interface Props {
  citation: Citation;
  card: SrsCard | undefined;
  flipped: boolean;
  onFlip: () => void;
  onGrade: (g: SrsGrade) => void;
}

export default function Flashcard({ citation, card, flipped, onFlip, onGrade }: Props) {
  const box = card?.box ?? 0;
  const top = (
    <CardTop>
      <Kind $fresh={!card}>{card ? HE.QUIZ_REVIEW_DUE_CARD : HE.QUIZ_REVIEW_NEW_CARD}</Kind>
      <Dots role="img" aria-label={HE.QUIZ_REVIEW_BOX_ARIA(box, MAX_BOX)}>
        {Array.from({ length: MAX_BOX }, (_, i) => <Dot key={i} $on={i < box} />)}
      </Dots>
    </CardTop>
  );
  return (
    <>
      <Scene>
        <Inner $flipped={flipped}>
          <Front type="button" onClick={onFlip} aria-hidden={flipped} tabIndex={flipped ? -1 : 0} aria-label={`${HE.QUIZ_REVIEW_WHERE} ${citation.content}`}>
            {top}
            <Quote>{citation.content}</Quote>
            <FlipHint>{HE.QUIZ_REVIEW_FLIP_HINT}</FlipHint>
          </Front>
          <Back aria-hidden={!flipped}>
            {top}
            <Where>{HE.QUIZ_REVIEW_WHERE}</Where>
            <Locs>{citation.locations.map(l => <Loc key={l.id}>{fmt(l)}</Loc>)}</Locs>
            <Small>{citation.content}</Small>
            {flipped && <ContextButton citation={citation} variant="inline" />}
          </Back>
        </Inner>
      </Scene>
      {flipped ? (
        <Grades>
          {GRADES.map(({ g, label, key }) => (
            <GradeBtn key={g} type="button" $tone={g} onClick={() => onGrade(g)} aria-keyshortcuts={key}>
              {label}
              <small>{HE.QUIZ_REVIEW_IN(nextStep(card, g).days)}</small>
            </GradeBtn>
          ))}
        </Grades>
      ) : (
        <RevealBtn type="button" onClick={onFlip} aria-keyshortcuts="Space">{HE.QUIZ_REVIEW_FLIP}</RevealBtn>
      )}
    </>
  );
}
