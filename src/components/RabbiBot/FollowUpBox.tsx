'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Composer from './Composer';

/** "שאלת המשך" under an answer: short questions welcome, asked with the answer as context. */
const Wrap = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  padding-top: ${theme.spacing.md}; border-top: 1px solid ${theme.colors.borderLight};
`;
const Title = styled.h3`font-size: ${theme.fontSizes.md}; font-weight: 800; color: ${theme.colors.text};`;
const Sub = styled.p`font-size: ${theme.fontSizes.xs}; line-height: 1.5; color: ${theme.colors.textMuted};`;

interface Props { onAsk: (question: string, website: string, voice: boolean) => void }

export default function FollowUpBox({ onAsk }: Props) {
  return (
    <Wrap aria-label={HE.RB_FOLLOW_TITLE}>
      <Title>{HE.RB_FOLLOW_TITLE}</Title>
      <Sub>{HE.RB_FOLLOW_SUB}</Sub>
      <Composer disabled={false} followUp onAsk={onAsk} />
    </Wrap>
  );
}
