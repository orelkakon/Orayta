'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Gematria } from '@/types';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 4px solid ${theme.colors.secondary};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  text-align: center;
  transition: box-shadow 0.15s, transform 0.15s;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-1px);
  }
`;

const Word = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.6rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const ValueBadge = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${theme.colors.secondary};
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.md};
  padding: 2px ${theme.spacing.md};
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
  gematria: Gematria;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GematriaCard({ gematria, onEdit, onDelete }: Props) {
  return (
    <Card>
      <Word>{gematria.word}</Word>
      <ValueBadge>{HE.GEMATRIA_VALUE_LABEL}: {gematria.value}</ValueBadge>
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit && <EditBtn onClick={onEdit}>{HE.STUDY_EDIT}</EditBtn>}
          {onDelete && <DeleteBtn onClick={onDelete}>{HE.STUDY_DELETE}</DeleteBtn>}
        </AdminRow>
      )}
    </Card>
  );
}
