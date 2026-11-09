'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { NOTE_MAX, TITLE_MAX } from '@/lib/tehillim/rules';
import { LineIcon } from '@/components/common/LineIcons';
import { Field, Label, Input, Area } from './formStyles';

/** The optional fields, folded: a title, a note to readers, an end date (up to 120 days ahead). */
export interface Extras { title: string; note: string; endsAt: string }

const Toggle = styled.button<{ $open: boolean }>`
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; min-height: 44px;
  font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.primary};
  & > svg { transition: transform ${theme.motion.base}; transform: rotate(${p => (p.$open ? '-90deg' : '0')}); }
`;
const Box = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const isoDay = (offsetDays: number) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date(Date.now() + offsetDays * 86_400_000));

export default function MoreOptions({ value, onChange }: { value: Extras; onChange: (v: Extras) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Toggle type="button" $open={open} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <LineIcon name="chevron" size={18} /> {HE.TH_MORE_OPTIONS}
      </Toggle>
      {open && (
        <>
          <Field>
            <Label htmlFor="th-title">{HE.TH_TITLE_LABEL}</Label>
            <Input id="th-title" value={value.title} maxLength={TITLE_MAX} placeholder={HE.TH_TITLE_PH} onChange={e => onChange({ ...value, title: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor="th-note-new">{HE.TH_NOTE_LABEL}</Label>
            <Area id="th-note-new" value={value.note} maxLength={NOTE_MAX} placeholder={HE.TH_NOTE_PH} onChange={e => onChange({ ...value, note: e.target.value })} />
          </Field>
          <Field>
            <Label htmlFor="th-ends">{HE.TH_ENDS_LABEL}</Label>
            <Input id="th-ends" type="date" value={value.endsAt} min={isoDay(0)} max={isoDay(119)} onChange={e => onChange({ ...value, endsAt: e.target.value })} />
          </Field>
        </>
      )}
    </Box>
  );
}
