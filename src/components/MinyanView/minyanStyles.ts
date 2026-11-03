import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { ReliabilityLevel } from '@/types/minyan';

export const LEVEL_COLOR: Record<ReliabilityLevel, string> = {
  high:   theme.colors.success,
  medium: theme.colors.gold,
  low:    theme.colors.textMuted,
};

export const Panel = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: 18px;
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md};
`;

export const Chip = styled.button<{ $active?: boolean }>`
  position: relative; flex-shrink: 0;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 14px; min-height: 36px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${p => (p.$active ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$active ? theme.colors.primary : theme.colors.surface)};
  color: ${p => (p.$active ? theme.colors.onPrimary : theme.colors.text)};
  font-size: ${theme.fontSizes.sm}; font-weight: 600; white-space: nowrap;
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  &:active { transform: scale(0.96); }
  &::after { content: ''; position: absolute; inset: -4px 0; }
`;

export const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0 ${theme.spacing.lg}; min-height: 50px;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.pill}; font-weight: 700; font-size: ${theme.fontSizes.md};
  box-shadow: ${theme.shadows.md};
  transition: transform 0.16s ${theme.motion.outStrong}, opacity 0.15s ease;
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.55; }
`;

export const GhostBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 0 ${theme.spacing.md}; min-height: 40px;
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.pill};
  color: ${theme.colors.primary}; font-weight: 600; font-size: ${theme.fontSizes.sm};
  background: ${theme.colors.surface};
  transition: transform 0.16s ${theme.motion.outStrong}, border-color 0.15s ease;
  @media (hover: hover) and (pointer: fine) { &:hover { border-color: ${theme.colors.gold}; } }
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; }
`;

/* Compact icon-only action (brand nav icons, call). 44px tap target per WCAG 2.5.5. */
export const IconAction = styled.a`
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 44px; height: 44px; border-radius: 14px;
  background: ${theme.brand.brandTileBg};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
  color: ${theme.colors.primary};
  transition: transform 0.16s ${theme.motion.outStrong}, box-shadow 0.15s ease;
  @media (hover: hover) and (pointer: fine) { &:hover { box-shadow: ${theme.shadows.md}; } }
  &:active { transform: scale(0.92); }
`;

export const Muted = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

export const Input = styled.input`
  padding: 0 ${theme.spacing.md}; min-height: 48px;
  border: 1px solid ${theme.colors.border}; border-radius: 14px;
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  font-size: ${theme.fontSizes.md}; box-shadow: ${theme.shadows.sm};
  &:focus { outline: none; border-color: color-mix(in srgb, ${theme.colors.gold} 70%, ${theme.colors.border}); box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.gold} 20%, transparent); }
`;

export const ErrorText = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error};`;
