import styled from 'styled-components';
import { theme } from '@/lib/theme';

export const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm}; width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

export const CardTitle = styled.h3`
  font-size: 1rem; font-weight: 700; color: ${theme.colors.primary};
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

export const FormRow = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

export const Input = styled.input`
  flex: 2; min-width: 140px; direction: ltr;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.9rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

export const Select = styled.select`
  min-width: 148px; padding: ${theme.spacing.sm}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.88rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none; flex-shrink: 0;
`;

export const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; background: ${theme.colors.primary};
  color: white; border-radius: ${theme.radii.md}; font-weight: 600; font-size: 0.88rem;
  white-space: nowrap; flex-shrink: 0;
  &:disabled { opacity: 0.55; }
`;

export const List = styled.div`display: flex; flex-direction: column; gap: 4px;`;

export const Row = styled.div<{ $off?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.sm}; opacity: ${p => p.$off ? 0.5 : 1};
  padding: 8px ${theme.spacing.md}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt}; font-size: 0.9rem; color: ${theme.colors.text};
`;

export const RowText = styled.span`min-width: 0; overflow-wrap: anywhere; direction: ltr; text-align: left;`;

export const Muted = styled.span`font-size: 0.78rem; color: ${theme.colors.textMuted}; font-weight: 600;`;

export const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0; align-items: center;`;

export const SmallBtn = styled.button`
  font-size: 0.75rem; color: ${theme.colors.textMuted}; padding: 2px 8px;
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm}; flex-shrink: 0;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

export const DelBtn = styled.button`
  font-size: 0.75rem; color: ${theme.colors.error}; opacity: 0.65; padding: 2px 6px;
  border-radius: ${theme.radii.sm}; flex-shrink: 0;
  &:hover { opacity: 1; background: rgba(155,35,53,0.08); }
`;

export const Empty = styled.p`font-size: 0.85rem; color: ${theme.colors.textMuted};`;
