'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Interest, savePrefs } from '@/lib/interests';
import Sheet from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import InterestPicker from './InterestPicker';

/** Edits this device's interests (opened from "עוד" or the quick-access "התאמה"). */
const Sub = styled.p`
  margin-bottom: ${theme.spacing.md}; font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.textMuted};
`;
const Actions = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; margin-top: ${theme.spacing.lg};`;

interface Props { open: boolean; picked: Interest[]; onClose: () => void }

export default function InterestsSheet({ open, picked, onClose }: Props) {
  const [draft, setDraft] = useState<Interest[]>(picked);
  useEffect(() => { if (open) setDraft(picked); }, [open, picked]);

  const save = (next: Interest[]) => { savePrefs({ picked: next, asked: true }); onClose(); };

  return (
    <Sheet open={open} onClose={onClose} title={HE.INTERESTS_SHEET_TITLE}>
      <Sub>{HE.INTERESTS_SHEET_SUB}</Sub>
      <InterestPicker value={draft} onChange={setDraft} />
      <Actions>
        <Button $variant="primary" $size="lg" onClick={() => save(draft)}>{HE.INTERESTS_SAVE}</Button>
        {picked.length > 0 && <Button $variant="ghost" onClick={() => save([])}>{HE.INTERESTS_CLEAR}</Button>}
      </Actions>
    </Sheet>
  );
}
