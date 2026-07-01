'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { SikumBook } from '@/types';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Label = styled.label`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  direction: rtl;
  &:focus { outline: 2px solid ${theme.colors.primary}40; border-color: ${theme.colors.primary}; }
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

interface Props {
  book?: SikumBook;
  onClose: () => void;
  onSaved: () => void;
}

export default function SikumBookForm({ book, onClose, onSaved }: Props) {
  const [name, setName] = useState(book?.name ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [error, setError] = useState('');
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
        body: JSON.stringify({ name, author }),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } catch {
      setError(HE.SIKUMIM_BOOK_SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title={book ? HE.SIKUMIM_BOOK_FORM_EDIT_TITLE : HE.SIKUMIM_BOOK_FORM_ADD_TITLE}>
      <Form onSubmit={handleSubmit}>
        <Label>
          {HE.SIKUMIM_BOOK_FORM_NAME}
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={HE.SIKUMIM_BOOK_FORM_NAME_PLACEHOLDER}
            autoFocus
          />
        </Label>
        <Label>
          {HE.SIKUMIM_BOOK_FORM_AUTHOR}
          <Input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder={HE.SIKUMIM_BOOK_FORM_AUTHOR_PLACEHOLDER}
          />
        </Label>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving}>{HE.SIKUMIM_BOOK_FORM_SAVE}</SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
