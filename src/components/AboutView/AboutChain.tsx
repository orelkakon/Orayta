'use client';

import { CSSProperties, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { CATEGORY_LABELS } from '@/lib/rabbisData';
import type { RabbiCategory } from '@/types';
import { ButtonLink } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import { useScrollVar } from './useScrollMotion';
import { Kicker } from './AboutManifesto';

// The eras in order (families and movements stay in the directory itself).
const ERAS: RabbiCategory[] = [
  'torah', 'shoftim', 'melachim', 'neviim', 'ketuvim', 'zugot',
  'tannaim', 'amoraim', 'geonim', 'rishonim', 'acharonim', 'late',
];

const Wrap = styled.section`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} 0; text-align: center;
`;
const Title = styled.h2`
  font-family: ${theme.fonts.body}; font-weight: 800; color: ${theme.colors.primary};
  font-size: clamp(1.9rem, 1.4rem + 2.2vw, 2.8rem); line-height: 1.1;
`;
const Sub = styled.p`max-width: 34em; font-size: ${theme.fontSizes.md}; line-height: 1.7; color: ${theme.colors.textMuted};`;

const Chain = styled.ol`
  --gap: 16px;
  position: relative; list-style: none; width: 100%; max-width: 640px;
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md};
  display: flex; flex-direction: column; gap: var(--gap);
  /* The thread: a faint track and the gold filled up to the scroll. */
  &::before, &::after {
    content: ''; position: absolute; top: 10px; bottom: 10px; width: 2px; border-radius: 2px;
    inset-inline-start: 19px;
    ${theme.up.sm} { inset-inline-start: calc(50% - 1px); }
  }
  &::before { background: ${theme.colors.borderLight}; }
  &::after {
    background: linear-gradient(${theme.colors.gold}, ${theme.colors.secondary});
    transform-origin: top; transform: scaleY(var(--p, 1));
    box-shadow: 0 0 12px color-mix(in srgb, ${theme.colors.gold} 60%, transparent);
  }
`;

const Node = styled.li`
  /* 0 → 1 as the thread reaches this node. */
  --lit: clamp(0, (var(--p, 1) * (var(--n) - 0.4) - var(--i)) * 2.5, 1);
  position: relative; display: flex; align-items: center;
  padding-inline-start: 52px; min-height: 44px;
  ${theme.up.sm} {
    padding-inline-start: 0; width: 50%;
    &:nth-child(odd) { align-self: flex-start; justify-content: flex-end; padding-inline-end: 34px; }
    &:nth-child(even) { align-self: flex-end; justify-content: flex-start; padding-inline-start: 34px; }
  }
`;
const Dot = styled.span`
  position: absolute; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%;
  inset-inline-start: 11px;
  background: ${theme.colors.surface}; border: 2px solid ${theme.colors.border};
  ${theme.up.sm} {
    li:nth-child(odd) > & { inset-inline-start: auto; inset-inline-end: -9px; }
    li:nth-child(even) > & { inset-inline-start: -9px; }
  }
  &::after {
    content: ''; position: absolute; inset: -2px; border-radius: 50%;
    background: radial-gradient(circle, ${theme.colors.gold} 0 45%, color-mix(in srgb, ${theme.colors.gold} 30%, transparent) 46%);
    opacity: var(--lit); transform: scale(calc(0.4 + var(--lit) * 0.6));
    box-shadow: 0 0 calc(var(--lit) * 14px) color-mix(in srgb, ${theme.colors.gold} 70%, transparent);
  }
`;
const Label = styled.span`
  display: inline-flex; align-items: center; gap: ${theme.spacing.sm};
  padding: 8px 16px; border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700;
  color: ${theme.colors.primary}; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  opacity: calc(0.3 + var(--lit) * 0.7);
  transform: translateY(calc((1 - var(--lit)) * 10px)) scale(calc(0.94 + var(--lit) * 0.06));
  small { font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textLight}; font-variant-numeric: tabular-nums; }
`;

/** The generations as a gold thread that fills in as you scroll down it. */
export default function AboutChain() {
  const ref = useRef<HTMLOListElement>(null);
  useScrollVar(ref, 0.8, 0.5);
  return (
    <Wrap aria-labelledby="about-chain">
      <Kicker>{HE.ABOUT_CHAIN_KICKER}</Kicker>
      <Title id="about-chain">{HE.ABOUT_CHAIN_TITLE}</Title>
      <Sub>{HE.ABOUT_CHAIN_SUB}</Sub>
      <Chain ref={ref} style={{ '--n': ERAS.length } as CSSProperties}>
        {ERAS.map((era, i) => (
          <Node key={era} style={{ '--i': i } as CSSProperties}>
            <Dot aria-hidden />
            <Label><small>{String(i + 1).padStart(2, '0')}</small>{CATEGORY_LABELS[era]}</Label>
          </Node>
        ))}
      </Chain>
      <ButtonLink href="/rabbis" $variant="tonal">
        {HE.ABOUT_CHAIN_CTA}<LineIcon name="chevron" size={16} strokeWidth={2} />
      </ButtonLink>
    </Wrap>
  );
}
