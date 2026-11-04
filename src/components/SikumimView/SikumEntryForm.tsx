'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { useAutoGrow } from '@/components/common/useAutoGrow';
import { SikumEntry } from '@/types';
import { DraftData, DraftFields, draftScope, loadDraft, saveDraft, clearDraft, countWords } from './sikumDraft';
import {
  Form, Label, TextLabel, Input, Textarea, TwoCol, RangeToggle, DraftBadge, ErrorMsg, FootRow, WordCount,
} from './SikumEntryForm.styles';

function toDateInput(d: string) { return new Date(d).toISOString().slice(0, 10); }
const todayStr = () => new Date().toISOString().slice(0, 10);

function initialFields(entry?: SikumEntry): DraftFields {
  return {
    title: entry?.title ?? '',
    text: entry?.text ?? '',
    date: entry ? toDateInput(entry.date) : todayStr(),
    dateEnd: entry?.dateEnd ? toDateInput(entry.dateEnd) : '',
    isRange: !!entry?.dateEnd,
    location: entry?.location ?? '',
  };
}

const sameFields = (a: DraftFields, b: DraftFields) =>
  (Object.keys(a) as (keyof DraftFields)[]).every(k => a[k] === b[k]);

interface Props { entry?: SikumEntry; bookId: string; onClose: () => void; onSaved: () => void; }

export default function SikumEntryForm({ entry, bookId, onClose, onSaved }: Props) {
  const scope = draftScope(bookId, entry);
  const [original] = useState(() => initialFields(entry));
  const [draft] = useState<DraftData | null>(() => loadDraft(scope, entry));
  const start = draft ?? original;

  const [title,    setTitle]    = useState(start.title);
  const [text,     setText]     = useState(start.text);
  const [date,     setDate]     = useState(start.date);
  const [dateEnd,  setDateEnd]  = useState(start.dateEnd);
  const [isRange,  setIsRange]  = useState(start.isRange);
  const [location, setLocation] = useState(start.location);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const formId = useId();
  const textRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(textRef, text);

  useEffect(() => {
    const fields = { title, text, date, dateEnd, isRange, location };
    if (entry && sameFields(fields, original)) clearDraft(scope);
    else saveDraft(scope, fields);
  }, [entry, original, scope, title, text, date, dateEnd, isRange, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError(HE.ERROR_REQUIRED); return; }
    setSaving(true);
    try {
      const url = entry ? `/api/sikum-entries/${entry.id}` : '/api/sikum-entries';
      const res = await fetch(url, {
        method: entry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, title, text, date, dateEnd: isRange ? dateEnd : null, location }),
      });
      if (!res.ok) throw new Error();
      clearDraft(scope);
      onSaved(); onClose();
    } catch {
      setError(HE.SIKUMIM_ENTRY_SAVE_ERROR);
    } finally { setSaving(false); }
  };

  // ⌘/Ctrl+Enter saves from inside the text.
  const onTextKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
  };

  const words = countWords(text);
  const footer = (<>
    {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
    <FootRow>
      <WordCount aria-live="polite">{words > 0 && `${words.toLocaleString('he-IL')} ${HE.SIKUMIM_WORDS}`}</WordCount>
      <Button $variant="ghost" onClick={() => { clearDraft(scope); onClose(); }}>{HE.CANCEL}</Button>
      <Button type="submit" form={formId} $variant="primary" disabled={saving}>{HE.SIKUMIM_ENTRY_FORM_SAVE}</Button>
    </FootRow>
  </>);

  return (
    <Modal
      onClose={onClose}
      title={entry ? HE.SIKUMIM_ENTRY_FORM_EDIT_TITLE : HE.SIKUMIM_ENTRY_FORM_ADD_TITLE}
      footer={footer}
      maxWidth={820}
      full
      guarded
    >
      <Form id={formId} onSubmit={handleSubmit}>
        {draft && draft.text && <DraftBadge>✏️ {HE.SIKUMIM_DRAFT_RESTORED}</DraftBadge>}
        <TwoCol>
          <Label>
            {HE.SIKUMIM_ENTRY_FORM_TITLE}
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={HE.SIKUMIM_ENTRY_FORM_TITLE_PLACEHOLDER} />
          </Label>
          <Label>
            {HE.SIKUMIM_ENTRY_FORM_DATE}
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Label>
        </TwoCol>
        <TwoCol>
          <RangeToggle>
            <input type="checkbox" checked={isRange} onChange={e => setIsRange(e.target.checked)} />
            {HE.SIKUMIM_ENTRY_FORM_RANGE_TOGGLE}
          </RangeToggle>
          {isRange && (
            <Label>
              {HE.SIKUMIM_ENTRY_FORM_DATE_END}
              <Input type="date" value={dateEnd} min={date} onChange={e => setDateEnd(e.target.value)} />
            </Label>
          )}
        </TwoCol>
        <Label>
          {HE.SIKUMIM_ENTRY_FORM_LOCATION}
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder={HE.SIKUMIM_ENTRY_FORM_LOCATION_PLACEHOLDER} />
        </Label>
        <TextLabel>
          {HE.SIKUMIM_ENTRY_FORM_TEXT} *
          <Textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onTextKey}
            placeholder={HE.SIKUMIM_ENTRY_FORM_TEXT_PLACEHOLDER}
            autoFocus={!entry}
          />
        </TextLabel>
      </Form>
    </Modal>
  );
}
