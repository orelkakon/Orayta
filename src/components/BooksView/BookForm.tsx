'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';
import Modal from '@/components/common/Modal';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Field = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Label = styled.label`font-size: 0.88rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; font-family: ${theme.fonts.body}; background: ${theme.colors.surface}; color: ${theme.colors.text};
  outline: none; direction: rtl;
  &:focus { border-color: ${theme.colors.primaryLight}; }`;
const BtnRow = styled.div`display: flex; gap: ${theme.spacing.md}; justify-content: flex-end; margin-top: ${theme.spacing.sm};`;
const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.95rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }`;
const CancelBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }`;
const ErrorMsg = styled.p`font-size: 0.85rem; color: ${theme.colors.error}; text-align: center;`;

interface Props {
  book?: Book;
  onClose: () => void;
  onSaved: () => void;
}

export default function BookForm({ book, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setSaving(true);
    setSaveError(null);
    const url = book ? `/api/books/${book.id}` : '/api/books';
    const method = book ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), author: author.trim() }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else if (res.status === 409) setSaveError(HE.DUPLICATE_BOOK);
      else setSaveError(HE.BOOK_SAVE_ERROR);
    } catch {
      setSaveError(HE.BOOK_SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={book ? HE.BOOK_FORM_EDIT_TITLE : HE.BOOK_FORM_ADD_TITLE} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>{HE.BOOK_FORM_TITLE_LABEL} *</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={HE.BOOK_FORM_TITLE_PLACEHOLDER}
            required
            autoFocus
          />
        </Field>
        <Field>
          <Label>{HE.BOOK_FORM_AUTHOR_LABEL} *</Label>
          <Input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder={HE.BOOK_FORM_AUTHOR_PLACEHOLDER}
            required
          />
        </Field>
        {saveError && <ErrorMsg>{saveError}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving || !title.trim() || !author.trim()}>
            {saving ? HE.LOADING : HE.BOOK_FORM_SAVE}
          </SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
