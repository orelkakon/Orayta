import styled from 'styled-components';
import { theme } from '@/lib/theme';

/** Shared shell for the /today cards: a quiet surface with a titled header row. */
export const Card = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: 20px;
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
`;

export const CardHeader = styled.h2`
  display: flex; align-items: center; gap: 10px;
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.ms};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700;
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.borderLight};
  &::before {
    content: ''; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    background: ${theme.colors.gold};
    box-shadow: 0 0 0 4px ${theme.colors.goldSoft};
  }
`;
