'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TYPE_OPTIONS } from './DedicationsView';

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm}; width: 100%; max-width: 480px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-size: 1.05rem; font-weight: 700; color: ${theme.colors.primary};
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

const Hint = styled.p`
  font-size: 0.82rem; color: ${theme.colors.textMuted}; line-height: 1.6;
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.92rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md}; font-size: 0.95rem; background: ${theme.colors.background};
  color: ${theme.colors.text}; outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const SubmitBtn = styled.button`
  padding: ${theme.spacing.md}; background: ${theme.colors.primary};
  color: white; border-radius: ${theme.radii.md}; font-weight: 700; font-size: 0.95rem;
  transition: opacity 0.15s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.55; }
`;

const ErrorMsg = styled.p`
  font-size: 0.85rem; color: ${theme.colors.error}; text-align: center;
`;

const SuccessCard = styled(Card)`
  align-items: center; text-align: center; gap: ${theme.spacing.sm};
`;

const SuccessTitle = styled.h3`
  font-size: 1.15rem; font-weight: 700; color: ${theme.colors.primary};
`;

const AgainBtn = styled.button`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border: 2px solid ${theme.colors.primary}; color: ${theme.colors.primary};
  border-radius: ${theme.radii.md}; font-weight: 600; font-size: 0.9rem;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.primary}; color: white; }
`;

export default function DedicationRequestForm() {
  const [type, setType] = useState('iluy');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || sending) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/dedications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? HE.DEDICATION_SAVE_ERROR);
      } else {
        setSent(true); setName('');
      }
    } catch {
      setError(HE.DEDICATION_SAVE_ERROR);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <SuccessCard>
        <SuccessTitle>{HE.DEDICATION_REQUEST_SUCCESS_TITLE}</SuccessTitle>
        <Hint>{HE.DEDICATION_REQUEST_SUCCESS_MSG}</Hint>
        <AgainBtn onClick={() => setSent(false)}>{HE.DEDICATION_REQUEST_NEW}</AgainBtn>
      </SuccessCard>
    );
  }

  return (
    <Card>
      <CardTitle>🕯️ {HE.DEDICATION_REQUEST_TITLE}</CardTitle>
      <Hint>{HE.DEDICATION_REQUEST_HINT}</Hint>
      <Select value={type} onChange={e => setType(e.target.value)}>
        {TYPE_OPTIONS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
      </Select>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
        maxLength={100}
        onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <SubmitBtn onClick={handleSubmit} disabled={sending || !name.trim()}>
        {sending ? '...' : HE.DEDICATION_REQUEST_SUBMIT}
      </SubmitBtn>
    </Card>
  );
}
