'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Pill buttons. `Button` for actions, `ButtonLink` for navigation (same look).
 * Variants: primary (filled espresso), gold (the hero call to action),
 * secondary (outlined surface), tonal (soft tint), ghost (text only),
 * danger. Sizes: sm 36px · md 44px · lg 52px.
 */
export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'tonal' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $block?: boolean;
}

const hover = (rules: ReturnType<typeof css>) => css`
  @media (hover: hover) and (pointer: fine) { &:hover { ${rules} } }
`;

const VARIANTS: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
    box-shadow: ${theme.shadows.sm};
    ${hover(css`background: color-mix(in srgb, ${theme.colors.primary} 88%, ${theme.colors.text});`)}
  `,
  gold: css`
    background: ${theme.gilded.fill};
    color: ${theme.gilded.ink};
    box-shadow: 0 1px 0 ${theme.gilded.edge} inset, 0 6px 16px -6px ${theme.gilded.glow};
    ${hover(css`filter: brightness(1.04);`)}
  `,
  secondary: css`
    background: ${theme.colors.surface}; color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
    ${hover(css`border-color: ${theme.colors.borderStrong};`)}
  `,
  tonal: css`
    background: color-mix(in srgb, ${theme.colors.primary} 10%, transparent);
    color: ${theme.colors.primary};
    ${hover(css`background: color-mix(in srgb, ${theme.colors.primary} 16%, transparent);`)}
  `,
  ghost: css`
    background: transparent; color: ${theme.colors.primary};
    ${hover(css`background: color-mix(in srgb, ${theme.colors.primary} 8%, transparent);`)}
  `,
  danger: css`
    background: ${theme.colors.bgError}; color: ${theme.colors.error};
    border: 1px solid color-mix(in srgb, ${theme.colors.error} 30%, transparent);
  `,
};

const SIZES: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`min-height: 36px; padding: 0 14px; font-size: ${theme.fontSizes.sm}; gap: 6px;`,
  md: css`min-height: 44px; padding: 0 20px; font-size: ${theme.fontSizes.md}; gap: 8px;`,
  lg: css`min-height: 52px; padding: 0 26px; font-size: ${theme.fontSizes.lg}; gap: 10px;`,
};

export const buttonStyles = css<ButtonStyleProps>`
  display: ${p => (p.$block ? 'flex' : 'inline-flex')};
  width: ${p => (p.$block ? '100%' : 'auto')};
  align-items: center; justify-content: center;
  border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.ui}; font-weight: 600; line-height: 1.2;
  white-space: nowrap; text-decoration: none; cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease,
    border-color 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  ${p => SIZES[p.$size ?? 'md']}
  ${p => VARIANTS[p.$variant ?? 'primary']}
  &:active { transform: scale(0.97); }
  &:disabled, &[aria-disabled='true'] { opacity: 0.5; pointer-events: none; }
  svg { flex-shrink: 0; }
`;

export const Button = styled.button.attrs<{ type?: string }>(p => ({ type: p.type ?? 'button' }))<ButtonStyleProps>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<ButtonStyleProps>`
  ${buttonStyles}
`;

export const ButtonAnchor = styled.a<ButtonStyleProps>`
  ${buttonStyles}
`;
