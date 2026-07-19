'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const shine = keyframes`
  from { transform: translateX(160%) skewX(-20deg); }
  to   { transform: translateX(-260%) skewX(-20deg); }
`;

const Row = styled.div`
  display: grid; grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md}; width: 100%;
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;

/* Gold gradient frame — thin outer layer, card inside */
const Frame = styled(Link)`
  position: relative; display: block;
  padding: 1.5px; border-radius: ${theme.radii.xl};
  background: linear-gradient(
    145deg,
    rgba(196,149,106,0.85) 0%,
    rgba(196,149,106,0.25) 30%,
    rgba(196,149,106,0.25) 70%,
    rgba(196,149,106,0.85) 100%
  );
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: ${theme.shadows.sm};
  &:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(92,61,30,0.22); }
`;

const Card = styled.div`
  position: relative; overflow: hidden;
  height: 100%;
  background: linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%);
  border-radius: calc(${theme.radii.xl} - 1.5px);
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 6px;

  /* shine sweep on hover */
  &::after {
    content: ''; position: absolute; top: -20%; bottom: -20%; width: 45%;
    background: linear-gradient(90deg, transparent, rgba(196,149,106,0.16), transparent);
    transform: translateX(160%) skewX(-20deg);
    pointer-events: none;
  }
  ${Frame}:hover &::after { animation: ${shine} 0.9s ease; }
`;

const CornerOrnament = styled.span<{ $side: 'right' | 'left' }>`
  position: absolute; top: 10px; ${p => p.$side}: 14px;
  color: ${theme.colors.secondary}; font-size: 0.7rem; opacity: 0.75;
`;

const Medallion = styled.div`
  width: 54px; height: 54px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; line-height: 1;
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.32), rgba(196,149,106,0.08));
  border: 1px solid rgba(196,149,106,0.55);
  box-shadow: 0 2px 10px rgba(92,61,30,0.15), inset 0 1px 0 rgba(255,255,255,0.35);
`;

const Eyebrow = styled.span`
  margin-top: 2px;
  font-size: 0.66rem; font-weight: 800; letter-spacing: 0.22em;
  color: ${theme.colors.secondary}; text-transform: uppercase;
`;

const Title = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.16rem; font-weight: 800; color: ${theme.colors.primary};
  line-height: 1.3;
`;

const Sub = styled.span`
  font-size: 0.8rem; color: ${theme.colors.textMuted}; line-height: 1.5;
`;

const GoldDivider = styled.span`
  margin-top: 6px; width: 56px; height: 1px;
  background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
`;

const Cta = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 4px;
  font-size: 0.8rem; font-weight: 700; color: ${theme.colors.secondary};

  span { transition: transform 0.2s ease; }
  ${Frame}:hover & span { transform: translateX(-4px); }
`;

interface CardDef {
  href: string;
  icon: string;
  eyebrow: string;
  title: string;
  sub: string;
}

const CARDS: CardDef[] = [
  {
    href: '/dedications',
    icon: '🕯️',
    eyebrow: HE.DEDICATIONS_TITLE,
    title: HE.DEDICATION_BANNER_TITLE,
    sub: HE.DEDICATION_BANNER_SUB,
  },
  {
    href: '/contact',
    icon: '📜',
    eyebrow: HE.NAV_CONTACT,
    title: HE.HOME_CONTACT_TITLE,
    sub: HE.HOME_CONTACT_SUB,
  },
];

export default function HomeActionCards() {
  return (
    <Row>
      {CARDS.map(c => (
        <Frame key={c.href} href={c.href}>
          <Card>
            <CornerOrnament $side="right">✦</CornerOrnament>
            <CornerOrnament $side="left">✦</CornerOrnament>
            <Medallion>{c.icon}</Medallion>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <Title>{c.title}</Title>
            <Sub>{c.sub}</Sub>
            <GoldDivider />
            <Cta>{HE.HOME_CARD_CTA} <span>←</span></Cta>
          </Card>
        </Frame>
      ))}
    </Row>
  );
}
