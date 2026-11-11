'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { RabbiBotAnswer } from '@/types/rabbiBot';
import AnswerView from './AnswerView';
import RabbiBotAvatar from './RabbiBotAvatar';
import { Stack } from './styles';

const breathe = keyframes`0%, 100% { opacity: 0.55; } 50% { opacity: 1; }`;

const Still = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  animation: ${breathe} 1.6s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

interface Props { answer: RabbiBotAnswer; idPrefix: string }

/** The verified points so far, while the model is still writing the rest. */
export default function StreamingAnswer({ answer, idPrefix }: Props) {
  return (
    <Stack aria-busy="true">
      <AnswerView answer={answer} idPrefix={idPrefix} streaming />
      <Still role="status"><RabbiBotAvatar size={28} mood="write" />{HE.RB_STILL_WRITING}</Still>
    </Stack>
  );
}
