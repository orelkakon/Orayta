'use client';

import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const shimmer = keyframes`
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const Banner = styled(Link)`
  width: 100%; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0d0826 0%, #1e0d5e 45%, #2d0d8c 75%, #0d0826 100%);
  background-size: 300% 300%;
  animation: ${css`${shimmer} 4s linear infinite`};
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex; flex-direction: column; gap: 6px;
  border: 1px solid rgba(140, 100, 255, 0.35);
  box-shadow: 0 6px 28px rgba(80, 40, 180, 0.4), 0 0 0 1px rgba(140,100,255,0.1) inset;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(80, 40, 180, 0.55); }
  &::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 80% 50%, rgba(180,130,255,0.12), transparent 65%);
  }
`;

const NewBadge = styled.div`
  display: inline-flex; align-items: center; gap: 4px; width: fit-content;
  background: rgba(255,215,0,0.18); border: 1px solid rgba(255,215,0,0.45);
  color: #FFD700; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  padding: 3px 9px; border-radius: 12px;
`;

const Row = styled.div`display: flex; align-items: center; justify-content: space-between;`;

const Title = styled.div`
  color: white; font-family: ${theme.fonts.body}; font-size: 1.5rem; font-weight: 900;
  text-shadow: 0 2px 12px rgba(100,60,255,0.5);
`;

const Sub = styled.div`color: rgba(255,255,255,0.68); font-size: 0.85rem; line-height: 1.45;`;

const Arrow = styled.div`color: rgba(255,255,255,0.45); font-size: 1.6rem;`;

export default function FeedBannerBlock() {
  return (
    <Banner href="/feed">
      <NewBadge>{HE.FEED_NEW_BADGE}</NewBadge>
      <Row>
        <Title>🌀 {HE.FEED_TITLE}</Title>
        <Arrow>←</Arrow>
      </Row>
      <Sub>{HE.FEED_SUBTITLE}</Sub>
    </Banner>
  );
}
