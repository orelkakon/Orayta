import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/* Shared look for רבי־בוט's panel (floating sheet and the /ask page). */

export const Stack = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

export const Card = styled.div`
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md}; padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; line-height: 1.65; color: ${theme.colors.text};
`;

export const CardTitle = styled.div`
  font-weight: 800; color: ${theme.colors.primary}; font-size: ${theme.fontSizes.md};
`;

export const Muted = styled.p`margin: 0; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.5;`;

export const Disclaimer = styled.p`
  margin: 0; text-align: center; font-size: ${theme.fontSizes.xs}; font-weight: 600;
  color: ${theme.colors.textMuted};
`;

export const Chip = styled.button`
  padding: 6px 12px; border-radius: 999px; font-size: ${theme.fontSizes.sm};
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface}; color: ${theme.colors.text};
  text-align: start; transition: background ${theme.motion.fast}, border-color ${theme.motion.fast};
  &:hover { border-color: ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt}; }
`;

export const ChipRow = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

export const LinkBtn = styled.button`
  align-self: flex-start; font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.primary};
  text-decoration: underline; text-underline-offset: 3px;
`;

export const Question = styled.div`
  align-self: flex-start; max-width: 92%;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: ${theme.fontSizes.md}; line-height: 1.5;
`;

const pulse = keyframes`0%, 100% { opacity: 0.35; } 50% { opacity: 1; }`;

export const Dot = styled.span<{ $state: 'done' | 'active' | 'todo' }>`
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;
  color: ${theme.colors.onPrimary};
  background: ${p => (p.$state === 'done' ? theme.colors.success : p.$state === 'active' ? theme.colors.secondary : theme.colors.border)};
  & > i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: ${pulse} 1s ease infinite; }
  @media (prefers-reduced-motion: reduce) { & > i { animation: none; } }
`;
