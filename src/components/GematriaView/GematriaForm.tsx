'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Gematria } from '@/types';
import { calculateGematria } from '@/lib/gematria';
import Modal from '@/components/common/Modal';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Field = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Label = styled.label`font-size: 0.88rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1.1rem; font-family: ${theme.fonts.body}; background: ${theme.colors.surface}; color: ${theme.colors.text};
  outline: none; direction: rtl; text-align: center;
  &:focus { border-color: ${theme.colors.primaryLight}; }`;
const ValuePreview = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.4rem;
  font-weight: 700;
  color: ${theme.colors.secondary};
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm};
  text-align: center;
`;
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

const MatchesBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 3px solid ${theme.colors.accent};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;
const MatchesLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${theme.colors.accent};
  letter-spacing: 0.04em;
`;
const MatchChips = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.xs};`;
const MatchChip = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.9rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
`;

interface Props {
  gematria?: Gematria;
  allItems?: Gematria[];
  onClose: () => void;
  onSaved: () => void;
}

export default function GematriaForm({ gematria, allItems, onClose, onSaved }: Props) {
  const [word, setWord] = useState(gematria?.word ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const value = calculateGematria(word);

  const matches = useMemo(() => {
    if (!allItems || value === 0) return [];
    return allItems.filter(g => g.value === value && g.id !== gematria?.id);
  }, [allItems, value, gematria?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || value === 0) return;
    setSaving(true);
    setSaveError(null);
    const url = gematria ? `/api/gematria/${gematria.id}` : '/api/gematria';
    const method = gematria ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else if (res.status === 409) setSaveError(HE.DUPLICATE_GEMATRIA);
      else setSaveError(HE.GEMATRIA_SAVE_ERROR);
    } catch {
      setSaveError(HE.GEMATRIA_SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={gematria ? HE.GEMATRIA_FORM_EDIT_TITLE : HE.GEMATRIA_FORM_ADD_TITLE} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>{HE.GEMATRIA_FORM_WORD} *</Label>
          <Input
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder={HE.GEMATRIA_FORM_WORD_PLACEHOLDER}
            required
            autoFocus
          />
        </Field>
        <Field>
          <Label>{HE.GEMATRIA_FORM_VALUE}</Label>
          <ValuePreview>{value}</ValuePreview>
        </Field>
        {matches.length > 0 && (
          <MatchesBox>
            <MatchesLabel>🔗 {HE.GEMATRIA_FORM_MATCHES}</MatchesLabel>
            <MatchChips>
              {matches.map(m => <MatchChip key={m.id}>{m.word}</MatchChip>)}
            </MatchChips>
          </MatchesBox>
        )}
        {saveError && <ErrorMsg>{saveError}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving || !word.trim() || value === 0}>
            {saving ? HE.LOADING : HE.GEMATRIA_FORM_SAVE}
          </SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
