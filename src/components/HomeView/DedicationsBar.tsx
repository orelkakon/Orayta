'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import { Dedication } from '@/types';

const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
`;

/* ── Two-row ticker ── */
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

const RowWrap = styled.div`
  display: flex; align-items: stretch;
`;

const RowLabel = styled.div<{ $iluy?: boolean }>`
  flex-shrink: 0; width: 90px; padding: 8px ${theme.spacing.sm};
  display: flex; align-items: center; justify-content: center; text-align: center;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em;
  background: ${({ $iluy }) => $iluy ? theme.colors.primary + '12' : theme.colors.secondary + '0D'};
  color: ${({ $iluy }) => $iluy ? theme.colors.primary : theme.colors.secondary};
  border-left: 1px solid ${theme.colors.borderLight};
  @media (max-width: 480px) { width: 70px; font-size: 0.6rem; }
`;

const RowTrack = styled.div`overflow: hidden; flex: 1; direction: ltr; padding: 8px 0;`;

const RowDivider = styled.div`height: 1px; background: ${theme.colors.borderLight};`;

const Tape = styled.div<{ $secs: number }>`
  display: inline-flex; white-space: nowrap; will-change: transform;
  animation: ${scrollRight} ${p => p.$secs}s linear infinite;
`;

const Item = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 24px;
  font-family: ${theme.fonts.body}; font-size: 0.9rem;
  color: ${theme.colors.primary}; white-space: nowrap; direction: rtl;
`;

const TypeLabel = styled.span`
  font-size: 0.8rem; color: ${theme.colors.textMuted}; font-weight: 600;
`;

const Dot = styled.span`
  color: ${theme.colors.secondary}; font-size: 0.8rem; user-select: none;
`;

const BarSkeleton = styled.div`
  width: 100%; height: 88px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.md};
  box-shadow: ${theme.shadows.sm};
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
  { key: 'zivug',    label: HE.DEDICATION_TYPE_ZIVUG },
];

interface Props { part?: 'ticker' | 'admin'; }

export default function DedicationsBar({ part = 'ticker' }: Props) {
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);
  const [type, setType] = useState('iluy');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/dedications')
      .then(r => r.json())
      .then((data: unknown) => {
        setDedications(data as Dedication[]);
        setTickerLoading(false);
      })
      .catch(() => setTickerLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const iluyItems = useMemo(() => {
    const arr = [...dedications.filter(d => d.type === 'iluy')].sort(() => Math.random() - 0.5);
    return [...arr, ...arr];
  }, [dedications]);

  const otherItems = useMemo(() => {
    const arr = [...dedications.filter(d => d.type !== 'iluy')].sort(() => Math.random() - 0.5);
    return [...arr, ...arr];
  }, [dedications]);

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
    if (tickerLoading) return <BarSkeleton />;
    if (dedications.length === 0) return null;

    const iluyCount = iluyItems.length / 2;
    const otherCount = otherItems.length / 2;
    const iluySeconds = Math.max(iluyCount * 2.5, 10);
    const otherSeconds = Math.max(otherCount * 2.5, 10);

    return (
      <Bar>
        <BarTitle>{HE.DEDICATIONS_TITLE}</BarTitle>

        {iluyCount > 0 && (
          <RowWrap>
            <RowLabel $iluy>🕯️ {HE.DEDICATION_TYPE_ILUY}</RowLabel>
            <RowTrack>
              <Tape $secs={iluySeconds}>
                {iluyItems.map((d, i) => (
                  <Item key={`${d.id}-${i}`}>
                    {d.name}
                    <Dot>·</Dot>
                  </Item>
                ))}
              </Tape>
            </RowTrack>
          </RowWrap>
        )}

        {iluyCount > 0 && otherCount > 0 && <RowDivider />}

        {otherCount > 0 && (
          <RowWrap>
            <RowLabel>🙏 ברכות</RowLabel>
            <RowTrack>
              <Tape $secs={otherSeconds}>
                {otherItems.map((d, i) => (
                  <Item key={`${d.id}-${i}`}>
                    <TypeLabel>{typeLabel(d.type)}</TypeLabel>
                    {d.name}
                    <Dot>·</Dot>
                  </Item>
                ))}
              </Tape>
            </RowTrack>
          </RowWrap>
        )}
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
