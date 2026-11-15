'use client';

import { RefObject } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { Chip } from '@/components/ui/Chip';
import type { DraftFields } from '../sikumDraft';
import type { NextSuggestions } from '@/lib/sikum/suggest';
import { todayStr, yesterdayStr } from './useEntryForm';
import { Label, LabelRow, Input, MetaRow, RangeToggle, Chips, ChipsLabel } from '../SikumEntryForm.styles';

/**
 * Title, date and location — compact for a phone: date and location share a
 * row, "היום / אתמול" save the native date wheel, and the next summary's title
 * and location (from the last one in the book) are one tap away. Enter in the
 * title jumps to the text.
 */
interface Props {
  fields: DraftFields;
  set: <K extends keyof DraftFields>(k: K, v: DraftFields[K]) => void;
  suggestions: NextSuggestions;
  titleRef: RefObject<HTMLInputElement>;
  textRef: RefObject<HTMLTextAreaElement>;
}

/** Focuses inside the tap (so iOS opens the keyboard) with the caret at the end. */
function focusEnd(el: HTMLInputElement | null) {
  if (!el) return;
  el.focus();
  requestAnimationFrame(() => { const n = el.value.length; try { el.setSelectionRange(n, n); } catch {} });
}

export default function MetaFields({ fields, set, suggestions, titleRef, textRef }: Props) {
  const { title, date, dateEnd, isRange, location } = fields;
  const titleChips = !title.trim() ? suggestions.titles : [];
  return (
    <>
      <Label>
        {HE.SIKUMIM_ENTRY_FORM_TITLE}
        <Input
          ref={titleRef} value={title} onChange={e => set('title', e.target.value)}
          placeholder={HE.SIKUMIM_ENTRY_FORM_TITLE_PLACEHOLDER} enterKeyHint="next"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); textRef.current?.focus(); } }}
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
      <MetaRow>
        <Label as="div">
          <LabelRow>
            <label htmlFor="sikum-date">{HE.SIKUMIM_ENTRY_FORM_DATE}</label>
            <Chips>
              <Chip $size="sm" $selected={date === todayStr()} onClick={() => set('date', todayStr())}>{HE.SE_TODAY}</Chip>
              <Chip $size="sm" $selected={date === yesterdayStr()} onClick={() => set('date', yesterdayStr())}>{HE.SE_YESTERDAY}</Chip>
            </Chips>
          </LabelRow>
          <Input id="sikum-date" type="date" value={date} onChange={e => set('date', e.target.value)} />
        </Label>
        <Label as="div">
          <LabelRow>
            <label htmlFor="sikum-loc">{HE.SIKUMIM_ENTRY_FORM_LOCATION}</label>
            {!location.trim() && suggestions.location && (
              <Chip $size="sm" onClick={() => set('location', suggestions.location ?? '')}>{suggestions.location}</Chip>
            )}
          </LabelRow>
          <Input
            id="sikum-loc" value={location} onChange={e => set('location', e.target.value)}
            placeholder={HE.SE_LOCATION_PH} enterKeyHint="next"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); textRef.current?.focus(); } }}
          />
        </Label>
      </MetaRow>
      <MetaRow>
        <RangeToggle>
          <input type="checkbox" checked={isRange} onChange={e => set('isRange', e.target.checked)} />
          {HE.SIKUMIM_ENTRY_FORM_RANGE_TOGGLE}
        </RangeToggle>
        {isRange && (
          <Label>
            {HE.SIKUMIM_ENTRY_FORM_DATE_END}
            <Input type="date" value={dateEnd} min={date} onChange={e => set('dateEnd', e.target.value)} />
          </Label>
        )}
      </MetaRow>
    </>
  );
}
