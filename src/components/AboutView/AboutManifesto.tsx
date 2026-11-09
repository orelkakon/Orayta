'use client';

import { CSSProperties, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useScrollVar } from './useScrollMotion';

const Wrap = styled.section`
  max-width: 820px; margin: 0 auto;
  padding: ${theme.spacing.xxl} ${theme.spacing.sm};
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  scroll-margin-top: calc(var(--header-h, 0px) + 16px);
`;

export const Kicker = styled.p`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; font-weight: 800; letter-spacing: 0.06em; color: ${theme.colors.secondary};
  &::before { content: ''; width: 28px; height: 2px; border-radius: 2px; background: ${theme.colors.gold}; }
`;

const Text = styled.p`
  font-family: ${theme.fonts.body}; font-weight: 700;
  font-size: clamp(1.5rem, 1.1rem + 2vw, 2.4rem); line-height: 1.55;
  color: ${theme.colors.text};
  span {
    /* Each word lights up as the scroll passes it: --i of --n, driven by --p. */
    opacity: calc(0.16 + 0.84 * clamp(0, (var(--p, 1) * (var(--n) + 4) - var(--i)) / 4, 1));
    transition: opacity 0.12s linear;
  }
  span.gold { color: ${theme.colors.secondary}; }
`;

/** The "why", read word by word as it scrolls into place. */
export default function AboutManifesto() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, 0.9, 0.45);
  const words = HE.ABOUT_MANIFESTO.split(' ');
  // "רגע של תורה" — the heart of the sentence — in the accent colour.
  const heart = words.indexOf('רגע');
  return (
    <Wrap ref={ref} id="about-story" aria-labelledby="about-why">
      <Kicker id="about-why">{HE.ABOUT_MANIFESTO_KICKER}</Kicker>
      <Text style={{ '--n': words.length } as CSSProperties}>
        {words.map((w, i) => (
          <span key={i} className={heart >= 0 && i >= heart && i <= heart + 2 ? 'gold' : undefined} style={{ '--i': i } as CSSProperties}>{w} </span>
        ))}
      </Text>
    </Wrap>
  );
}
