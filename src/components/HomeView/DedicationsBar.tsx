'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import { Dedication } from '@/types';

const scrollLeft = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

/* ── Ticker ── */
const Bar = styled.div`
  width: 100%; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.md}; overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const BarTitle = styled.div`
  padding: 5px ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.07em; text-align: center;
`;

const Track = styled.div`overflow: hidden; padding: 10px 0; direction: ltr;`;

const Tape = styled.div<{ $secs: number }>`
  display: inline-flex; white-space: nowrap; will-change: transform;
  animation: ${scrollLeft} ${p => p.$secs}s linear infinite;
`;

const Item = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 28px;
  font-family: ${theme.fonts.body}; font-size: 0.92rem;
  color: ${theme.colors.primary}; white-space: nowrap; direction: rtl;
`;

const TypeLabel = styled.span`
  font-size: 0.75rem; color: ${theme.colors.textMuted}; font-weight: 600;
`;

const Dot = styled.span`
  color: ${theme.colors.secondary}; font-size: 1rem; user-select: none;
`;

/* ── Admin section ── */
const AdminWrap = styled.div`
  width: 100%; display: flex; flex-direction: column;
  gap: ${theme.spacing.md}; align-items: center;
`;

const AdminCard = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm}; width: 100%; max-width: 480px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const AdminTitle = styled.h3`
  font-size: 0.95rem; font-weight: 700; color: ${theme.colors.primary};
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

const FormRow = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Select = styled.select`
  min-width: 148px; width: 148px;
  padding: ${theme.spacing.sm} ${theme.spacing.sm}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.88rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none; flex-shrink: 0;
`;
const Input = styled.input`
  flex: 2; min-width: 140px;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.9rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;
const SaveBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; background: ${theme.colors.primary};
  color: white; border-radius: ${theme.radii.md}; font-weight: 600; font-size: 0.88rem;
  white-space: nowrap; flex-shrink: 0;
  &:disabled { opacity: 0.55; }
`;

const ManageList = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const ManageItem = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px ${theme.spacing.md}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt}; font-size: 0.88rem; color: ${theme.colors.text};
`;
const DelBtn = styled.button`
  font-size: 0.75rem; color: ${theme.colors.error}; opacity: 0.65; padding: 2px 6px;
  border-radius: ${theme.radii.sm};
  &:hover { opacity: 1; background: rgba(155,35,53,0.08); }
`;

const TYPES = [
  { key: 'iluy',     label: HE.DEDICATION_TYPE_ILUY },
  { key: 'refua',    label: HE.DEDICATION_TYPE_REFUA },
  { key: 'hatzlaha', label: HE.DEDICATION_TYPE_HATZLAHA },
];

interface Props { part?: 'ticker' | 'admin'; }

export default function DedicationsBar({ part = 'ticker' }: Props) {
  const [dedications, setDedications] = useState<Dedication[]>([]);
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
    setSaving(false); setName(''); load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(HE.DEDICATION_DELETE_CONFIRM)) return;
    await fetch(`/api/dedications/${id}`, { method: 'DELETE' });
    load();
  };

  const typeLabel = (key: string) => TYPES.find(t => t.key === key)?.label ?? key;

  /* ── Ticker part ── */
  if (part === 'ticker') {
    if (dedications.length === 0) return null;
    const doubled = [...dedications, ...dedications];
    const secs = Math.max(dedications.length * 5, 14);
    return (
      <Bar>
        <BarTitle>{HE.DEDICATIONS_TITLE}</BarTitle>
        <Track>
          <Tape $secs={secs}>
            {doubled.map((d, i) => (
              <Item key={`${d.id}-${i}`}>
                <TypeLabel>{typeLabel(d.type)}</TypeLabel>
                {d.name}
                <Dot>•</Dot>
              </Item>
            ))}
          </Tape>
        </Track>
      </Bar>
    );
  }

  /* ── Admin part ── */
  if (role !== 'admin') return null;
  return (
    <AdminWrap>
      <AdminCard>
        <AdminTitle>🕯️ {HE.DEDICATION_FORM_TITLE}</AdminTitle>
        <FormRow>
          <Select value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Select>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
            onKeyDown={e => e.key === 'Enter' && void handleAdd()}
          />
          <SaveBtn onClick={handleAdd} disabled={saving || !name.trim()}>
            {saving ? '...' : '+ הוסף'}
          </SaveBtn>
        </FormRow>
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
      </AdminCard>
    </AdminWrap>
  );
}
