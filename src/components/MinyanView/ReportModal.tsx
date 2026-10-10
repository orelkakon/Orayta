'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { isPlausibleTime, SERVICE_ORDER } from '@/lib/minyan/confidence';
import { dayTypeFor } from '@/lib/minyan/geo';
import { haptics } from '@/lib/haptics';
import type { DayType, MinyanReportInput, MinyanTime, PrayerService, ReportKind } from '@/types/minyan';
import { LevelBadge, evidenceText } from './ConfidenceBadge';
import { Chip, Field, Input, PrimaryBtn, GhostBtn, Muted, ErrorText } from './minyanStyles';

const Body = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Chips = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const Buttons = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap; > * { flex: 1; }`;
const Intro = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;`;
const Thanks = styled.p`font-weight: 700; color: ${theme.colors.success}; text-align: center;`;
const TimeInput = styled(Input)`direction: ltr; text-align: center; font-weight: 700; max-width: 160px;`;

const DAYS: DayType[] = ['weekday', 'shabbat'];

interface Props {
  placeId: string;
  placeName: string;
  /** Existing time → confirm/dispute; absent → report a new time. */
  existing: MinyanTime | null;
  isAdmin: boolean;
  onClose: () => void;
  onDone: (times: MinyanTime[]) => void;
}

export default function ReportModal({ placeId, placeName, existing, isAdmin, onClose, onDone }: Props) {
  const now = new Date();
  const [service, setService] = useState<PrayerService>(existing?.service ?? 'mincha');
  const [dayType, setDayType] = useState<DayType>(existing?.dayType ?? dayTypeFor(now));
  const [time, setTime] = useState(existing?.time ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = async (kind: ReportKind) => {
    if (busy) return;
    if (!isPlausibleTime(service, time)) { setError(HE.MN_REPORT_INVALID); return; }
    setBusy(true); setError(null);
    const body: MinyanReportInput = { placeId, service, dayType, time, kind };
    try {
      const res = await fetch('/api/minyan/reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.status === 429) { setError(HE.MN_REPORT_RATE); return; }
      if (!res.ok) { setError(res.status === 400 ? HE.MN_REPORT_INVALID : HE.MN_REPORT_ERROR); return; }
      const { times } = await res.json() as { times: MinyanTime[] };
      haptics.success();
      setSent(true);
      onDone(times);
      setTimeout(onClose, 900);
    } catch {
      setError(HE.MN_REPORT_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const title = existing
    ? `${HE.MN_SERVICES[existing.service]} ${existing.time} · ${HE.MN_DAYTYPES[existing.dayType]}`
    : HE.MN_REPORT_TITLE;

  return (
    <Modal title={title} onClose={onClose}>
      <Body>
        <Muted>{placeName}</Muted>
        {sent ? <Thanks role="status">{HE.MN_REPORT_THANKS}</Thanks> : existing ? (
          <>
            <div><LevelBadge level={existing.level} /></div>
            <Muted>{evidenceText(existing, now)}</Muted>
            <Intro>{HE.MN_TIME_INTRO}</Intro>
            <Buttons>
              <PrimaryBtn onClick={() => void send('confirm')} disabled={busy}>
                {isAdmin ? HE.MN_ADMIN_VERIFY : HE.MN_CONFIRM_BTN}
              </PrimaryBtn>
              <GhostBtn onClick={() => void send('dispute')} disabled={busy}>
                {isAdmin ? HE.MN_ADMIN_REMOVE : HE.MN_DISPUTE_BTN}
              </GhostBtn>
            </Buttons>
          </>
        ) : (
          <>
            <Intro>{HE.MN_REPORT_INTRO}</Intro>
            <Field as="div">
              {HE.MN_REPORT_SERVICE}
              <Chips role="group" aria-label={HE.MN_REPORT_SERVICE}>
                {SERVICE_ORDER.map(s => (
                  <Chip key={s} type="button" $active={s === service} aria-pressed={s === service} onClick={() => setService(s)}>
                    {HE.MN_SERVICES[s]}
                  </Chip>
                ))}
              </Chips>
            </Field>
            <Field as="div">
              {HE.MN_REPORT_DAY}
              <Chips role="group" aria-label={HE.MN_REPORT_DAY}>
                {DAYS.map(d => (
                  <Chip key={d} type="button" $active={d === dayType} aria-pressed={d === dayType} onClick={() => setDayType(d)}>
                    {HE.MN_DAYTYPES[d]}
                  </Chip>
                ))}
              </Chips>
            </Field>
            <Field>
              {HE.MN_REPORT_TIME}
              <TimeInput type="time" value={time} onChange={e => { setTime(e.target.value); setError(null); }} required />
            </Field>
            <PrimaryBtn onClick={() => void send('confirm')} disabled={busy || !time}>
              {isAdmin ? HE.MN_REPORT_SUBMIT_ADMIN : HE.MN_REPORT_SUBMIT}
            </PrimaryBtn>
          </>
        )}
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </Body>
    </Modal>
  );
}
