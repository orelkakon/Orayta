'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { SikumEntry } from '@/types';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Label = styled.label`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; background: ${theme.colors.surface}; color: ${theme.colors.text};
  direction: rtl;
  &:focus { outline: 2px solid ${theme.colors.primary}40; border-color: ${theme.colors.primary}; }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; background: ${theme.colors.surface}; color: ${theme.colors.text};
  direction: rtl; resize: vertical; min-height: 160px; line-height: 1.7;
  font-family: ${theme.fonts.body};
  &:focus { outline: 2px solid ${theme.colors.primary}40; border-color: ${theme.colors.primary}; }
`;

const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const ErrorMsg = styled.p`font-size: 0.82rem; color: #dc2626;`;

const BtnRow = styled.div`display: flex; gap: ${theme.spacing.sm}; justify-content: flex-end;`;

const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; }
`;

const CancelBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.9rem; color: ${theme.colors.textMuted};
  &:hover { background: ${theme.colors.borderLight}; }
`;

function toDateInput(dateStr: string) {
  return new Date(dateStr).toISOString().slice(0, 10);
}

interface Props {
  entry?: SikumEntry;
  bookId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function SikumEntryForm({ entry, bookId, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [text, setText] = useState(entry?.text ?? '');
  const [date, setDate] = useState(entry ? toDateInput(entry.date) : new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState(entry?.location ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError(HE.ERROR_REQUIRED); return; }
    setSaving(true);
    try {
      const url = entry ? `/api/sikum-entries/${entry.id}` : '/api/sikum-entries';
      const res = await fetch(url, {
        method: entry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, title, text, date, location }),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } catch {
      setError(HE.SIKUMIM_ENTRY_SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title={entry ? HE.SIKUMIM_ENTRY_FORM_EDIT_TITLE : HE.SIKUMIM_ENTRY_FORM_ADD_TITLE}>
      <Form onSubmit={handleSubmit}>
        <TwoCol>
          <Label>
            {HE.SIKUMIM_ENTRY_FORM_TITLE}
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder={HE.SIKUMIM_ENTRY_FORM_TITLE_PLACEHOLDER} />
          </Label>
          <Label>
            {HE.SIKUMIM_ENTRY_FORM_DATE}
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Label>
        </TwoCol>
        <Label>
          {HE.SIKUMIM_ENTRY_FORM_LOCATION}
          <Input value={location} onChange={e => setLocation(e.target.value)}
            placeholder={HE.SIKUMIM_ENTRY_FORM_LOCATION_PLACEHOLDER} />
        </Label>
        <Label>
          {HE.SIKUMIM_ENTRY_FORM_TEXT} *
          <Textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={HE.SIKUMIM_ENTRY_FORM_TEXT_PLACEHOLDER} autoFocus={!entry} />
        </Label>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving}>{HE.SIKUMIM_ENTRY_FORM_SAVE}</SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
