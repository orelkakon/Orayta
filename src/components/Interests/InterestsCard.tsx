'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Interest, savePrefs } from '@/lib/interests';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import InterestPicker from './InterestPicker';

/**
 * The one-time question on home: "what interests you?". Answered or
 * dismissed, it never comes back (the choice is edited from "עוד").
 */
const Title = styled.h2`font-size: ${theme.fontSizes.xl}; color: ${theme.colors.text};`;
const Sub = styled.p`
  margin: 4px 0 ${theme.spacing.md}; font-size: ${theme.fontSizes.sm}; line-height: 1.5; color: ${theme.colors.textMuted};
`;
const Actions = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; margin-top: ${theme.spacing.md};
`;

export default function InterestsCard() {
  const [picked, setPicked] = useState<Interest[]>([]);
  return (
    <Card $pad="md" as="section" aria-labelledby="interests-card-title">
      <Title id="interests-card-title">{HE.INTERESTS_CARD_TITLE}</Title>
      <Sub>{HE.INTERESTS_CARD_SUB}</Sub>
      <InterestPicker value={picked} onChange={setPicked} />
      <Actions>
        <Button $variant="primary" disabled={picked.length === 0} onClick={() => savePrefs({ picked, asked: true })}>
          {HE.INTERESTS_SAVE}
        </Button>
        <Button $variant="ghost" onClick={() => savePrefs({ picked: [], asked: true })}>{HE.INTERESTS_LATER}</Button>
      </Actions>
    </Card>
  );
}
