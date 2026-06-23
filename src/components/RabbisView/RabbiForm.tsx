'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';
import Modal from '@/components/common/Modal';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Row2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  @media (max-width: 500px) { grid-template-columns: 1fr; }`;
const Field = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Label = styled.label`font-size: 0.88rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; background: ${theme.colors.surface}; color: ${theme.colors.text};
  outline: none; &:focus { border-color: ${theme.colors.primaryLight}; }`;
const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; background: ${theme.colors.surface}; color: ${theme.colors.text};
  outline: none; &:focus { border-color: ${theme.colors.primaryLight}; }`;
const Textarea = styled.textarea`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; font-family: ${theme.fonts.body}; line-height: 1.7;
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  resize: vertical; min-height: 100px; direction: rtl; outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }`;
const CheckRow = styled.label`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: 0.9rem; color: ${theme.colors.text}; cursor: pointer;`;
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
  rabbi?: Rabbi;
  onClose: () => void;
  onSaved: () => void;
}

type FormData = {
  name: string; fullName: string; category: RabbiCategory;
  sortYear: string; datePeriod: string; isAlive: boolean; bio: string; deathDate: string;
};

export default function RabbiForm({ rabbi, onClose, onSaved }: Props) {
  const [data, setData] = useState<FormData>({
    name: rabbi?.name ?? '',
    fullName: rabbi?.fullName ?? '',
    category: (rabbi?.category as RabbiCategory) ?? 'zugot',
    sortYear: rabbi ? String(rabbi.sortYear) : '',
    datePeriod: rabbi?.datePeriod ?? '',
    isAlive: rabbi?.isAlive ?? false,
    bio: rabbi?.bio ?? '',
    deathDate: rabbi?.deathDate ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (k: keyof FormData, v: string | boolean) =>
    setData(d => ({ ...d, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.bio.trim() || !data.datePeriod.trim()) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      name: data.name.trim(),
      fullName: data.fullName.trim() || undefined,
      sortYear: parseInt(data.sortYear) || 0,
      datePeriod: data.datePeriod.trim(),
      isAlive: data.isAlive,
      bio: data.bio.trim(),
      category: data.category,
      deathDate: data.deathDate.trim() || undefined,
    };
    const url = rabbi ? `/api/rabbis/${rabbi.id}` : '/api/rabbis';
    const method = rabbi ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { onSaved(); onClose(); }
      else if (res.status === 409) setSaveError(HE.DUPLICATE_RABBI);
      else setSaveError(HE.RABBI_SAVE_ERROR);
    } catch {
      setSaveError(HE.RABBI_SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={rabbi ? HE.RABBI_FORM_EDIT_TITLE : HE.RABBI_FORM_ADD_TITLE} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <Row2>
          <Field>
            <Label>{HE.RABBI_FORM_NAME} *</Label>
            <Input value={data.name} onChange={e => set('name', e.target.value)} required />
          </Field>
          <Field>
            <Label>{HE.RABBI_FORM_FULL_NAME}</Label>
            <Input value={data.fullName} onChange={e => set('fullName', e.target.value)} />
          </Field>
        </Row2>
        <Row2>
          <Field>
            <Label>{HE.RABBI_FORM_CATEGORY} *</Label>
            <Select value={data.category} onChange={e => set('category', e.target.value as RabbiCategory)}>
              {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </Select>
          </Field>
          <Field>
            <Label>{HE.RABBI_FORM_SORT_YEAR}</Label>
            <Input type="number" value={data.sortYear} onChange={e => set('sortYear', e.target.value)} placeholder="-160 / 1200" />
          </Field>
        </Row2>
        <Row2>
          <Field>
            <Label>{HE.RABBI_FORM_DATE_PERIOD} *</Label>
            <Input value={data.datePeriod} onChange={e => set('datePeriod', e.target.value)} placeholder="1040–1105" required />
          </Field>
          <Field style={{ justifyContent: 'flex-end' }}>
            <CheckRow>
              <input type="checkbox" checked={data.isAlive} onChange={e => set('isAlive', e.target.checked)} />
              {HE.RABBI_FORM_IS_ALIVE}
            </CheckRow>
          </Field>
        </Row2>
        <Field>
          <Label>{HE.RABBI_FORM_BIO} *</Label>
          <Textarea value={data.bio} onChange={e => set('bio', e.target.value)} required />
        </Field>
        <Field>
          <Label>{HE.RABBI_FORM_DEATH_DATE}</Label>
          <Input
            value={data.deathDate}
            onChange={e => set('deathDate', e.target.value)}
            placeholder={HE.RABBI_FORM_DEATH_DATE_PLACEHOLDER}
            dir="rtl"
          />
        </Field>
        {saveError && <ErrorMsg>{saveError}</ErrorMsg>}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>{HE.CANCEL}</CancelBtn>
          <SaveBtn type="submit" disabled={saving}>{saving ? HE.LOADING : HE.RABBI_FORM_SAVE}</SaveBtn>
        </BtnRow>
      </Form>
    </Modal>
  );
}
