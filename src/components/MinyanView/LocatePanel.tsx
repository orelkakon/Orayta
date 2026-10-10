'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import PlaceSearch from './PlaceSearch';
import type { Origin, Phase } from './useMinyanSearch';
import { Panel, PrimaryBtn, Muted } from './minyanStyles';

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 color-mix(in srgb, ${theme.colors.secondary} 45%, transparent); }
  70%  { box-shadow: 0 0 0 16px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

const Wrap = styled(Panel)`
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: ${theme.spacing.sm}; padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const Medallion = styled.div<{ $busy: boolean }>`
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.3), rgba(196,149,106,0.06));
  border: 1.5px solid rgba(196,149,106,0.55);
  animation: ${p => (p.$busy ? pulse : 'none')} 1.4s ease-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Title = styled.h2`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800;
  color: ${theme.colors.primary};
`;

const Sub = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6; max-width: 420px;`;

const OrRow = styled.div`
  width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm}; text-align: right;
`;

interface Props { phase: Phase; onLocate: () => void; onPick: (o: Origin) => void; }

/** First screen + the "no location" states: denied, unavailable, locating. */
export default function LocatePanel({ phase, onLocate, onPick }: Props) {
  const locating = phase === 'locating';
  const [title, sub] =
    phase === 'denied' ? [HE.MN_DENIED_TITLE, HE.MN_DENIED_SUB]
      : phase === 'unavailable' ? [HE.MN_UNAVAILABLE_TITLE, HE.MN_UNAVAILABLE_SUB]
        : [HE.MN_LOCATE_CTA_TITLE, HE.MN_LOCATE_CTA_SUB];

  return (
    <Wrap role={phase === 'denied' || phase === 'unavailable' ? 'alert' : undefined}>
      <Medallion $busy={locating}><LineIcon name="pin" size={30} /></Medallion>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      {phase !== 'denied' && (
        <PrimaryBtn onClick={onLocate} disabled={locating} aria-busy={locating}>
          <LineIcon name="pin" size={18} />
          {locating ? HE.MN_LOCATING : phase === 'unavailable' ? HE.MN_RETRY : HE.MN_LOCATE_CTA_BTN}
        </PrimaryBtn>
      )}
      <OrRow>
        <Muted>{HE.MN_OR_SEARCH}</Muted>
        <PlaceSearch onPick={onPick} />
      </OrRow>
    </Wrap>
  );
}
