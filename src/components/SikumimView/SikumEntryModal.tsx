'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { SikumEntry } from '@/types';

const Body = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const MetaRow = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;
const BookRow = styled.div`
  font-size: 0.82rem; color: ${theme.colors.textMuted};
  font-weight: 600; padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.borderLight};
`;
const Tag = styled.span<{ $accent?: boolean }>`
  padding: 4px 12px; border-radius: ${'9999px'};
  font-size: 0.78rem; font-weight: 600;
  background: ${({ $accent }) => ($accent ? theme.colors.primary + '18' : theme.colors.borderLight)};
  color: ${({ $accent }) => ($accent ? theme.colors.primary : theme.colors.textMuted)};
  border: 1px solid ${({ $accent }) => ($accent ? theme.colors.primary + '33' : theme.colors.border)};
`;
const TextBlock = styled.div`
  font-size: 0.97rem; line-height: 1.85; color: ${theme.colors.text};
  white-space: pre-wrap; background: ${theme.colors.background};
  border-radius: ${theme.radii.md}; padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.borderLight};
`;
const ActionsRow = styled.div`display: flex; gap: ${theme.spacing.sm}; justify-content: space-between; align-items: center;`;
const AdminBtns = styled.div`display: flex; gap: ${theme.spacing.sm};`;
const ActionBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.82rem; padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  background: ${({ $danger }) => ($danger ? '#fef2f2' : theme.colors.borderLight)};
  color: ${({ $danger }) => ($danger ? '#dc2626' : theme.colors.textMuted)};
  border: 1px solid ${({ $danger }) => ($danger ? '#fca5a5' : theme.colors.borderLight)};
  &:hover { opacity: 0.8; }
`;
const ShareBtn = styled.a`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 600;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: #25D366; color: white;
  border-radius: ${theme.radii.sm};
  border: none; cursor: pointer; text-decoration: none;
  &:hover { opacity: 0.88; }
`;

function fmt(d: string) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
function fmtLong(d: string) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}
function dateLabel(date: string, dateEnd: string | null) {
  return dateEnd ? `${fmt(date)} – ${fmt(dateEnd)}` : fmt(date);
}

interface Props {
  entry: SikumEntry;
  bookName: string;
  bookAuthor?: string | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SikumEntryModal({ entry, bookName, bookAuthor, onClose, onEdit, onDelete }: Props) {
  const modalTitle = entry.title || fmtLong(entry.date);

  const buildShareText = () => {
    const lines: string[] = [];
    lines.push(`📒 *${bookName}*${bookAuthor ? ` | ${bookAuthor}` : ''}`);
    lines.push(`📅 ${dateLabel(entry.date, entry.dateEnd)}`);
    if (entry.location) lines.push(`📍 ${entry.location}`);
    if (entry.title) lines.push(`\n✏️ *${entry.title}*`);
    lines.push('');
    lines.push(entry.text);
    lines.push('');
    lines.push('_שיתוף מאורייתא 📖_');
    return lines.join('\n');
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(buildShareText())}`;

  return (
    <Modal onClose={onClose} title={modalTitle}>
      <Body>
        <BookRow>📒 {bookName}{bookAuthor ? ` · ${bookAuthor}` : ''}</BookRow>
        <MetaRow>
          <Tag $accent>{dateLabel(entry.date, entry.dateEnd)}</Tag>
          {entry.location && <Tag>{entry.location}</Tag>}
        </MetaRow>
        <TextBlock>{entry.text}</TextBlock>
        <ActionsRow>
          <ShareBtn href={waHref} target="_blank" rel="noopener noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.543 4.08 1.496 5.796L0 24l6.372-1.472A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.367l-.36-.214-3.726.861.896-3.632-.235-.373A9.818 9.818 0 1112 21.818z"/></svg>
            {HE.SIKUMIM_SHARE_WA}
          </ShareBtn>
          {(onEdit || onDelete) && (
            <AdminBtns>
              {onEdit && <ActionBtn onClick={onEdit}>{HE.SIKUMIM_ENTRY_EDIT}</ActionBtn>}
              {onDelete && <ActionBtn $danger onClick={onDelete}>{HE.SIKUMIM_ENTRY_DELETE}</ActionBtn>}
            </AdminBtns>
          )}
        </ActionsRow>
      </Body>
    </Modal>
  );
}
