'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { SikumBook } from '@/types';
import { BookGlyph } from '@/components/common/LineIcons';

export const BOOK_ICONS = ['📒', '📕', '📗', '📘', '📙'];

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
const PickerLabel = styled.div`font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};`;
const IconGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;
`;
const IconBtn = styled.button<{ $active: boolean }>`
  width: 38px; height: 38px; font-size: 1.3rem;
  border-radius: ${theme.radii.sm};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  background: ${({ $active }) => ($active ? theme.colors.primary + '18' : theme.colors.surface)};
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: ${theme.colors.primary}; }
`;
const ErrorMsg = styled.p`font-size: 0.82rem; color: #dc2626;`;
const BtnRow = styled.div`display: flex; gap: ${theme.spacing.sm}; justify-content: flex-end;`;
const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; } &:disabled { opacity: 0.5; }
`;
const CancelBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.9rem; color: ${theme.colors.textMuted};
  &:hover { background: ${theme.colors.borderLight}; }
`;

interface Props { book?: SikumBook; onClose: () => void; onSaved: () => void; }

export default function SikumBookForm({ book, onClose, onSaved }: Props) {
  const [name,   setName]   = useState(book?.name   ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [icon,   setIcon]   = useState(book?.icon   ?? '📒');
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(HE.ERROR_REQUIRED); return; }
    setSaving(true);
    try {
      const url = book ? `/api/sikum-books/${book.id}` : '/api/sikum-books';
      const res = await fetch(url, {
        method: book ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, author, icon }),
      });
      if (!res.ok) throw new Error();
      onSaved(); onClose();
    } catch {
      setError(HE.SIKUMIM_BOOK_SAVE_ERROR);
    } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title={book ? HE.SIKUMIM_BOOK_FORM_EDIT_TITLE : HE.SIKUMIM_BOOK_FORM_ADD_TITLE}>
      <Form onSubmit={handleSubmit}>
        <Label>
          {HE.SIKUMIM_BOOK_FORM_NAME}
          <Input value={name} onChange={e => setName(e.target.value)} placeholder={HE.SIKUMIM_BOOK_FORM_NAME_PLACEHOLDER} autoFocus />
        </Label>
        <Label>
          {HE.SIKUMIM_BOOK_FORM_AUTHOR}
          <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder={HE.SIKUMIM_BOOK_FORM_AUTHOR_PLACEHOLDER} />
        </Label>

        <div>
          <PickerLabel>{HE.SIKUMIM_BOOK_FORM_ICON}</PickerLabel>
          <IconGrid>
            {BOOK_ICONS.map(ic => (
              <IconBtn key={ic} type="button" $active={icon === ic} onClick={() => setIcon(ic)}><BookGlyph icon={ic} size={22} /></IconBtn>
            ))}
          </IconGrid>
        </div>

        {error && <ErrorMsg>{error}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving}>{HE.SIKUMIM_BOOK_FORM_SAVE}</SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
