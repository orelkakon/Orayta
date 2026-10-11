'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { isNewFeature } from '@/lib/newBadges';

const popIn = keyframes`from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; }`;

/* A horizontal "map tile" — deliberately unlike the centered, ornate
   dedications card below it: map-grid texture, solid icon tile, chevron. */
const Card = styled(Link)`
  position: relative; overflow: hidden;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.ms} ${theme.spacing.md};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  border-inline-start: 4px solid ${theme.colors.primary};
  background-color: ${theme.colors.surface};
  /* Faint street-grid texture, fading out behind the text. */
  background-image:
    linear-gradient(to left, ${theme.colors.surface} 35%, transparent),
    linear-gradient(color-mix(in srgb, ${theme.colors.border} 45%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, ${theme.colors.border} 45%, transparent) 1px, transparent 1px);
  background-size: 100% 100%, 26px 26px, 26px 26px;
  background-position: -1px -1px;
  box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
  &:active { transform: scale(0.98); }
`;

const IconTile = styled.span`
  position: relative; flex-shrink: 0;
  width: 52px; height: 52px; border-radius: ${theme.radii.md};
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  box-shadow: ${theme.shadows.sm};
`;

/* Small location pin overlapping the tile corner — reads as "on the map". */
const PinDot = styled.span`
  position: absolute; bottom: -5px; inset-inline-start: -5px;
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.surface}; color: ${theme.colors.success};
  border: 1.5px solid ${theme.colors.border};
`;

const Text = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;

const TitleRow = styled.span`display: flex; align-items: center; gap: ${theme.spacing.sm};`;

const Title = styled.span`
  font-family: ${theme.fonts.body}; font-size: 1.12rem; font-weight: 800; color: ${theme.colors.primary};
`;

const NewBadge = styled.span`
  padding: 1px 8px; border-radius: ${theme.radii.xl};
  font-size: 0.66rem; font-weight: 800; letter-spacing: 0.04em; line-height: 1.6;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.success};
  box-shadow: 0 0 0 2px color-mix(in srgb, ${theme.colors.success} 22%, transparent);
  animation: ${popIn} 0.35s ${theme.motion.spring} both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Sub = styled.span`font-size: 0.8rem; color: ${theme.colors.textMuted};`;

const Chevron = styled.span`
  flex-shrink: 0; font-size: 1.1rem; font-weight: 700; color: ${theme.colors.secondary};
  transition: transform ${theme.motion.fast} ease;
  ${Card}:hover & { transform: translateX(-3px); }
`;

export default function HomeMinyanCard() {
  // Evaluated after mount: the home page is statically pre-rendered, so a
  // build-time date check could outlive the badge's end date.
  const [isNew, setIsNew] = useState(false);
  useEffect(() => { setIsNew(isNewFeature('/minyan')); }, []);

  return (
    <Card href="/minyan" aria-label={`${HE.MN_HOME_TITLE} — ${HE.MN_HOME_SUB}`}>
      <IconTile>
        <LineIcon name="synagogue" size={28} />
        <PinDot><LineIcon name="pin" size={14} strokeWidth={2.2} /></PinDot>
      </IconTile>
      <Text>
        <TitleRow>
          <Title>{HE.MN_HOME_TITLE}</Title>
          {isNew && <NewBadge>{HE.NEW_BADGE}</NewBadge>}
        </TitleRow>
        <Sub>{HE.MN_HOME_SUB}</Sub>
      </Text>
      <Chevron aria-hidden="true">←</Chevron>
    </Card>
  );
}
