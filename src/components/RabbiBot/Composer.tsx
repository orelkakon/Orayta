'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { QUESTION_MAX, validateQuestion } from '@/lib/rabbiBot/rules';
import { Disclaimer } from './styles';

const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const Box = styled.div`
  display: flex; align-items: flex-end; gap: ${theme.spacing.sm};
  background: ${theme.colors.surface}; border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.sm};
  transition: border-color ${theme.motion.fast};
  &:focus-within { border-color: ${theme.colors.secondary}; }
`;

/* 16px font: anything smaller makes iOS zoom the page on focus. */
const Input = styled.textarea`
  flex: 1; min-width: 0; resize: none; border: none; outline: none; background: transparent;
  font-family: ${theme.fonts.ui}; font-size: 16px; line-height: 1.5; color: ${theme.colors.text};
  min-height: 48px; max-height: 140px; padding: 4px;
  &::placeholder { color: ${theme.colors.textLight}; }
`;

const Send = styled.button`
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  transition: transform ${theme.motion.fast} ${theme.motion.out}, opacity ${theme.motion.fast};
  &:active { transform: scale(0.92); }
  &:disabled { opacity: 0.4; }
  & > svg { transform: scaleX(-1); }
`;

const Meta = styled.div`display: flex; justify-content: space-between; align-items: center; gap: ${theme.spacing.sm};`;
const Counter = styled.span<{ $over: boolean }>`
  font-size: ${theme.fontSizes.xs}; font-variant-numeric: tabular-nums; direction: ltr;
  color: ${p => (p.$over ? theme.colors.error : theme.colors.textLight)};
`;

/* Bots fill every field; people never see this one. */
const Honeypot = styled.input`position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;`;

interface Props {
  disabled: boolean;
  initial?: string;
  onAsk: (question: string, website: string) => void;
}

export default function Composer({ disabled, initial = '', onAsk }: Props) {
  const [text, setText] = useState(initial);
  const [website, setWebsite] = useState('');
  const valid = validateQuestion(text).ok;

  const submit = () => {
    const v = validateQuestion(text);
    if (v.ok && !disabled) onAsk(v.text, website);
  };

  return (
    <Form onSubmit={e => { e.preventDefault(); submit(); }}>
      <Box>
        <Input
          value={text}
          maxLength={QUESTION_MAX + 20}
          rows={2}
          placeholder={HE.RB_PLACEHOLDER}
          aria-label={HE.RB_INPUT_LABEL}
          enterKeyHint="send"
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <Send type="submit" disabled={disabled || !valid} aria-label={HE.RB_SEND}>
          <LineIcon name="send" size={19} strokeWidth={2} />
        </Send>
      </Box>
      <Honeypot tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      <Meta>
        <Disclaimer>{HE.RB_DISCLAIMER}</Disclaimer>
        <Counter $over={text.length > QUESTION_MAX}>{HE.RB_COUNTER(text.length, QUESTION_MAX)}</Counter>
      </Meta>
    </Form>
  );
}
