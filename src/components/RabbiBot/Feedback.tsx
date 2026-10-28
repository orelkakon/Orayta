'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { QuietBtn } from '@/components/Notifications/sheetStyles';
import { Card, LinkBtn, Muted } from './styles';

const Stars = styled.div`display: flex; gap: 4px; direction: ltr; justify-content: flex-end;`;
const Star = styled.button<{ $on: boolean }>`
  font-size: 28px; line-height: 1; padding: 2px;
  color: ${p => (p.$on ? theme.colors.secondary : theme.colors.border)};
  transition: transform ${theme.motion.fast} ${theme.motion.spring}, color ${theme.motion.fast};
  &:active { transform: scale(0.85); }
  &:disabled { cursor: default; }
`;
const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;
const Label = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700;`;
const Note = styled.textarea`
  width: 100%; resize: vertical; min-height: 64px; padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surface}; color: ${theme.colors.text}; font-family: ${theme.fonts.ui}; font-size: 16px;
`;

interface Props {
  rating: number | null;
  reported: boolean;
  onFeedback: (d: { rating?: number; report?: boolean; note?: string }) => Promise<boolean>;
}

/** 1–5 stars (shown in the admin stats) and an error report. */
export default function Feedback({ rating, reported, onFeedback }: Props) {
  const [hover, setHover] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const shown = hover || rating || 0;

  const report = async () => {
    setSending(true);
    if (await onFeedback({ report: true, note })) setReporting(false);
    setSending(false);
  };

  return (
    <Card>
      <Row>
        <Label>{rating ? HE.RB_RATED : HE.RB_RATE_TITLE}</Label>
        <Stars onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <Star
              key={n} type="button" $on={n <= shown} aria-label={HE.RB_RATE_STAR(n)} aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)} onClick={() => void onFeedback({ rating: n })}
            >★</Star>
          ))}
        </Stars>
      </Row>
      {reported && <Muted>{HE.RB_REPORTED}</Muted>}
      {!reported && !reporting && <LinkBtn type="button" onClick={() => setReporting(true)}>{HE.RB_REPORT}</LinkBtn>}
      {!reported && reporting && (
        <>
          <Note value={note} maxLength={500} placeholder={HE.RB_REPORT_PLACEHOLDER} onChange={e => setNote(e.target.value)} />
          <QuietBtn type="button" $danger disabled={sending} onClick={() => void report()}>{HE.RB_REPORT_SEND}</QuietBtn>
        </>
      )}
    </Card>
  );
}
