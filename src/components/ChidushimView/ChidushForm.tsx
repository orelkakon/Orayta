'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Chidush } from '@/types';
import Modal from '@/components/common/Modal';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Field = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Label = styled.label`font-size: 0.88rem; font-weight: 600; color: ${theme.colors.textMuted};`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; background: ${theme.colors.surface}; color: ${theme.colors.text};
  outline: none; font-family: ${theme.fonts.body};
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; line-height: 1.75; background: ${theme.colors.surface};
  color: ${theme.colors.text}; outline: none; resize: vertical;
  min-height: 120px; font-family: ${theme.fonts.body};
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const BtnRow = styled.div`display: flex; gap: ${theme.spacing.md}; justify-content: flex-end; margin-top: ${theme.spacing.xs};`;

const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.95rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CancelBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

const ErrorMsg = styled.p`font-size: 0.85rem; color: ${theme.colors.error}; text-align: center;`;
const Hint = styled.p`font-size: 0.78rem; color: ${theme.colors.textLight}; margin-top: -${theme.spacing.xs};`;

interface Props { chidush?: Chidush; onClose: () => void; onSaved: () => void; }

export default function ChidushForm({ chidush, onClose, onSaved }: Props) {
  const [text,   setText]   = useState(chidush?.text   ?? '');
  const [source, setSource] = useState(chidush?.source ?? '');
  const [author, setAuthor] = useState(chidush?.author ?? '');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true); setError(null);
    const url    = chidush ? `/api/chidushim/${chidush.id}` : '/api/chidushim';
    const method = chidush ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), source: source.trim(), author: author.trim() }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else setError(HE.CHIDUSH_SAVE_ERROR);
    } catch { setError(HE.CHIDUSH_SAVE_ERROR); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={chidush ? HE.CHIDUSH_FORM_EDIT_TITLE : HE.CHIDUSH_FORM_ADD_TITLE} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>{HE.CHIDUSH_FORM_TEXT} *</Label>
          <Textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={HE.CHIDUSH_FORM_TEXT_PLACEHOLDER} required autoFocus />
        </Field>
        <Field>
          <Label>{HE.CHIDUSH_FORM_SOURCE}</Label>
          <Input value={source} onChange={e => setSource(e.target.value)}
            placeholder={HE.CHIDUSH_FORM_SOURCE_PLACEHOLDER} />
          <Hint>ניתן להשאיר ריק אם המקור לא ידוע</Hint>
        </Field>
        <Field>
          <Label>{HE.CHIDUSH_FORM_AUTHOR}</Label>
          <Input value={author} onChange={e => setAuthor(e.target.value)}
            placeholder={HE.CHIDUSH_FORM_AUTHOR_PLACEHOLDER} />
        </Field>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving || !text.trim()}>
            {saving ? HE.LOADING : HE.CHIDUSH_FORM_SAVE}
          </SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
