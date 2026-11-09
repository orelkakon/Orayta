'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { NAME_MAX } from '@/lib/tehillim/rules';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Field, Label, Hint, Input } from './formStyles';

/** One to five names; the label and the example follow the purpose (mother's name for refua, father's for a neshama). */
const Row = styled.div`display: flex; align-items: center; gap: ${theme.spacing.xs}; & > input { flex: 1; width: auto; }`;

interface Props { label: string; hint: string; names: string[]; max: number; onChange: (names: string[]) => void }

export default function NamesField({ label, hint, names, max, onChange }: Props) {
  const set = (i: number, v: string) => onChange(names.map((n, j) => (j === i ? v : n)));
  return (
    <Field>
      <Label htmlFor="th-name-0">{label}</Label>
      {names.map((n, i) => (
        <Row key={i}>
          <Input id={`th-name-${i}`} value={n} maxLength={NAME_MAX} autoComplete="off" enterKeyHint="next"
            placeholder={hint.split('—')[1]?.replace('למשל:', '').trim() || ''} onChange={e => set(i, e.target.value)} />
          {names.length > 1 && (
            <IconButton $size="sm" onClick={() => onChange(names.filter((_, j) => j !== i))} aria-label={HE.TH_NAME_REMOVE(i + 1)}>
              <LineIcon name="close" size={16} />
            </IconButton>
          )}
        </Row>
      ))}
      <Hint>{hint}</Hint>
      {names.length < max && (
        <div><Button $variant="ghost" $size="sm" onClick={() => onChange([...names, ''])}><LineIcon name="plus" size={16} /> {HE.TH_NAME_ADD}</Button></div>
      )}
    </Field>
  );
}
