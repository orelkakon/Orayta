import styled from 'styled-components';
import { theme } from '@/lib/theme';

export const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

export const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 60px); z-index: 50;
  background: ${theme.colors.background};
  margin-top: -${theme.spacing.xl}; padding-top: ${theme.spacing.xl}; padding-bottom: 2px;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  @media (max-width: 600px) { margin-top: -${theme.spacing.md}; padding-top: ${theme.spacing.md}; }
  @media (max-width: 480px) { top: var(--header-h, 52px); }
`;

export const HeaderRow = styled.div`display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; gap: ${theme.spacing.md};`;

export const BackBtn = styled.button`
  font-size: 0.88rem; color: ${theme.colors.primary}; font-weight: 600;
  display: flex; align-items: center; gap: 4px;
  &:hover { text-decoration: underline; }
`;

export const BookTitle = styled.h1`
  font-family: ${theme.fonts.body}; font-size: 1.6rem;
  font-weight: 700; color: ${theme.colors.primary};
`;

export const BookAuthor = styled.span`font-size: 0.95rem; color: ${theme.colors.textMuted}; margin-right: ${theme.spacing.sm};`;

export const SortBtn = styled.button<{ $active?: boolean }>`
  font-size: 0.82rem; padding: 5px 14px; border-radius: ${'9999px'};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary + '12' : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
`;

export const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

export const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
