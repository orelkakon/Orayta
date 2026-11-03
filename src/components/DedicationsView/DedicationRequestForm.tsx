'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TYPE_OPTIONS } from './DedicationsView';
import { Input } from '@/components/MinyanView/minyanStyles';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: 20px; padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm}; width: 100%;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  ${theme.media.sm} { padding: ${theme.spacing.md}; }
`;

const CardTitle = styled.h2`
  font-size: ${theme.fontSizes.xl}; line-height: 1.25; color: ${theme.colors.text};
`;

const Hint = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;
`;

const TypeGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${theme.spacing.sm};
`;

const TypeOption = styled.button<{ $on: boolean }>`
  min-height: 52px; padding: 0 ${theme.spacing.sm};
  display: flex; align-items: center; justify-content: center; text-align: center;
  border-radius: 14px; font-weight: 700; font-size: ${theme.fontSizes.sm}; line-height: 1.3;
  border: 1px solid ${p => (p.$on ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$on ? theme.colors.primary : theme.colors.surface)};
  color: ${p => (p.$on ? theme.colors.onPrimary : theme.colors.text)};
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease, color 0.15s ease;
  &:active { transform: scale(0.97); }
`;

const ErrorMsg = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error}; text-align: center;
`;

const SuccessCard = styled(Card)`
  align-items: center; text-align: center; gap: ${theme.spacing.sm};
`;

const Done = styled.span`
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.success};
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
        <Done aria-hidden="true"><LineIcon name="check" size={28} strokeWidth={2.4} /></Done>
        <CardTitle>{HE.DEDICATION_REQUEST_SUCCESS_TITLE}</CardTitle>
        <Hint>{HE.DEDICATION_REQUEST_SUCCESS_MSG}</Hint>
        <Button $variant="secondary" onClick={() => setSent(false)}>{HE.DEDICATION_REQUEST_NEW}</Button>
      </SuccessCard>
    );
  }

  return (
    <Card>
      <CardTitle>{HE.DEDICATION_REQUEST_TITLE}</CardTitle>
      <Hint>{HE.DEDICATION_REQUEST_HINT}</Hint>
      <TypeGrid role="radiogroup" aria-label={HE.DEDICATION_REQUEST_TITLE}>
        {TYPE_OPTIONS.map(t => (
          <TypeOption key={t.key} type="button" role="radio" aria-checked={type === t.key} $on={type === t.key} onClick={() => setType(t.key)}>
            {t.label}
          </TypeOption>
        ))}
      </TypeGrid>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
        aria-label={HE.DEDICATION_FORM_NAME_PLACEHOLDER}
        maxLength={100}
        onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
      />
      {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
      <Button $variant="gold" $size="lg" $block onClick={handleSubmit} disabled={sending || !name.trim()} aria-busy={sending}>
        <LineIcon name="candle" size={18} strokeWidth={1.9} />{HE.DEDICATION_REQUEST_SUBMIT}
      </Button>
    </Card>
  );
}
