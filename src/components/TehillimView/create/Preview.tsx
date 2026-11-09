'use client';

import { HE } from '@/lib/hebrewTexts';
import type { TehillimPurpose } from '@/types/tehillim';
import { headingOf } from '@/lib/tehillim/client';
import { LineIcon } from '@/components/common/LineIcons';
import { Night, Kicker, Dedication, NightText } from '../styles';
import { Field, Label } from './formStyles';

/** What readers will see at the top of the reading, live as the form is filled. */
export default function Preview({ purpose, names, title, note }: { purpose: TehillimPurpose; names: string[]; title: string; note: string }) {
  const heading = headingOf(purpose, names.length ? names : ['…']);
  return (
    <Field>
      <Label as="p">{HE.TH_PREVIEW}</Label>
      <Night aria-live="polite">
        <Kicker><LineIcon name="scroll" size={16} /> {title || `${HE.TH_PAGE_TITLE} · ${HE.TH_PURPOSES[purpose].label}`}</Kicker>
        <Dedication as="p">{heading}</Dedication>
        {note && <NightText>{note}</NightText>}
      </Night>
    </Field>
  );
}
