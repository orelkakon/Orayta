'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { press } from '../playStyles';

/** Multi-select pill chips for the setup screen. */
export const ChipRow = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;

export const Chip = styled.button<{ $on: boolean }>`
  ${press};
  min-height: 40px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid ${({ $on }) => ($on ? theme.game.gold : theme.game.glassLine)};
  background: ${({ $on }) => ($on ? 'rgba(232,203,118,0.16)' : 'rgba(0,0,0,0.2)')};
  color: ${({ $on }) => ($on ? theme.game.gold : theme.game.inkMuted)};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '${({ $on }) => ($on ? '✓' : '+')}';
    font-size: 0.8em;
    opacity: 0.85;
  }
`;
