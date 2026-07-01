'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumEntry } from '@/types';

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const Tags = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;

const DateTag = styled.span`
  font-size: 0.73rem; font-weight: 700;
  padding: 3px 10px; border-radius: ${'9999px'};
  background: ${theme.colors.primary}18;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary}30;
`;

const LocationTag = styled.span`
  font-size: 0.71rem;
  padding: 3px 10px; border-radius: ${'9999px'};
  background: ${theme.colors.borderLight};
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
`;

const AdminBtns = styled.div`display: flex; gap: 4px;`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.68rem;
  padding: 2px 8px; border-radius: ${theme.radii.sm};
  background: ${({ $danger }) => ($danger ? '#fef2f2' : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? '#dc2626' : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? '#fca5a5' : theme.colors.borderLight)};
  &:hover { opacity: 0.8; }
`;

const EntryTitle = styled.div`
  font-size: 0.97rem; font-weight: 700; color: ${theme.colors.text};
`;

const Preview = styled.div`
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
`;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

interface Props {
  entry: SikumEntry;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumEntryCard({ entry, onClick, onEdit, onDelete }: Props) {
  return (
    <Card onClick={onClick}>
      <TopRow>
        <Tags>
          <DateTag>{formatDate(entry.date)}</DateTag>
          {entry.location && <LocationTag>{HE.SIKUMIM_ENTRY_LOCATION_LABEL}: {entry.location}</LocationTag>}
        </Tags>
        {(onEdit || onDelete) && (
          <AdminBtns>
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
          </AdminBtns>
        )}
      </TopRow>
      {entry.title && <EntryTitle>{entry.title}</EntryTitle>}
      <Preview>{entry.text}</Preview>
    </Card>
  );
}
