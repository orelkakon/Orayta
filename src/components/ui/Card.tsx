'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Surface card. `$pad` sm 12 · md 16 · lg 24. `$interactive` adds the press
 * (and, on pointer devices, a hover lift) — use CardLink / CardButton for
 * whole-card taps so the semantics match the affordance.
 */
interface CardProps {
  $pad?: 'none' | 'sm' | 'md' | 'lg';
  $interactive?: boolean;
  $tone?: 'surface' | 'alt' | 'gold';
}

const PAD = { none: '0', sm: theme.spacing.ms, md: theme.spacing.md, lg: theme.spacing.lg };

export const cardStyles = css<CardProps>`
  position: relative;
  display: block;
  background: ${p => (p.$tone === 'alt' ? theme.colors.surfaceAlt : p.$tone === 'gold' ? theme.colors.goldSoft : theme.colors.surface)};
  border: 1px solid ${p => (p.$tone === 'gold' ? `color-mix(in srgb, ${theme.colors.gold} 35%, transparent)` : theme.colors.borderLight)};
  border-radius: ${theme.radii.lg};
  box-shadow: ${p => (p.$tone === 'alt' ? 'none' : theme.shadows.sm)};
  padding: ${p => PAD[p.$pad ?? 'md']};
  color: ${theme.colors.text};
  text-align: start;
  ${p => p.$interactive && css`
    cursor: pointer;
    transition: transform 0.18s ${theme.motion.outStrong}, box-shadow 0.2s ease, border-color 0.2s ease;
    &:active { transform: scale(0.98); }
    @media (hover: hover) and (pointer: fine) {
      &:hover { box-shadow: ${theme.shadows.md}; border-color: ${theme.colors.border}; transform: translateY(-1px); }
      &:active { transform: scale(0.98); }
    }
  `}
`;

export const Card = styled.div<CardProps>`${cardStyles}`;
export const CardLink = styled(Link)<CardProps>`${cardStyles}`;
export const CardButton = styled.button.attrs({ type: 'button' })<CardProps>`
  ${cardStyles}
  width: 100%;
  font: inherit;
`;
