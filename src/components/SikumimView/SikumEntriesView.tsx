'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { SikumBook, SikumEntry } from '@/types';
import { getJson, isAbort } from '@/lib/apiClient';
import { deleteWithPasscode } from '@/lib/sikumDelete';
import { useOpenOnce } from './useOpenOnce';
import { useRole } from '@/components/common/RoleContext';
import SikumEntryCard from './SikumEntryCard';
import SikumEntryForm from './SikumEntryForm';
import SikumEntryModal from './SikumEntryModal';
import SikumCubesGrid from './SikumCubesGrid';
import SikumEntriesControls from './SikumEntriesControls';
import { useSikumOrderPref } from './useSikumOrderPref';
import { sortEntries } from '@/lib/sikum/order';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';

import {
  Container, StickyBar, HeaderRow, BackBtn, BookTitle, BookAuthor, AddBtn, List,
} from './SikumEntriesView.styles';

interface Props {
  book: SikumBook;
  initialEntryId?: string;
  onBack: () => void;
}

export default function SikumEntriesView({ book, initialEntryId, onBack }: Props) {
  const [entries, setEntries] = useState<SikumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { pref, flipSeen, pickSort, setView } = useSikumOrderPref(book.id);
  const viewMode = pref.view;
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SikumEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<SikumEntry | null>(null);
  const role = useRole();
  useOpenOnce(entries, initialEntryId, setViewEntry);

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal) => {
    if (!hasLoaded.current) setLoading(true); setLoadError(false);
    getJson<SikumEntry[]>(`/api/sikum-entries?bookId=${book.id}`, signal)
      .then(data => { setEntries(data); hasLoaded.current = true; setLoading(false); })
      .catch((e: unknown) => { if (!isAbort(e)) { setLoadError(true); setLoading(false); } });
  }, [book.id]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const found = entries
      .filter(e => !q || [e.title, e.text, e.location].some(f => (f ?? '').toLowerCase().includes(q)));
    return sortEntries(found, pref.by, pref.rev[pref.by]);
  }, [entries, pref, search]);

  const handleDelete = async (entry: SikumEntry) => {
    if (!window.confirm(HE.SIKUMIM_ENTRY_DELETE_CONFIRM)) return;
    setDeleteError(null);
    const result = await deleteWithPasscode(`/api/sikum-entries/${entry.id}`);
    if (result === 'cancelled') return;
    setViewEntry(null);
    if (result === 'ok') load();
    else if (result === 'wrong-pass') setDeleteError(HE.SIKUMIM_DELETE_PASSWORD_WRONG);
    else setDeleteError(HE.DELETE_ERROR);
  };

  return (
    <Container>
      {(addOpen || editEntry) && (
        <SikumEntryForm
          entry={editEntry ?? undefined}
          bookId={book.id}
          bookName={book.name}
          entries={entries}
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

        <SikumEntriesControls pref={pref} flipSeen={flipSeen} onPickSort={pickSort} onView={setView} />
      </StickyBar>

      {deleteError && <InlineError role="alert">{deleteError}</InlineError>}
      {loading || loadError || sorted.length === 0
        ? <ListState
            loading={loading} error={loadError} onRetry={() => load()}
            emptyText={entries.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.SIKUMIM_ENTRIES_EMPTY}
          />
        : viewMode === 'grid'
          ? <SikumCubesGrid entries={sorted} onOpen={setViewEntry} />
          : (
            <List>
              {sorted.map((e, i) => (
                <SikumEntryCard
                  key={e.id}
                  entry={e}
                  index={i}
                  onClick={() => setViewEntry(e)}
                  onEdit={role === 'admin' ? () => setEditEntry(e) : undefined}
                  onDelete={role === 'admin' ? () => handleDelete(e) : undefined}
                />
              ))}
            </List>
          )
      }
    </Container>
  );
}
