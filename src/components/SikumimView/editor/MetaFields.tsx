'use client';

import { RefObject, useId, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { Chip } from '@/components/ui/Chip';
import { LineIcon } from '@/components/common/LineIcons';
import type { DraftFields } from '../sikumDraft';
import type { NextSuggestions } from '@/lib/sikum/suggest';
import { todayStr, yesterdayStr } from './useEntryForm';
import { Label, Input, Chips, ChipsLabel } from '../SikumEntryForm.styles';
import { Summary, SumPart, SumSep, SumChevron, Panel, Field, FieldHead, DateInput, RangeToggle } from './MetaFields.styles';

/**
 * Title, then date + location folded into one row ("היום · עמ׳ כח") that
 * opens into stacked full-width fields — nothing shares a line on a phone, so
 * nothing overlaps, and the text starts high on the screen. The next
 * summary's title / location are one tap away; Enter in a field moves on to
 * the text.
 */
interface Props {
  fields: DraftFields;
  set: <K extends keyof DraftFields>(k: K, v: DraftFields[K]) => void;
  suggestions: NextSuggestions;
  titleRef: RefObject<HTMLInputElement>;
  textRef: RefObject<HTMLTextAreaElement>;
}

const shortDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return y ? `${day}.${m}${y === new Date().getFullYear() ? '' : `.${String(y).slice(2)}`}` : '';
};
const dayLabel = (d: string) => (d === todayStr() ? HE.SE_TODAY : d === yesterdayStr() ? HE.SE_YESTERDAY : shortDate(d));

/** Focuses inside the tap (so iOS opens the keyboard) with the caret at the end. */
function focusEnd(el: HTMLInputElement | null) {
  if (!el) return;
  el.focus();
  requestAnimationFrame(() => { const n = el.value.length; try { el.setSelectionRange(n, n); } catch {} });
}

export default function MetaFields({ fields, set, suggestions, titleRef, textRef }: Props) {
  const { title, date, dateEnd, isRange, location } = fields;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toText = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); textRef.current?.focus(); } };
  const titleChips = !title.trim() ? suggestions.titles : [];
  const when = isRange && dateEnd ? `${shortDate(date)}–${shortDate(dateEnd)}` : dayLabel(date);

  return (
    <>
      <Label>
        {HE.SIKUMIM_ENTRY_FORM_TITLE}
        <Input
          ref={titleRef} value={title} onChange={e => set('title', e.target.value)}
          placeholder={HE.SIKUMIM_ENTRY_FORM_TITLE_PLACEHOLDER} enterKeyHint="next" onKeyDown={toText}
        />
      </Label>
      {titleChips.length > 0 && (
        <Chips>
          <ChipsLabel>{HE.SE_SUGGEST}</ChipsLabel>
          {titleChips.map(t => (
            <Chip key={t} $size="sm" onClick={() => { set('title', t); focusEnd(titleRef.current); }}>{t.trim()}…</Chip>
          ))}
        </Chips>
      )}

      <Summary type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(o => !o)}>
        <SumPart><LineIcon name="calendar" size={18} strokeWidth={1.8} />{when}</SumPart>
        <SumSep aria-hidden="true" />
        <SumPart $muted={!location.trim()}>
          <LineIcon name="pin" size={18} strokeWidth={1.8} />
          <span>{location.trim() || HE.SE_ADD_LOCATION}</span>
        </SumPart>
        <SumChevron $open={open}><LineIcon name="chevronDown" size={18} strokeWidth={2} /></SumChevron>
      </Summary>

      {open && (
        <Panel id={panelId}>
          <Field>
            <FieldHead>
              <label htmlFor={`${panelId}-d`}>{isRange ? HE.SIKUMIM_ENTRY_FORM_DATE : HE.SE_DATE}</label>
              <Chips>
                <Chip $size="sm" $selected={date === todayStr()} onClick={() => set('date', todayStr())}>{HE.SE_TODAY}</Chip>
                <Chip $size="sm" $selected={date === yesterdayStr()} onClick={() => set('date', yesterdayStr())}>{HE.SE_YESTERDAY}</Chip>
              </Chips>
            </FieldHead>
            <DateInput id={`${panelId}-d`} type="date" value={date} onChange={e => set('date', e.target.value)} />
          </Field>
          <RangeToggle>
            <input type="checkbox" checked={isRange} onChange={e => set('isRange', e.target.checked)} />
            {HE.SIKUMIM_ENTRY_FORM_RANGE_TOGGLE}
          </RangeToggle>
          {isRange && (
            <Field>
              <FieldHead><label htmlFor={`${panelId}-e`}>{HE.SIKUMIM_ENTRY_FORM_DATE_END}</label></FieldHead>
              <DateInput id={`${panelId}-e`} type="date" value={dateEnd} min={date} onChange={e => set('dateEnd', e.target.value)} />
            </Field>
          )}
          <Field>
            <FieldHead>
              <label htmlFor={`${panelId}-l`}>{HE.SIKUMIM_ENTRY_FORM_LOCATION}</label>
              {!location.trim() && suggestions.location && (
                <Chip $size="sm" onClick={() => set('location', suggestions.location ?? '')}>{HE.SE_SUGGEST} {suggestions.location}</Chip>
              )}
            </FieldHead>
            <Input
              id={`${panelId}-l`} value={location} onChange={e => set('location', e.target.value)}
              placeholder={HE.SE_LOCATION_PH} enterKeyHint="next" onKeyDown={toText}
            />
          </Field>
        </Panel>
      )}
    </>
  );
}
