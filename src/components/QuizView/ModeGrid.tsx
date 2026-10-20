'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { isNewFeature } from '@/lib/newBadges';
import type { QuizMode } from '@/types/quizModes';
import { pressable } from './quizChrome';

interface ModeDef {
  key: QuizMode;
  icon: string;
  label: string;
  /** Uses the seder / masechet filter bar. */
  citation?: boolean;
}

/** Every practice mode, in display order. */
export const QUIZ_MODES: ModeDef[] = [
  { key: 'review', icon: 'repeat', label: HE.QUIZ_MODE_REVIEW, citation: true },
  { key: 'classic', icon: 'target', label: HE.QUIZ_MODE_CLASSIC, citation: true },
  { key: 'multiple', icon: 'list', label: HE.QUIZ_MODE_MULTIPLE, citation: true },
  { key: 'completion', icon: 'pencil', label: HE.QUIZ_MODE_COMPLETION, citation: true },
  { key: 'chrono', icon: 'timeline', label: HE.QUIZ_MODE_CHRONO },
  { key: 'knowledge', icon: 'cap', label: HE.QUIZ_MODE_KNOWLEDGE },
  { key: 'rabbi', icon: 'user', label: HE.QUIZ_MODE_RABBI },
  { key: 'bio', icon: 'search', label: HE.QUIZ_MODE_BIO },
  { key: 'whoFirst', icon: 'hourglass', label: HE.QUIZ_MODE_WHO_FIRST },
  { key: 'image', icon: 'camera', label: HE.QUIZ_MODE_IMAGE },
  { key: 'books', icon: 'book', label: HE.QUIZ_MODE_BOOKS },
  { key: 'seder', icon: 'openbook', label: HE.QUIZ_MODE_SEDER },
  { key: 'gematria', icon: 'aleph', label: HE.QUIZ_MODE_GEMATRIA },
];

export const usesCitationFilter = (m: QuizMode) => QUIZ_MODES.some(d => d.key === m && d.citation);

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: ${theme.spacing.sm};
  ${theme.media.sm} { grid-template-columns: repeat(3, 1fr); }
`;
const Btn = styled.button<{ $active?: boolean }>`
  ${pressable};
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; min-width: 0; padding: ${theme.spacing.sm} ${theme.spacing.xs};
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  background: ${({ $active }) => ($active ? theme.colors.surfaceAlt : theme.colors.surface)};
  box-shadow: ${({ $active }) => ($active ? theme.shadows.md : theme.shadows.sm)};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  @media (hover: hover) {
    &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; transform: translateY(-1px); }
  }
`;
const Icon = styled.span`display: inline-flex; line-height: 1;`;
const Label = styled.span`
  font-size: 0.74rem; font-weight: 600; text-align: center; line-height: 1.2; word-break: break-word;
  ${theme.media.xs} { font-size: 0.7rem; }
`;
const NewPill = styled.span`
  position: absolute; top: -7px; inset-inline-start: 6px;
  font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 8px;
  background: ${theme.colors.secondary}; color: ${theme.colors.secondaryText}; box-shadow: ${theme.shadows.sm};
`;

interface Props { mode: QuizMode; onSelect: (m: QuizMode) => void; }

export default function ModeGrid({ mode, onSelect }: Props) {
  return (
    <Grid role="group">
      {QUIZ_MODES.map(m => (
        <Btn key={m.key} type="button" $active={mode === m.key} aria-pressed={mode === m.key} onClick={() => onSelect(m.key)}>
          {isNewFeature(`quiz:${m.key}`) && <NewPill>{HE.NEW_BADGE}</NewPill>}
          <Icon><LineIcon name={m.icon} size={21} /></Icon>
          <Label>{m.label}</Label>
        </Btn>
      ))}
    </Grid>
  );
}
