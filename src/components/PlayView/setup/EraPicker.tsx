'use client';

import { HE } from '@/lib/hebrewTexts';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { Chip, ChipRow } from './Chips';

/** Eras for rabbi questions; nothing selected means every era. */
export default function EraPicker({ value, onChange }: { value: string[]; onChange: (eras: string[]) => void }) {
  const on = new Set(value);
  return (
    <ChipRow role="group" aria-label={HE.PLAY_ERAS_LABEL}>
      <Chip type="button" $on={value.length === 0} aria-pressed={value.length === 0} onClick={() => onChange([])}>
        {HE.PLAY_ERAS_ALL}
      </Chip>
      {CATEGORY_ORDER.map(c => (
        <Chip key={c} type="button" $on={on.has(c)} aria-pressed={on.has(c)}
          onClick={() => onChange(on.has(c) ? value.filter(x => x !== c) : [...value, c])}>
          {CATEGORY_LABELS[c]}
        </Chip>
      ))}
    </ChipRow>
  );
}
