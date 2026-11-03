'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook } from '@/types';
import { getJson, freshUrl, isAbort } from '@/lib/apiClient';
import { deleteWithPasscode } from '@/lib/sikumDelete';
import { useOpenOnce } from './useOpenOnce';
import { useRole } from '@/components/common/RoleContext';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';
import SikumBookCard from './SikumBookCard';
import SikumBookForm from './SikumBookForm';
import SikumEntriesView from './SikumEntriesView';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
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

type BookSort = 'default' | 'count' | 'alpha' | 'icon';

interface Props { initialSearch?: string; initialBookId?: string; initialEntryId?: string }

export default function SikumimView({ initialSearch = '', initialBookId, initialEntryId }: Props) {
  const [books, setBooks] = useState<SikumBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [bookSort, setBookSort] = useState<BookSort>('default');
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<SikumBook | null>(null);
  const [selectedBook, setSelectedBook] = useState<SikumBook | null>(null);
  const role = useRole();
  useOpenOnce(books, initialBookId, setSelectedBook);

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal, fresh = false) => {
    if (!hasLoaded.current) setLoading(true);
    setLoadError(false);
    getJson<SikumBook[]>(fresh ? freshUrl('/api/sikum-books') : '/api/sikum-books', signal)
      .then(data => { setBooks(data); hasLoaded.current = true; setLoading(false); })
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

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
    setDeleteError(null);
    const result = await deleteWithPasscode(`/api/sikum-books/${book.id}`);
    if (result === 'ok') load(undefined, true);
    else if (result === 'wrong-pass') setDeleteError(HE.SIKUMIM_DELETE_PASSWORD_WRONG);
    else if (result === 'error') setDeleteError(HE.DELETE_ERROR);
  };

  if (selectedBook) {
    return (
      <SikumEntriesView
        book={selectedBook}
        initialEntryId={selectedBook.id === initialBookId ? initialEntryId : undefined}
        onBack={() => { setSelectedBook(null); load(undefined, true); }}
      />
    );
  }

  return (
    <Container>
      {(addOpen || editBook) && (
        <SikumBookForm
          book={editBook ?? undefined}
          onClose={() => { setAddOpen(false); setEditBook(null); }}
          onSaved={() => load(undefined, true)}
        />
      )}

      <PageHeader
          icon="pencil"
          title={HE.SIKUMIM_TITLE}
          subtitle={<>{HE.SIKUMIM_SUBTITLE}</>}
          actions={<>{role === 'admin' && (
            <Button $size="sm" onClick={() => setAddOpen(true)}><LineIcon name="plus" size={17} strokeWidth={2.2} />{HE.SIKUMIM_ADD_BOOK_BTN}</Button>
          )}</>}
        />

      <StickyBar>

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
        {deleteError && <InlineError role="alert">{deleteError}</InlineError>}
        {loading || loadError || filtered.length === 0
          ? (
            <ListState
              loading={loading}
              error={loadError}
              emptyText={books.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.SIKUMIM_EMPTY_STATE}
              onRetry={() => load()}
            />
          )
          : filtered.map((b, i) => (
              <SikumBookCard
                key={b.id}
                book={b}
                index={i}
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
