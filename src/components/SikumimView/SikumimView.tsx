'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook } from '@/types';
import { useRole } from '@/components/common/RoleContext';
import SearchField from '@/components/common/SearchField';
import SikumBookCard from './SikumBookCard';
import SikumBookForm from './SikumBookForm';
import SikumEntriesView from './SikumEntriesView';

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky;
  top: 60px;
  z-index: 50;
  background: ${theme.colors.background};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  @media (max-width: 480px) { top: 52px; }
`;

const TitleRow = styled.div`
  display: flex; align-items: flex-start;
  justify-content: space-between; flex-wrap: wrap; gap: ${theme.spacing.md};
`;

const TitleGroup = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const Title = styled.h1`font-size: 1.8rem; color: ${theme.colors.primary};`;

const Subtitle = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted};`;

const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  flex-shrink: 0; align-self: flex-start;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const ControlBar = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs}; flex-wrap: wrap;
`;

const SortBtn = styled.button<{ $active?: boolean }>`
  font-size: 0.8rem; padding: 4px 12px; border-radius: ${'9999px'};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary + '12' : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
  transition: all 0.15s;
`;

const SortLabel = styled.span`font-size: 0.78rem; color: ${theme.colors.textLight}; margin-left: 4px;`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 360px) { grid-template-columns: 1fr; }
`;

const Empty = styled.div`
  grid-column: 1 / -1; text-align: center;
  color: ${theme.colors.textMuted}; padding: ${theme.spacing.xxl};
  font-size: 0.95rem;
`;

type BookSort = 'default' | 'count' | 'alpha' | 'icon';

export default function SikumimView({ initialSearch = '' }: { initialSearch?: string }) {
  const [books, setBooks] = useState<SikumBook[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [bookSort, setBookSort] = useState<BookSort>('default');
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<SikumBook | null>(null);
  const [selectedBook, setSelectedBook] = useState<SikumBook | null>(null);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/sikum-books').then(r => r.json()).then(setBooks as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? books.filter(b => b.name.toLowerCase().includes(q) || (b.author ?? '').toLowerCase().includes(q))
      : [...books];
    if (bookSort === 'count') return base.sort((a, b) => b.entryCount - a.entryCount);
    if (bookSort === 'alpha') return base.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    if (bookSort === 'icon') return base.sort((a, b) =>
      (a.icon ?? '📒').codePointAt(0)! - (b.icon ?? '📒').codePointAt(0)!);
    return base;
  }, [books, search, bookSort]);

  const handleDelete = async (book: SikumBook) => {
    if (!window.confirm(HE.SIKUMIM_BOOK_DELETE_CONFIRM)) return;
    await fetch(`/api/sikum-books/${book.id}`, { method: 'DELETE' });
    load();
  };

  if (selectedBook) {
    return (
      <SikumEntriesView
        book={selectedBook}
        onBack={() => { setSelectedBook(null); load(); }}
      />
    );
  }

  return (
    <Container>
      {(addOpen || editBook) && (
        <SikumBookForm
          book={editBook ?? undefined}
          onClose={() => { setAddOpen(false); setEditBook(null); }}
          onSaved={load}
        />
      )}

      <StickyBar>
        <TitleRow>
          <TitleGroup>
            <Title>{HE.SIKUMIM_TITLE}</Title>
            <Subtitle>{HE.SIKUMIM_SUBTITLE}</Subtitle>
          </TitleGroup>
          {role === 'admin' && (
            <AddBtn onClick={() => setAddOpen(true)}>{HE.SIKUMIM_ADD_BOOK_BTN}</AddBtn>
          )}
        </TitleRow>

        <SearchField value={search} onChange={setSearch} placeholder={HE.SIKUMIM_SEARCH_PLACEHOLDER} />

        <ControlBar>
          <SortLabel>מיון:</SortLabel>
          <SortBtn $active={bookSort === 'default'} onClick={() => setBookSort('default')}>{HE.SIKUMIM_BOOKS_SORT_DEFAULT}</SortBtn>
          <SortBtn $active={bookSort === 'count'} onClick={() => setBookSort('count')}>{HE.SIKUMIM_BOOKS_SORT_COUNT}</SortBtn>
          <SortBtn $active={bookSort === 'alpha'} onClick={() => setBookSort('alpha')}>{HE.SIKUMIM_BOOKS_SORT_ALPHA}</SortBtn>
          <SortBtn $active={bookSort === 'icon'} onClick={() => setBookSort('icon')}>{HE.SIKUMIM_BOOKS_SORT_ICON}</SortBtn>
        </ControlBar>
      </StickyBar>

      <Grid>
        {filtered.length === 0
          ? <Empty>{HE.SIKUMIM_BOOKS_EMPTY}</Empty>
          : filtered.map(b => (
              <SikumBookCard
                key={b.id}
                book={b}
                onClick={() => setSelectedBook(b)}
                onEdit={role === 'admin' ? () => setEditBook(b) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(b) : undefined}
              />
            ))
        }
      </Grid>
    </Container>
  );
}
