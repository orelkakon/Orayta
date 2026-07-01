'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { SikumEntry } from '@/types';

const Body = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const MetaRow = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const Tag = styled.span<{ $accent?: boolean }>`
  padding: 4px 12px;
  border-radius: ${'9999px'};
  font-size: 0.78rem;
  font-weight: 600;
  background: ${({ $accent }) => ($accent ? theme.colors.primary + '18' : theme.colors.borderLight)};
  color: ${({ $accent }) => ($accent ? theme.colors.primary : theme.colors.textMuted)};
  border: 1px solid ${({ $accent }) => ($accent ? theme.colors.primary + '33' : theme.colors.border)};
`;

const EntryTitle = styled.h2`
  font-family: ${theme.fonts.body};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const TextBlock = styled.div`
  font-size: 0.97rem;
  line-height: 1.85;
  color: ${theme.colors.text};
  white-space: pre-wrap;
  background: ${theme.colors.background};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.borderLight};
`;

const AdminRow = styled.div`
  display: flex; gap: ${theme.spacing.sm}; justify-content: flex-end;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.borderLight};
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.82rem;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  background: ${({ $danger }) => ($danger ? '#fef2f2' : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? '#dc2626' : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? '#fca5a5' : theme.colors.borderLight)};
  &:hover { opacity: 0.8; }
`;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Props {
  entry: SikumEntry;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumEntryModal({ entry, onClose, onEdit, onDelete }: Props) {
  const title = entry.title || formatDate(entry.date);

  return (
    <Modal onClose={onClose} title={title}>
      <Body>
        <MetaRow>
          <Tag $accent>{formatDate(entry.date)}</Tag>
          {entry.location && <Tag>{entry.location}</Tag>}
        </MetaRow>
        <TextBlock>{entry.text}</TextBlock>
        {(onEdit || onDelete) && (
          <AdminRow>
            {onEdit && <ActionBtn onClick={onEdit}>{HE.SIKUMIM_ENTRY_EDIT}</ActionBtn>}
            {onDelete && <ActionBtn $danger onClick={onDelete}>{HE.SIKUMIM_ENTRY_DELETE}</ActionBtn>}
          </AdminRow>
        )}
      </Body>
    </Modal>
  );
}
