'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Dedication } from '@/types';
import { TYPE_OPTIONS, dedicationTypeLabel } from './DedicationsView';

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm}; width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-size: 1rem; font-weight: 700; color: ${theme.colors.primary};
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

const Badge = styled.span`
  font-size: 0.75rem; font-weight: 700; color: white;
  background: ${theme.colors.error}; border-radius: 999px; padding: 1px 9px;
`;

const List = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: 8px ${theme.spacing.md}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt}; font-size: 0.9rem; color: ${theme.colors.text};
`;

const RowText = styled.span`min-width: 0; overflow-wrap: anywhere;`;

const TypeLabel = styled.span`
  font-size: 0.78rem; color: ${theme.colors.textMuted}; font-weight: 600;
`;

const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0;`;

const ApproveBtn = styled.button`
  width: 30px; height: 30px; border-radius: ${theme.radii.sm};
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.bgSuccess}; color: ${theme.colors.success};
  font-size: 0.9rem; font-weight: 700;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.success}; color: white; }
`;

const DeclineBtn = styled.button`
  width: 30px; height: 30px; border-radius: ${theme.radii.sm};
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.bgError}; color: ${theme.colors.error};
  font-size: 0.9rem; font-weight: 700;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.error}; color: white; }
`;

const DelBtn = styled.button`
  font-size: 0.75rem; color: ${theme.colors.error}; opacity: 0.65; padding: 2px 6px;
  border-radius: ${theme.radii.sm}; flex-shrink: 0;
  &:hover { opacity: 1; background: rgba(155,35,53,0.08); }
`;

const Empty = styled.p`font-size: 0.85rem; color: ${theme.colors.textMuted};`;

const FormRow = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

const Select = styled.select`
  min-width: 148px; padding: ${theme.spacing.sm}; border: 2px solid ${theme.colors.border};
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

export default function DedicationsAdmin() {
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [type, setType] = useState('iluy');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    void fetch('/api/dedications?all=1')
      .then(r => r.json())
      .then((data: unknown) => setDedications(data as Dedication[]))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending  = dedications.filter(d => d.status === 'pending');
  const approved = dedications.filter(d => d.status === 'approved');

  const handleAdd = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await fetch('/api/dedications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name: name.trim() }),
    });
    setSaving(false); setName(''); load();
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/dedications/${id}`, { method: 'PATCH' });
    load();
  };

  const handleDelete = async (id: string, confirmMsg: string) => {
    if (!window.confirm(confirmMsg)) return;
    await fetch(`/api/dedications/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <Card>
        <CardTitle>
          📩 {HE.DEDICATION_PENDING_TITLE}
          {pending.length > 0 && <Badge>{pending.length}</Badge>}
        </CardTitle>
        {pending.length === 0
          ? <Empty>{HE.DEDICATION_PENDING_EMPTY}</Empty>
          : (
            <List>
              {pending.map(d => (
                <Row key={d.id}>
                  <RowText><TypeLabel>{dedicationTypeLabel(d.type)}</TypeLabel> {d.name}</RowText>
                  <Actions>
                    <ApproveBtn title={HE.DEDICATION_APPROVE} onClick={() => void handleApprove(d.id)}>✓</ApproveBtn>
                    <DeclineBtn title={HE.DEDICATION_DECLINE} onClick={() => void handleDelete(d.id, HE.DEDICATION_DECLINE_CONFIRM)}>✕</DeclineBtn>
                  </Actions>
                </Row>
              ))}
            </List>
          )}
      </Card>

      <Card>
        <CardTitle>🕯️ {HE.DEDICATION_MANAGE_TITLE}</CardTitle>
        <FormRow>
          <Select value={type} onChange={e => setType(e.target.value)}>
            {TYPE_OPTIONS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Select>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
            maxLength={100}
            onKeyDown={e => e.key === 'Enter' && void handleAdd()}
          />
          <SaveBtn onClick={handleAdd} disabled={saving || !name.trim()}>
            {saving ? '...' : HE.DEDICATION_ADD_BTN}
          </SaveBtn>
        </FormRow>
        {approved.length > 0 && (
          <List>
            {approved.map(d => (
              <Row key={d.id}>
                <RowText><TypeLabel>{dedicationTypeLabel(d.type)}</TypeLabel> {d.name}</RowText>
                <DelBtn onClick={() => void handleDelete(d.id, HE.DEDICATION_DELETE_CONFIRM)}>✕ {HE.STUDY_DELETE}</DelBtn>
              </Row>
            ))}
          </List>
        )}
      </Card>
    </>
  );
}
