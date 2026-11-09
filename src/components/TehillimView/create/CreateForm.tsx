'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { TehillimMode, TehillimPurpose } from '@/types/tehillim';
import { GOALS, NAMES_MAX, NAME_MAX, PURPOSES } from '@/lib/tehillim/rules';
import { headingOf, rememberCircle, thFetch } from '@/lib/tehillim/client';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { FRESH_KEY } from '../CircleView';
import { Field, Label, Hint, Form, Honeypot, ErrorLine } from './formStyles';
import NamesField from './NamesField';
import MoreOptions, { type Extras } from './MoreOptions';
import Preview from './Preview';

/**
 * Opening a reading in one screen: purpose, name(s), part size and goal;
 * title / note / end date fold under "more". A live preview shows what
 * readers will see. On success the organizer lands on the reading with the
 * share panel up front.
 */
const Wrap = styled(Form)`gap: ${theme.spacing.lg};`;

interface Props { initialPurpose?: TehillimPurpose; initialName?: string }

export default function CreateForm({ initialPurpose = 'refua', initialName = '' }: Props) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<TehillimPurpose>(initialPurpose);
  const [names, setNames] = useState<string[]>([initialName]);
  const [mode, setMode] = useState<TehillimMode>('chapter');
  const [goal, setGoal] = useState(1);
  const [extras, setExtras] = useState<Extras>({ title: '', note: '', endsAt: '' });
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const filled = names.map(n => n.trim()).filter(Boolean);
  const valid = filled.length > 0 && filled.every(n => n.length >= 2 && n.length <= NAME_MAX);

  const submit = async () => {
    if (!valid || busy) { setError(HE.TH_CREATE_ERRORS.names); return; }
    setBusy(true);
    setError('');
    const r = await thFetch<{ slug: string; manageKey: string }>('/api/tehillim', {
      method: 'POST',
      body: JSON.stringify({ purpose, names: filled, mode, goal, title: extras.title.trim() || undefined, note: extras.note.trim() || undefined, endsAt: extras.endsAt || undefined, website }),
    });
    if (!r.ok) {
      setBusy(false);
      haptics.error();
      setError(r.error === 'rate_limited' ? HE.TH_CREATE_ERRORS.rate_limited : r.status === 400 ? HE.TH_CREATE_ERRORS.names : HE.TH_CREATE_ERRORS.other);
      return;
    }
    haptics.success();
    rememberCircle(r.data.slug, headingOf(purpose, filled), r.data.manageKey);
    try { sessionStorage.setItem(FRESH_KEY, r.data.slug); } catch {}
    router.push(`/tehillim/${r.data.slug}`);
  };

  const p = HE.TH_PURPOSES[purpose];
  return (
    <Wrap onSubmit={e => { e.preventDefault(); void submit(); }} noValidate>
      <Field as="fieldset">
        <Label as="legend">{HE.TH_PURPOSE_LABEL}</Label>
        <ChipRow style={{ flexWrap: 'wrap' }}>
          {PURPOSES.map(k => (
            <Chip key={k} $selected={k === purpose} aria-pressed={k === purpose} onClick={() => setPurpose(k)}>{HE.TH_PURPOSES[k].label}</Chip>
          ))}
        </ChipRow>
      </Field>

      <NamesField label={p.namesLabel} hint={p.namesHint} names={names} max={NAMES_MAX} onChange={n => { setNames(n); setError(''); }} />

      <Field>
        <Label id="th-mode">{HE.TH_MODE_LABEL}</Label>
        <SegmentedControl<TehillimMode> ariaLabel={HE.TH_MODE_LABEL} value={mode} onChange={setMode}
          options={(['chapter', 'day', 'book'] as const).map(m => ({ value: m, label: HE.TH_MODES[m].label }))} />
        <Hint>{HE.TH_MODES[mode].hint}</Hint>
      </Field>

      <Field as="fieldset">
        <Label as="legend">{HE.TH_GOAL_LABEL}</Label>
        <ChipRow style={{ flexWrap: 'wrap' }}>
          {GOALS.map(g => <Chip key={g} $size="sm" $selected={g === goal} aria-pressed={g === goal} onClick={() => setGoal(g)}>{HE.TH_GOAL(g)}</Chip>)}
        </ChipRow>
      </Field>

      <MoreOptions value={extras} onChange={setExtras} />
      <Preview purpose={purpose} names={filled} title={extras.title.trim()} note={extras.note.trim()} />

      <Honeypot tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      {error && <ErrorLine role="alert">{error}</ErrorLine>}
      <Button type="submit" $variant="gold" $size="lg" $block disabled={busy}>{busy ? HE.TH_CREATING : HE.TH_CREATE}</Button>
      <Hint style={{ textAlign: 'center' }}>{HE.TH_PRIVACY_NOTE}</Hint>
    </Wrap>
  );
}
