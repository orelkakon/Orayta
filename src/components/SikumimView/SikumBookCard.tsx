'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook } from '@/types';

const Card = styled.button`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  text-align: right;
  width: 100%;
  cursor: pointer;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.18s, transform 0.18s, border-top-color 0.18s;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-3px);
    border-top-color: ${theme.colors.primary};
  }
`;

const BookIcon = styled.div`font-size: 1.7rem; line-height: 1; align-self: center;`;

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
  margin-top: auto;
  font-size: 0.75rem;
  color: ${theme.colors.textLight};
  background: ${theme.colors.borderLight};
  border-radius: ${'9999px'};
  padding: 2px 10px;
  align-self: flex-end;
`;

const AdminRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
  align-self: flex-end;
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.72rem;
  padding: 3px 10px;
  border-radius: ${theme.radii.sm};
  background: ${({ $danger }) => ($danger ? '#fef2f2' : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? '#dc2626' : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? '#fca5a5' : theme.colors.borderLight)};
  transition: all 0.15s;
  &:hover { opacity: 0.8; }
`;

interface Props {
  book: SikumBook;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumBookCard({ book, onClick, onEdit, onDelete }: Props) {
  return (
    <Card onClick={onClick}>
      <BookIcon>📒</BookIcon>
      <BookName>{book.name}</BookName>
      {book.author && <BookAuthor>{book.author}</BookAuthor>}
      <CountBadge>{HE.SIKUMIM_BOOK_ENTRY_COUNT(book.entryCount)}</CountBadge>
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
