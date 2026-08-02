'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook } from '@/types';
import { BookGlyph } from '@/components/common/LineIcons';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.button<{ $index: number }>`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md};
  padding-bottom: calc(${theme.spacing.md} + 28px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  text-align: right;
  width: 100%;
  cursor: pointer;
  box-shadow: ${theme.shadows.sm};
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.18s, border-top-color 0.18s;
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${p => Math.min(p.$index, 12) * 40}ms;
  @media (hover: hover) {
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
      border-top-color: ${theme.colors.primary};
    }
  }
  &:active { transform: translateY(-1px) scale(0.98); }
`;

const BookIcon = styled.div`display: flex; line-height: 1; align-self: center;`;

const BookName = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  line-height: 1.3;
`;

const BookAuthor = styled.div`
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
`;

const CountBadge = styled.div`
  position: absolute;
  top: ${theme.spacing.sm};
  left: ${theme.spacing.sm};
  font-size: 0.72rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  background: ${theme.colors.primary}14;
  border: 1px solid ${theme.colors.primary}28;
  border-radius: ${'9999px'};
  padding: 2px 8px;
  line-height: 1.4;
`;

const AdminRow = styled.div`
  position: absolute;
  bottom: ${theme.spacing.sm};
  left: ${theme.spacing.sm};
  display: flex;
  gap: ${theme.spacing.xs};
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.72rem;
  padding: 3px 10px;
  border-radius: ${theme.radii.sm};
  background: ${({ $danger }) => ($danger ? theme.colors.bgError : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.borderLight)};
  transition: all 0.15s;
  &:hover { opacity: 0.8; }
`;

interface Props {
  book: SikumBook;
  index: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumBookCard({ book, index, onClick, onEdit, onDelete }: Props) {
  return (
    <Card $index={index} onClick={onClick}>
      <BookIcon><BookGlyph icon={book.icon} size={30} /></BookIcon>
      <BookName>{book.name}</BookName>
      {book.author && <BookAuthor>{book.author}</BookAuthor>}
      <CountBadge>{book.entryCount}</CountBadge>
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit && (
            <ActionBtn onClick={e => { e.stopPropagation(); onEdit(); }}>
              {HE.SIKUMIM_ENTRY_EDIT}
            </ActionBtn>
          )}
          {onDelete && (
            <ActionBtn $danger onClick={e => { e.stopPropagation(); onDelete(); }}>
              {HE.SIKUMIM_ENTRY_DELETE}
            </ActionBtn>
          )}
        </AdminRow>
      )}
    </Card>
  );
}
