'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const breathe = keyframes`
  0%, 100% { box-shadow: 0 4px 24px rgba(160,130,60,0.1), inset 0 0 40px rgba(180,150,60,0.03); }
  50%       { box-shadow: 0 6px 40px rgba(160,130,60,0.22), inset 0 0 60px rgba(180,150,60,0.07); }
`;

const Banner = styled(Link)`
  width: 100%; position: relative; overflow: hidden;
  background: linear-gradient(160deg, #07050f 0%, #100c1c 55%, #080612 100%);
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex; flex-direction: column; gap: 8px;
  border: 1px solid rgba(200,170,90,0.22);
  animation: ${breathe} 3.5s ease-in-out infinite;
  transition: transform 0.22s, opacity 0.22s;
  &:hover { transform: translateY(-3px); opacity: 0.95; }
  &::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 70%, rgba(200,165,70,0.07), transparent 65%);
  }
`;

const NewBadge = styled.div`
  display: inline-flex; align-items: center; gap: 5px; width: fit-content;
  background: rgba(200,170,80,0.1); border: 1px solid rgba(200,170,80,0.28);
  color: rgba(210,180,90,0.85); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  padding: 3px 10px; border-radius: 12px;
`;

const Row = styled.div`display: flex; align-items: center; justify-content: space-between;`;

const Title = styled.div`
  color: rgba(255,255,255,0.9); font-family: ${theme.fonts.body}; font-size: 1.4rem; font-weight: 900;
  text-shadow: 0 0 24px rgba(200,165,80,0.35);
`;

const Sub = styled.div`color: rgba(200,185,155,0.65); font-size: 0.82rem; line-height: 1.5;`;

const Arrow = styled.div`color: rgba(200,170,80,0.45); font-size: 1.5rem;`;

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
