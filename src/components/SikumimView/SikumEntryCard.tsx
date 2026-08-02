'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumEntry } from '@/types';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.button<{ $index: number }>`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: right;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s;
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${p => Math.min(p.$index, 12) * 40}ms;
  @media (hover: hover) {
    &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
  }
  &:active { transform: translateY(-1px) scale(0.98); }
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
  background: ${({ $danger }) => ($danger ? theme.colors.bgError : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.borderLight)};
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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
function dateLabel(date: string, dateEnd: string | null) {
  return dateEnd ? `${formatDate(date)} – ${formatDate(dateEnd)}` : formatDate(date);
}

interface Props {
  entry: SikumEntry;
  index: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumEntryCard({ entry, index, onClick, onEdit, onDelete }: Props) {
  return (
    <Card $index={index} type="button" onClick={onClick}>
      <TopRow>
        <Tags>
          <DateTag>{dateLabel(entry.date, entry.dateEnd)}</DateTag>
          {entry.location && <LocationTag>{entry.location}</LocationTag>}
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
