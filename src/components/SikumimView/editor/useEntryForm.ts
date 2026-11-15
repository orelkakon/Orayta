'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SikumEntry } from '@/types';
import { suggestNext } from '@/lib/sikum/suggest';
import { DraftData, DraftFields, draftScope, loadDraft, saveDraft, clearDraft } from '../sikumDraft';

/**
 * The summary editor's state: fields, the per-device draft (written on every
 * change, cleared only by a save or "התחל מחדש"), suggestions for the next
 * summary in the book, and saving — "save" closes, "save + next" keeps the
 * date and starts the next summary at once.
 */
const dayStr = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const todayStr = () => dayStr(0);
export const yesterdayStr = () => dayStr(-1);
const toDateInput = (d: string) => new Date(d).toISOString().slice(0, 10);

function initialFields(entry?: SikumEntry, date = todayStr()): DraftFields {
  return {
    title: entry?.title ?? '',
    text: entry?.text ?? '',
    date: entry ? toDateInput(entry.date) : date,
    dateEnd: entry?.dateEnd ? toDateInput(entry.dateEnd) : '',
    isRange: !!entry?.dateEnd,
    location: entry?.location ?? '',
  };
}

const sameFields = (a: DraftFields, b: DraftFields) =>
  (Object.keys(a) as (keyof DraftFields)[]).every(k => a[k] === b[k]);

export type SaveResult = 'ok' | 'error' | 'empty';

export function useEntryForm(bookId: string, entries: SikumEntry[], entry?: SikumEntry) {
  const scope = draftScope(bookId, entry);
  const [original] = useState(() => initialFields(entry));
  const [draft, setDraft] = useState<DraftData | null>(() => loadDraft(scope, entry));
  const [fields, setFields] = useState<DraftFields>(() => draft ?? original);
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState<SikumEntry[]>([]);

  const set = useCallback(<K extends keyof DraftFields>(k: K, v: DraftFields[K]) => setFields(f => ({ ...f, [k]: v })), []);
  const setText = useCallback((v: string) => set('text', v), [set]);

  useEffect(() => {
    const blank = !fields.title.trim() && !fields.text.trim() && !fields.location.trim();
    if ((entry && sameFields(fields, original)) || (!entry && blank)) clearDraft(scope);
    else saveDraft(scope, fields);
  }, [entry, original, scope, fields]);

  const suggestions = useMemo(
    () => (entry ? { titles: [], location: null } : suggestNext([...entries, ...recent])),
    [entry, entries, recent],
  );

  const discardDraft = useCallback(() => {
    clearDraft(scope);
    setDraft(null);
    setFields(initialFields(entry));
  }, [scope, entry]);

  const save = useCallback(async (next: boolean): Promise<SikumEntry | SaveResult> => {
    if (!fields.text.trim()) return 'empty';
    setSaving(true);
    try {
      const res = await fetch(entry ? `/api/sikum-entries/${entry.id}` : '/api/sikum-entries', {
        method: entry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId, title: fields.title, text: fields.text, date: fields.date,
          dateEnd: fields.isRange ? fields.dateEnd : null, location: fields.location,
        }),
      });
      if (!res.ok) return 'error';
      const saved = await res.json() as SikumEntry;
      clearDraft(scope);
      setDraft(null);
      if (next) {
        setRecent(r => [...r, saved]);
        setFields({ ...initialFields(undefined, fields.date) });
      }
      return saved;
    } catch {
      return 'error';
    } finally {
      setSaving(false);
    }
  }, [bookId, entry, fields, scope]);

  return { fields, set, setText, draft, discardDraft, suggestions, save, saving, dirty: !sameFields(fields, original) };
}
