import styled from 'styled-components';
import { theme } from '@/lib/theme';

// Shared controls + text card used by the chapter readers (תנ״ך, תהילים, תיקון הכללי)

export const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

export const Controls = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

export const Select = styled.select`
  padding: 6px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  color: ${theme.colors.text}; font-size: 0.88rem; font-family: ${theme.fonts.body};
  &:focus { outline: none; border-color: ${theme.colors.primary}; }
`;

export const NavBtn = styled.button`
  padding: 6px 14px; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border};
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
  &:disabled { opacity: 0.3; }
`;

export const JumpBtn = styled.button`
  padding: 6px 14px; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.secondary};
  font-size: 0.82rem; font-weight: 600; color: ${theme.colors.secondary};
  transition: all 0.15s;
  &:hover { background: ${theme.colors.secondary}14; }
`;

export const RefLabel = styled.div`
  font-size: 0.82rem; color: ${theme.colors.textMuted};
  margin-right: auto; font-family: ${theme.fonts.body};
`;

export const TextCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

export const Loading = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;
