'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 3px solid ${theme.colors.secondary};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.15s, transform 0.15s;
  @media (max-width: 480px) { padding: 4px ${theme.spacing.sm}; }
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-1px);
  }
`;

const Title = styled.h3`
  font-family: ${theme.fonts.body};
  font-size: 0.95rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  line-height: 1.3;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const Author = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const RabbiBtn = styled.button`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${theme.colors.primaryLight};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.sm};
  padding: 1px 6px;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.surfaceAlt}; border-color: ${theme.colors.primaryLight}; }
`;

const AdminRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
`;

const EditBtn = styled.button`
  font-size: 0.75rem; padding: 2px ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm};
  color: ${theme.colors.textMuted}; transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;
const DeleteBtn = styled.button`
  font-size: 0.75rem; padding: 2px ${theme.spacing.sm};
  border: 1px solid ${theme.colors.error}33; border-radius: ${theme.radii.sm};
  color: ${theme.colors.error}; opacity: 0.7; transition: opacity 0.15s;
  &:hover { opacity: 1; background: rgba(155,35,53,0.06); }
`;

interface Props {
  book: Book;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewRabbi?: (name: string) => void;
}

export default function BookCard({ book, onEdit, onDelete, onViewRabbi }: Props) {
  return (
    <Card>
      <Title>{book.title}</Title>
      <AuthorRow>
        <Author>{book.author}</Author>
        {book.rabbiId && onViewRabbi && (
          <RabbiBtn onClick={() => onViewRabbi(book.author)}>
            👤 {HE.BOOK_VIEW_RABBI}
          </RabbiBtn>
        )}
      </AuthorRow>
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit && <EditBtn onClick={onEdit}>{HE.STUDY_EDIT}</EditBtn>}
          {onDelete && <DeleteBtn onClick={onDelete}>{HE.STUDY_DELETE}</DeleteBtn>}
        </AdminRow>
      )}
    </Card>
  );
}
