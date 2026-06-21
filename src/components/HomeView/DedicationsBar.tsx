'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import { Dedication } from '@/types';

/* Scroll left: 0 → -50% of doubled tape = exactly one copy's width */
const scrollLeft = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const Bar = styled.div`
  width: 100%; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const BarTitle = styled.div`
  padding: 6px ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.07em; text-align: center;
`;

/* Force LTR so translateX(-50%) is always predictable regardless of page RTL */
const Track = styled.div`
  overflow: hidden;
  padding: 10px 0;
  direction: ltr;
`;

const Tape = styled.div<{ $secs: number }>`
  display: inline-flex;
  /* No gap — use padding on each item for uniform spacing including at the seam */
  white-space: nowrap;
  will-change: transform;
  animation: ${scrollLeft} ${p => p.$secs}s linear infinite;
`;

/* Each item carries its own equal padding on both sides so seam is invisible */
const Item = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 28px;
  font-family: ${theme.fonts.body};
  font-size: 0.92rem;
  color: ${theme.colors.primary};
  white-space: nowrap;
  direction: rtl;
`;

const TypeLabel = styled.span`
  font-size: 0.75rem; color: ${theme.colors.textMuted}; font-weight: 600;
`;

const Dot = styled.span`
  color: ${theme.colors.secondary};
  font-size: 1rem;
  line-height: 1;
  user-select: none;
`;

/* ── Admin section ── */
const AdminWrap = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const AdminRow = styled.div`
  display: flex; align-items: center; justify-content: center;
`;

const AddBtn = styled.button`
  padding: 4px 14px; font-size: 0.78rem; font-weight: 600;
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.sm};
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const FormCard = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md}; width: 100%; max-width: 420px; margin: 0 auto;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;
const FormTitle = styled.h3`font-size: 1rem; font-weight: 700; color: ${theme.colors.primary};`;
const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.95rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none; width: 100%;
`;
const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.95rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none; width: 100%;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;
const BtnRow = styled.div`display: flex; gap: ${theme.spacing.sm};`;
const SaveBtn = styled.button`
  flex: 1; padding: ${theme.spacing.sm}; background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-weight: 600; &:disabled { opacity: 0.55; }
`;
const CancelBtn = styled.button`
  flex: 1; padding: ${theme.spacing.sm}; border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; color: ${theme.colors.textMuted};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const ManageList = styled.div`
  display: flex; flex-direction: column; gap: 4px; max-width: 420px; margin: 0 auto; width: 100%;
`;
const ManageItem = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px ${theme.spacing.md}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt}; font-size: 0.88rem;
  color: ${theme.colors.text};
`;
const DelBtn = styled.button`
  font-size: 0.75rem; color: ${theme.colors.error}; opacity: 0.65; padding: 2px 4px;
  &:hover { opacity: 1; }
`;

const TYPES = [
  { key: 'iluy',     label: HE.DEDICATION_TYPE_ILUY },
  { key: 'refua',    label: HE.DEDICATION_TYPE_REFUA },
  { key: 'hatzlaha', label: HE.DEDICATION_TYPE_HATZLAHA },
];

export default function DedicationsBar() {
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('iluy');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/dedications').then(r => r.json()).then(setDedications as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await fetch('/api/dedications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name: name.trim() }),
    });
    setSaving(false); setName(''); setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(HE.DEDICATION_DELETE_CONFIRM)) return;
    await fetch(`/api/dedications/${id}`, { method: 'DELETE' });
    load();
  };

  const typeLabel = (key: string) => TYPES.find(t => t.key === key)?.label ?? key;

  if (dedications.length === 0 && role !== 'admin') return null;

  /* Exactly 2 copies + translateX(-50%) = one copy's width → perfect seamless loop */
  const repeated = [...dedications, ...dedications];
  const secs = Math.max(dedications.length * 5, 14);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
      {dedications.length > 0 && (
        <Bar>
          <BarTitle>{HE.DEDICATIONS_TITLE}</BarTitle>
          <Track>
            <Tape $secs={secs}>
              {repeated.map((d, i) => (
                <Item key={`${d.id}-${i}`}>
                  <TypeLabel>{typeLabel(d.type)}</TypeLabel>
                  {d.name}
                  <Dot>•</Dot>
                </Item>
              ))}
            </Tape>
          </Track>
        </Bar>
      )}

      {role === 'admin' && (
        <AdminWrap>
          <AdminRow>
            <AddBtn onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕' : '+'} {HE.DEDICATION_ADD_BTN}
            </AddBtn>
          </AdminRow>

          {showForm && (
            <FormCard>
              <FormTitle>{HE.DEDICATION_FORM_TITLE}</FormTitle>
              <Select value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </Select>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
              />
              <BtnRow>
                <SaveBtn onClick={handleAdd} disabled={saving || !name.trim()}>
                  {saving ? HE.LOADING : HE.DEDICATION_FORM_NAME}
                </SaveBtn>
                <CancelBtn onClick={() => setShowForm(false)}>ביטול</CancelBtn>
              </BtnRow>
            </FormCard>
          )}

          {dedications.length > 0 && (
            <ManageList>
              {dedications.map(d => (
                <ManageItem key={d.id}>
                  <span><TypeLabel>{typeLabel(d.type)}</TypeLabel> {d.name}</span>
                  <DelBtn onClick={() => handleDelete(d.id)}>✕ מחק</DelBtn>
                </ManageItem>
              ))}
            </ManageList>
          )}
        </AdminWrap>
      )}
    </div>
  );
}
