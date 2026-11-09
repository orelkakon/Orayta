'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { TehillimState } from '@/types/tehillim';
import { unitAt, unitRange, unitTitle } from '@/lib/tehillim/units';
import { headingOf, savedName } from '@/lib/tehillim/client';
import Sheet from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useReaderPrefs } from '@/components/Reader/useReaderPrefs';
import { useWakeLock } from '@/components/Reader/useWakeLock';
import type { CircleApi } from '../useCircle';
import { useUnitText } from './useUnitText';
import UnitText from './UnitText';
import ReadingTop from './ReadingTop';
import DoneView, { type Finished } from './DoneView';

/**
 * Reading one unit, full screen: who it is for, the hold time left, the
 * verses, and "done" / "another" / "not now". Closing keeps the unit held
 * (the page offers to continue). After "done" the same sheet thanks the
 * reader and offers the next unit in one tap.
 */
const Foot = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Pair = styled.div`display: flex; gap: ${theme.spacing.sm}; & > * { flex: 1; }`;
const Note = styled.p`margin: 0; text-align: center; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error};`;

interface Props { open: boolean; onClose: () => void; state: TehillimState; api: CircleApi }

export default function ReadingSheet({ open, onClose, state, api }: Props) {
  const claim = state.me?.claim ?? null;
  const [finished, setFinished] = useState<Finished | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const prefs = useReaderPrefs();
  const unit = claim ? unitAt(state.mode, claim.unit) : null;
  const text = useUnitText(open && !finished && unit ? unit.segments : null);
  const scroller = useRef<HTMLDivElement>(null);
  useWakeLock(open && prefs.awake);

  useEffect(() => { if (open) { setFinished(null); setNote(''); } }, [open]);
  // A new unit (or the thanks after one) starts at the top.
  useEffect(() => { scroller.current?.scrollIntoView({ block: 'start' }); }, [claim?.id, finished]);

  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setNote(''); try { await fn(); } finally { setBusy(false); } };

  const done = () => run(async () => {
    if (!claim) return;
    const before = state.books;
    const r = await api.finish(claim.id, savedName());
    if (r.ok) {
      haptics.success();
      setFinished({ title: unitTitle(state.mode, claim.unit), bookDone: r.data.books > before, read: r.data.me?.read ?? 0 });
    } else {
      haptics.error();
      setNote(r.error === 'too_soon' ? HE.TH_TOO_SOON : HE.TH_ERROR);
    }
  });
  const another = () => run(async () => {
    if (claim) await api.release(claim.id);
    const r = await api.take(null);
    if (!r.ok) setNote(r.error === 'taken' ? HE.TH_TAKEN : HE.TH_ERROR);
  });
  const later = () => run(async () => { if (claim) await api.release(claim.id); onClose(); });
  const next = () => run(async () => {
    const r = await api.take(null);
    if (r.ok) setFinished(null); else setNote(r.error === 'taken' ? HE.TH_TAKEN : HE.TH_ERROR);
  });

  const title = finished ? HE.TH_THANKS : claim ? unitTitle(state.mode, claim.unit) : '';
  const footer = finished ? null : claim && (
    <Foot>
      {note && <Note role="alert">{note}</Note>}
      <Button $variant="gold" $size="lg" $block disabled={busy || !text.chapters} onClick={() => void done()}>
        {busy ? HE.TH_DONE_SENDING : `✓ ${HE.TH_DONE}`}
      </Button>
      <Pair>
        <Button $variant="tonal" $size="md" disabled={busy} onClick={() => void another()}>{HE.TH_OTHER}</Button>
        <Button $variant="ghost" $size="md" disabled={busy} onClick={() => void later()}>{HE.TH_LATER}</Button>
      </Pair>
    </Foot>
  );

  return (
    <Sheet open={open && (!!claim || !!finished)} onClose={onClose} title={title} full guarded footer={footer} maxWidth={720}>
      <div ref={scroller} style={{ ['--siddur-scale' as string]: prefs.scale }}>
        {finished ? (
          <DoneView finished={finished} heading={headingOf(state.purpose, state.names)} busy={busy} note={note}
            onNext={() => void next()} onClose={onClose} closed={state.closed} />
        ) : claim && (
          <>
            <ReadingTop heading={headingOf(state.purpose, state.names)} range={unitRange(state.mode, claim.unit)}
              heldUntil={claim.heldUntil} step={prefs.step} onStep={prefs.setStep} />
            <UnitText chapters={text.chapters} failed={text.failed} onRetry={text.retry} showHeadings={(unit?.segments.length ?? 0) > 1} />
          </>
        )}
      </div>
    </Sheet>
  );
}
