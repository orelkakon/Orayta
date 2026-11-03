'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';
import { getJson, freshUrl, isAbort } from '@/lib/apiClient';
import { useRole } from '@/components/common/RoleContext';
import BookCard from './BookCard';
import BookForm from './BookForm';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;






const CountBadge = styled.span`
  font-size: 0.82rem;
  color: ${theme.colors.textLight};
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  @media (max-width: 480px) {
    gap: ${theme.spacing.xs};
  }
  @media (max-width: 320px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

interface Props { onViewRabbi?: (name: string) => void; }

export default function BooksView({ onViewRabbi }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [search, setSearch] = useState('');
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const role = useRole();

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal, fresh = false) => {
    if (!hasLoaded.current) setLoading(true);
    setLoadError(false);
    getJson<Book[]>(fresh ? freshUrl('/api/books') : '/api/books', signal)
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
    if (!q) return books;
    return books.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [books, search]);

  const handleDelete = async (book: Book) => {
    if (!window.confirm(HE.BOOK_DELETE_CONFIRM)) return;
    setDeleteError(false);
    const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
    if (res.ok) load(undefined, true);
    else setDeleteError(true);
  };

  return (
    <Container>
      {(addOpen || editBook) && (
        <BookForm
          book={editBook ?? undefined}
          onClose={() => { setAddOpen(false); setEditBook(null); }}
          onSaved={() => load(undefined, true)}
        />
      )}

      <PageHeader
          icon="books"
          title={HE.BOOKS_TITLE}
          subtitle={<>{HE.BOOKS_SUBTITLE}
              {books.length > 0 && <CountBadge> {HE.BOOKS_COUNT(books.length)}</CountBadge>}</>}
          actions={<>{role === 'admin' && (
            <Button $size="sm" onClick={() => setAddOpen(true)}><LineIcon name="plus" size={17} strokeWidth={2.2} />{HE.BOOK_ADD_BTN}</Button>
          )}</>}
        />

      <StickyBar>

        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={HE.BOOKS_SEARCH_PLACEHOLDER}
        />
      </StickyBar>

      <Grid>
        {deleteError && <InlineError role="alert">{HE.DELETE_ERROR}</InlineError>}
        {loading || loadError || filtered.length === 0
          ? (
            <ListState
              loading={loading}
              error={loadError}
              emptyText={books.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.BOOKS_EMPTY_STATE}
              onRetry={() => load()}
            />
          )
          : filtered.map(b => (
              <BookCard
                key={b.id}
                book={b}
                onEdit={role === 'admin' ? () => setEditBook(b) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(b) : undefined}
                onViewRabbi={onViewRabbi}
              />
            ))
        }
      </Grid>
    </Container>
  );
}
