import styled from 'styled-components';
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

export const Greeting = styled.div`
  display: flex; align-items: flex-end; gap: ${theme.spacing.sm};
  & > p {
    margin: 0; padding: ${theme.spacing.sm} ${theme.spacing.md}; max-width: 85%;
    border-radius: ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.sm} ${theme.radii.lg};
    background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
    font-size: ${theme.fontSizes.md}; line-height: 1.55; color: ${theme.colors.text};
  }
`;
