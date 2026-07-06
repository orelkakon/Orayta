'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook, SikumEntry } from '@/types';
import { useRole } from '@/components/common/RoleContext';
import SikumEntryCard from './SikumEntryCard';
import SikumEntryForm from './SikumEntryForm';
import SikumEntryModal from './SikumEntryModal';
import SearchField from '@/components/common/SearchField';

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky;
  top: 60px;
  z-index: 50;
  background: ${theme.colors.background};
  margin-top: -${theme.spacing.xl};
  padding-top: ${theme.spacing.xl};
  padding-bottom: 2px;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  @media (max-width: 600px) { margin-top: -${theme.spacing.md}; padding-top: ${theme.spacing.md}; }
  @media (max-width: 480px) { top: 52px; }
`;

const HeaderRow = styled.div`
  display: flex; align-items: center; flex-wrap: wrap;
  justify-content: space-between; gap: ${theme.spacing.md};
`;

const BackBtn = styled.button`
  font-size: 0.88rem; color: ${theme.colors.primary}; font-weight: 600;
  display: flex; align-items: center; gap: 4px;
  &:hover { text-decoration: underline; }
`;

const BookTitle = styled.h1`
  font-family: ${theme.fonts.body}; font-size: 1.6rem;
  font-weight: 700; color: ${theme.colors.primary};
`;

const BookAuthor = styled.span`
  font-size: 0.95rem; color: ${theme.colors.textMuted}; margin-right: ${theme.spacing.sm};
`;

const ControlRow = styled.div`
  display: flex; align-items: center; flex-wrap: wrap;
  justify-content: space-between; gap: ${theme.spacing.sm};
`;

const SortBtn = styled.button<{ $active?: boolean }>`
  font-size: 0.82rem; padding: 5px 14px;
  border-radius: ${'9999px'};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary + '12' : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
`;

const SortRow = styled.div`display: flex; gap: ${theme.spacing.xs};`;

const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Empty = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;

type SortDir = 'desc' | 'asc';

interface Props {
  book: SikumBook;
  onBack: () => void;
}

export default function SikumEntriesView({ book, onBack }: Props) {
  const [entries, setEntries] = useState<SikumEntry[]>([]);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SikumEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<SikumEntry | null>(null);
  const role = useRole();

  const load = useCallback(() => {
    void fetch(`/api/sikum-entries?bookId=${book.id}`)
      .then(r => r.json())
      .then(setEntries as (v: unknown) => void);
  }, [book.id]);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entries]
      .filter(e => !q || (e.title ?? '').toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDir === 'desc' ? -diff : diff;
      });
  }, [entries, sortDir, search]);

  const handleDelete = async (entry: SikumEntry) => {
    if (!window.confirm(HE.SIKUMIM_ENTRY_DELETE_CONFIRM)) return;
    await fetch(`/api/sikum-entries/${entry.id}`, { method: 'DELETE' });
    setViewEntry(null);
    load();
  };

  return (
    <Container>
      {(addOpen || editEntry) && (
        <SikumEntryForm
          entry={editEntry ?? undefined}
          bookId={book.id}
          onClose={() => { setAddOpen(false); setEditEntry(null); }}
          onSaved={load}
        />
      )}
      {viewEntry && (
        <SikumEntryModal
          entry={viewEntry}
          bookName={book.name}
          bookAuthor={book.author}
          onClose={() => setViewEntry(null)}
          onEdit={role === 'admin' ? () => { setEditEntry(viewEntry); setViewEntry(null); } : undefined}
          onDelete={role === 'admin' ? () => handleDelete(viewEntry) : undefined}
        />
      )}

      <StickyBar>
        <HeaderRow>
          <div>
            <BackBtn onClick={onBack}>{HE.SIKUMIM_BACK}</BackBtn>
            <BookTitle>
              {book.name}
              {book.author && <BookAuthor>{book.author}</BookAuthor>}
            </BookTitle>
          </div>
          {role === 'admin' && (
            <AddBtn onClick={() => setAddOpen(true)}>{HE.SIKUMIM_ADD_ENTRY_BTN}</AddBtn>
          )}
        </HeaderRow>

        <SearchField value={search} onChange={setSearch} placeholder={HE.SIKUMIM_SEARCH_ENTRIES_PLACEHOLDER} />

        <ControlRow>
          <SortRow>
            <SortBtn $active={sortDir === 'desc'} onClick={() => setSortDir('desc')}>
              {HE.SIKUMIM_SORT_DESC}
            </SortBtn>
            <SortBtn $active={sortDir === 'asc'} onClick={() => setSortDir('asc')}>
              {HE.SIKUMIM_SORT_ASC}
            </SortBtn>
          </SortRow>
        </ControlRow>
      </StickyBar>

      <List>
        {sorted.length === 0
          ? <Empty>{HE.SIKUMIM_ENTRIES_EMPTY}</Empty>
          : sorted.map(e => (
              <SikumEntryCard
                key={e.id}
                entry={e}
                onClick={() => setViewEntry(e)}
                onEdit={role === 'admin' ? () => setEditEntry(e) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(e) : undefined}
              />
            ))
        }
      </List>
    </Container>
  );
}
