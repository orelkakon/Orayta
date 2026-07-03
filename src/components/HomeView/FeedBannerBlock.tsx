'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const glow = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(92,61,30,0.28), 0 1px 0 rgba(196,149,106,0.15) inset; }
  50%       { box-shadow: 0 6px 32px rgba(92,61,30,0.42), 0 1px 0 rgba(196,149,106,0.25) inset; }
`;

const Banner = styled(Link)`
  width: 100%; position: relative; overflow: hidden;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #7a4e28 50%, #9b6535 100%);
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex; flex-direction: column; gap: 6px;
  border: 1px solid rgba(196,149,106,0.4);
  animation: ${glow} 3s ease-in-out infinite;
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); }
  &::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08), transparent 60%);
  }
`;

const NewBadge = styled.div`
  display: inline-flex; align-items: center; gap: 5px; width: fit-content;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.9); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  padding: 3px 10px; border-radius: 12px;
`;

const Row = styled.div`display: flex; align-items: center; justify-content: space-between;`;

const Title = styled.div`
  color: white; font-family: ${theme.fonts.body}; font-size: 1.45rem; font-weight: 900;
  text-shadow: 0 1px 8px rgba(0,0,0,0.25);
`;

const Sub = styled.div`color: rgba(255,255,255,0.78); font-size: 0.83rem; line-height: 1.5;`;

const Arrow = styled.div`color: rgba(255,255,255,0.5); font-size: 1.5rem;`;

export default function FeedBannerBlock() {
  return (
    <Banner href="/feed">
      <NewBadge>✦ {HE.FEED_NEW_BADGE}</NewBadge>
      <Row>
        <Title>✨ {HE.FEED_TITLE}</Title>
        <Arrow>←</Arrow>
      </Row>
      <Sub>{HE.FEED_SUBTITLE}</Sub>
    </Banner>
  );
}
