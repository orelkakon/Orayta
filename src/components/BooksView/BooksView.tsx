'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';
import { useRole } from '@/components/common/RoleContext';
import BookCard from './BookCard';
import BookForm from './BookForm';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const TitleGroup = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  flex-shrink: 0; align-self: flex-start;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${theme.colors.textMuted};
`;

const CountBadge = styled.span`
  font-size: 0.82rem;
  color: ${theme.colors.textLight};
`;

const SearchInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  width: 100%;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
`;

export default function BooksView() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/books').then(r => r.json()).then(setBooks as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [books, search]);

  const handleDelete = async (book: Book) => {
    if (!window.confirm(HE.BOOK_DELETE_CONFIRM)) return;
    const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <Container>
      {(addOpen || editBook) && (
        <BookForm
          book={editBook ?? undefined}
          onClose={() => { setAddOpen(false); setEditBook(null); }}
          onSaved={load}
        />
      )}

      <TitleRow>
        <TitleGroup>
          <Title>{HE.BOOKS_TITLE}</Title>
          <Subtitle>
            {HE.BOOKS_SUBTITLE}
            {books.length > 0 && <CountBadge> {HE.BOOKS_COUNT(books.length)}</CountBadge>}
          </Subtitle>
        </TitleGroup>
        {role === 'admin' && (
          <AddBtn onClick={() => setAddOpen(true)}>{HE.BOOK_ADD_BTN}</AddBtn>
        )}
      </TitleRow>

      <SearchInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={HE.BOOKS_SEARCH_PLACEHOLDER}
      />

      <Grid>
        {filtered.length === 0
          ? <Empty>{HE.BOOKS_EMPTY}</Empty>
          : filtered.map(b => (
              <BookCard
                key={b.id}
                book={b}
                onEdit={role === 'admin' ? () => setEditBook(b) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(b) : undefined}
              />
            ))
        }
      </Grid>
    </Container>
  );
}
