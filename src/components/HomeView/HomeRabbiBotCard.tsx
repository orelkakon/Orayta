'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { isNewFeature } from '@/lib/newBadges';
import { openRabbiBot } from '@/lib/rabbiBot/client';
import RabbiBotAvatar from '@/components/RabbiBot/RabbiBotAvatar';

/* A chat-style invitation: the bot's face, what it does, and a pretend input
   bar — tapping anywhere opens the real one. */
const Card = styled.button`
  width: 100%; text-align: start; direction: rtl;
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.lg};
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 55%, transparent);
  background:
    radial-gradient(ellipse at 100% 0%, color-mix(in srgb, ${theme.colors.secondary} 22%, transparent), transparent 60%),
    ${theme.colors.surface};
  box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
  &:active { transform: scale(0.985); }
`;

const Top = styled.span`display: flex; align-items: center; gap: ${theme.spacing.ms};`;
const Text = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;`;
const TitleRow = styled.span`display: flex; align-items: center; gap: ${theme.spacing.sm};`;
const Title = styled.span`font-family: ${theme.fonts.body}; font-size: 1.25rem; font-weight: 800; color: ${theme.colors.primary};`;
const NewBadge = styled.span`
  padding: 1px 8px; border-radius: ${theme.radii.xl}; font-size: 0.66rem; font-weight: 800; line-height: 1.6;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.success};
`;
const Sub = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.45;`;

const FakeInput = styled.span`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: 10px 10px 10px 14px; border-radius: 999px;
  background: ${theme.colors.surfaceAlt}; border: 1.5px solid ${theme.colors.border};
  color: ${theme.colors.textLight}; font-size: ${theme.fontSizes.md};
`;
const Placeholder = styled.span`flex: 1;`;
const SendDot = styled.span`
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  & > svg { transform: scaleX(-1); }
`;
const Sources = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.colors.secondary}; text-align: center;`;

export default function HomeRabbiBotCard() {
  // After mount: the home page is pre-rendered, so a build-time check could outlive the badge.
  const [isNew, setIsNew] = useState(false);
  useEffect(() => setIsNew(isNewFeature('/ask')), []);

  return (
    <Card type="button" onClick={openRabbiBot} aria-label={HE.RB_FAB}>
      <Top>
        <RabbiBotAvatar size={60} mood="happy" />
        <Text>
          <TitleRow><Title>{HE.RB_NAME}</Title>{isNew && <NewBadge>{HE.NEW_BADGE}</NewBadge>}</TitleRow>
          <Sub>{HE.RB_HOME_SUB}</Sub>
        </Text>
      </Top>
      <FakeInput aria-hidden="true">
        <Placeholder>{HE.RB_HOME_INPUT}</Placeholder>
        <SendDot><LineIcon name="send" size={16} strokeWidth={2} /></SendDot>
      </FakeInput>
      <Sources>{HE.RB_HOME_SOURCES}</Sources>
    </Card>
  );
}
