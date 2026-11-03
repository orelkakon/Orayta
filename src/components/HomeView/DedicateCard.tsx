'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';

/** Quiet invitation to dedicate the learning — one place on home, not three. */
const Wrap = styled(Card)`
  display: flex; align-items: center; gap: ${theme.spacing.ms}; flex-wrap: wrap;
`;

const Candle = styled.span`
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.game.goldLight};
  background: ${theme.gilded.night};
  box-shadow: 0 0 0 3px ${theme.colors.goldSoft};
`;

const Text = styled.div`flex: 1; min-width: 170px;`;
const Title = styled.h2`font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text};`;
const Sub = styled.p`margin-top: 2px; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.45;`;

export default function DedicateCard() {
  return (
    <Wrap $tone="gold" as="section" aria-label={HE.HOME_DEDICATE_TITLE}>
      <Candle aria-hidden="true"><LineIcon name="candle" size={24} strokeWidth={1.7} /></Candle>
      <Text>
        <Title>{HE.HOME_DEDICATE_TITLE}</Title>
        <Sub>{HE.HOME_DEDICATE_SUB}</Sub>
      </Text>
      <ButtonLink href="/dedications" $variant="primary" $size="sm">{HE.HOME_DEDICATE_CTA}</ButtonLink>
    </Wrap>
  );
}
