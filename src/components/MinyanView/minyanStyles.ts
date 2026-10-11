import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { ReliabilityLevel } from '@/types/minyan';

export const LEVEL_COLOR: Record<ReliabilityLevel, string> = {
  high:   theme.colors.success,
  medium: theme.colors.secondary,
  low:    theme.colors.textMuted,
};

export const Panel = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md};
`;

export const Chip = styled.button<{ $active?: boolean }>`
  padding: 6px 12px; min-height: 34px;
  border-radius: ${theme.radii.xl};
  border: 1.5px solid ${p => (p.$active ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$active ? theme.colors.primary : theme.colors.surface)};
  color: ${p => (p.$active ? theme.colors.onPrimary : theme.colors.textMuted)};
  font-size: ${theme.fontSizes.sm}; font-weight: 600; white-space: nowrap;
  transition: background ${theme.motion.fast} ease, color ${theme.motion.fast} ease, border-color ${theme.motion.fast} ease;
  -webkit-tap-highlight-color: transparent;
  &:active { transform: scale(0.96); }
`;

export const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px ${theme.spacing.lg}; min-height: 44px;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.md}; font-weight: 700; font-size: ${theme.fontSizes.md};
  box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ease, opacity ${theme.motion.fast} ease;
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.55; }
`;

export const GhostBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px ${theme.spacing.md}; min-height: 40px;
  border: 1.5px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  color: ${theme.colors.primary}; font-weight: 600; font-size: ${theme.fontSizes.sm};
  background: ${theme.colors.surface};
  &:hover { border-color: ${theme.colors.primary}; }
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; }
`;

/* Compact icon-only action (brand nav icons, call). 44px tap target per WCAG 2.5.5. */
export const IconAction = styled.a`
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 44px; height: 44px; border-radius: ${theme.radii.md};
  background: ${theme.brand.brandTileBg};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
  color: ${theme.colors.primary};
  transition: transform ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  &:hover { box-shadow: ${theme.shadows.md}; }
  &:active { transform: scale(0.92); }
  &:focus-visible { outline: 2px solid ${theme.colors.primary}; outline-offset: 2px; }
`;

export const Muted = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

export const Input = styled.input`
  padding: 10px ${theme.spacing.md}; min-height: 44px;
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  font-size: ${theme.fontSizes.md};
  &:focus { outline: none; border-color: ${theme.colors.primaryLight}; }
`;

export const ErrorText = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error};`;
