'use client';

import { useState, useId, useRef } from 'react';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { useAutoGrow } from '@/components/common/useAutoGrow';
import { SikumEntry } from '@/types';
import { countWords, readingMinutes } from '@/lib/sikum/typography';
import { useEntryForm } from './editor/useEntryForm';
import { useDictation } from './editor/useDictation';
import { usePunctuate } from './editor/usePunctuate';
import { insertAtCaret } from './editor/insertText';
import MetaFields from './editor/MetaFields';
import WritingToolbar from './editor/WritingToolbar';
import { Form, TextLabel, Textarea, DraftBadge, ErrorMsg, SavedMsg, FootRow, Status } from './SikumEntryForm.styles';

/**
 * The summary editor — built for writing on an iPhone: a full-screen sheet
 * above the keyboard, the writing toolbar (dictation, ״ ׳ –, punctuation)
 * pinned on top of the keyboard, a draft kept on the device at every
 * keystroke (closing never loses text), suggestions for the next summary and
 * "save + next" for a run of summaries. Typography is fixed by the server.
 */
interface Props {
  entry?: SikumEntry;
  bookId: string;
  bookName: string;
  entries: SikumEntry[];
  onClose: () => void;
  onSaved: () => void;
}

export default function SikumEntryForm({ entry, bookId, bookName, entries, onClose, onSaved }: Props) {
  const form = useEntryForm(bookId, entries, entry);
  const { fields, set, setText } = form;
  const [error, setError] = useState('');
  const [savedNext, setSavedNext] = useState(false);
  const formId = useId();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  useAutoGrow(textRef, fields.text);

  const dictation = useDictation(textRef, setText, { book: bookName, title: fields.title });
  const punct = usePunctuate(textRef, setText);
  const busy = form.saving || dictation.recording || dictation.pending > 0;

  const submit = async (next: boolean) => {
    if (busy) return;
    setError('');
    const r = await form.save(next);
    if (r === 'empty') { setError(HE.ERROR_REQUIRED); return; }
    if (r === 'error') { setError(HE.SIKUMIM_ENTRY_SAVE_ERROR); return; }
    onSaved();
    if (!next) { onClose(); return; }
    punct.clear();
    setSavedNext(true);
    setTimeout(() => setSavedNext(false), 2600);
    titleRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const onSymbol = (s: string) => {
    const title = titleRef.current;
    if (title && document.activeElement === title) {
      const a = title.selectionStart ?? title.value.length;
      const b = title.selectionEnd ?? a;
      set('title', title.value.slice(0, a) + s + title.value.slice(b));
      requestAnimationFrame(() => { try { title.setSelectionRange(a + s.length, a + s.length); } catch {} });
      return;
    }
    if (textRef.current) insertAtCaret(textRef.current, setText, () => s);
  };

  const words = countWords(fields.text);
  const p = punct.status;
  const footer = (<>
    <WritingToolbar
      hasText={!!fields.text.trim()}
      onSymbol={onSymbol}
      dictation={{ ...dictation, denied: dictation.state === 'denied', error: dictation.state === 'error' }}
      punct={{
        busy: p.kind === 'busy', done: p.kind === 'done' && p.after === fields.text,
        error: p.kind === 'error' ? p.text : null, run: () => void punct.run(), undo: punct.undo, clear: punct.clear,
      }}
    />
    {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
    {savedNext && <SavedMsg role="status">{HE.SE_SAVED_NEXT}</SavedMsg>}
    <FootRow>
      <Status aria-live="polite">
        {words > 0 && <span>{words.toLocaleString('he-IL')} {HE.SIKUMIM_WORDS} · {HE.SE_READ_MIN(readingMinutes(words))}</span>}
        {form.dirty && <span>{form.saving ? HE.SE_SAVING : `✓ ${HE.SE_AUTOSAVED}`}</span>}
      </Status>
      <Button $variant="ghost" onClick={onClose}>{HE.CLOSE}</Button>
      {!entry && <Button $variant="tonal" disabled={busy} onClick={() => void submit(true)}>{HE.SE_SAVE_NEXT}</Button>}
      <Button type="submit" form={formId} $variant="primary" disabled={busy}>{HE.SIKUMIM_ENTRY_FORM_SAVE}</Button>
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
      <Form id={formId} onSubmit={e => { e.preventDefault(); void submit(false); }}>
        {form.draft && form.draft.text && (
          <DraftBadge>
            ✏️ {HE.SIKUMIM_DRAFT_RESTORED}
            <button type="button" onClick={form.discardDraft}>{HE.SE_DRAFT_DISCARD}</button>
          </DraftBadge>
        )}
        <MetaFields fields={fields} set={set} suggestions={form.suggestions} titleRef={titleRef} textRef={textRef} />
        <TextLabel>
          {HE.SIKUMIM_ENTRY_FORM_TEXT} *
          <Textarea
            ref={textRef}
            value={fields.text}
            onChange={e => { setText(e.target.value); if (p.kind === 'error') punct.clear(); }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void submit(false); } }}
            placeholder={HE.SIKUMIM_ENTRY_FORM_TEXT_PLACEHOLDER}
            spellCheck
            autoCorrect="on"
            dir="rtl"
          />
        </TextLabel>
      </Form>
    </Modal>
  );
}
