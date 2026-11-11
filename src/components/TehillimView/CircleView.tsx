'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import { unitTitle } from '@/lib/tehillim/units';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Sheet from '@/components/ui/Sheet';
import { useCircle } from './useCircle';
import CircleHero from './circle/CircleHero';
import UnitMap from './circle/UnitMap';
import Activity from './circle/Activity';
import SharePanel from './circle/SharePanel';
import ManagePanel from './circle/ManagePanel';
import ReadingSheet from './reading/ReadingSheet';
import BookMoment from './moment/BookMoment';
import { useBookMoment } from './moment/useBookMoment';
import { Page, Muted, Night, Dedication, NightText } from './styles';

/**
 * /tehillim/<slug> — one reading: the dedication and live progress with the
 * call to read, sharing, the chapter map, activity, and (for the organizer)
 * the controls. Opening right after creating leads with sharing.
 */
export const FRESH_KEY = 'orayta_tehillim_fresh';

const Hint = styled.p`margin: 0; text-align: center; font-size: ${theme.fontSizes.sm}; color: ${theme.gilded.nightMuted};`;
const Err = styled.p`margin: 0; text-align: center; font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.game.goldLight};`;
const Pick = styled.div`display: flex; gap: ${theme.spacing.sm}; & > * { flex: 1; }`;

export default function CircleView({ slug }: { slug: string }) {
  const api = useCircle(slug);
  const { state, load } = api;
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pick, setPick] = useState<number | null>(null);
  const [fresh, setFresh] = useState(false);
  const { moment, clear } = useBookMoment(state?.books ?? null);

  useEffect(() => {
    try { if (sessionStorage.getItem(FRESH_KEY) === slug) { setFresh(true); sessionStorage.removeItem(FRESH_KEY); } } catch {}
  }, [slug]);

  const take = async (unit: number | null) => {
    setBusy(true);
    setError('');
    haptics.tap();
    const r = await api.take(unit);
    setBusy(false);
    setPick(null);
    if (r.ok) setReading(true);
    else setError(r.error === 'taken' ? HE.TH_TAKEN : HE.TH_ERROR);
  };

  if (load === 'missing') {
    return (
      <Page>
        <Night><Dedication>{HE.TH_NOT_FOUND}</Dedication><NightText>{HE.TH_NOT_FOUND_TEXT}</NightText></Night>
        <ButtonLink href="/tehillim" $variant="secondary">{HE.TH_HERO_CTA}</ButtonLink>
      </Page>
    );
  }
  if (!state) {
    return (
      <Page aria-busy="true">
        <Skeleton $h="340px" $r="24px" />
        <Skeleton $h="120px" $r="16px" />
        {load === 'error' && <Muted role="alert">{HE.TH_ERROR}</Muted>}
      </Page>
    );
  }

  const claim = state.me?.claim ?? null;
  const takeLabel = HE.TH_TAKE_UNIT[state.mode];
  return (
    <Page>
      <CircleHero state={state}>
        {state.closed ? <Hint>{HE.TH_CLOSED_TEXT}</Hint> : claim ? (
          <Button $variant="gold" $size="lg" $block onClick={() => setReading(true)}>{HE.TH_CONTINUE(unitTitle(state.mode, claim.unit))}</Button>
        ) : (
          <Button $variant="gold" $size="lg" $block disabled={busy} onClick={() => void take(null)}>{busy ? HE.TH_TAKING : takeLabel}</Button>
        )}
        {error && <Err role="alert">{error}</Err>}
        {!state.closed && <Hint>{HE.TH_OR_MAP}{state.me && state.me.read > 0 && ` · ${HE.TH_MY_READ(state.me.read)}`}</Hint>}
      </CircleHero>

      <SharePanel state={state} fresh={fresh} />
      <UnitMap mode={state.mode} round={state.round} cells={state.cells} disabled={state.closed || busy} onPick={u => setPick(u)} />
      <Activity stats={state.stats} mode={state.mode} />
      {state.manage && <ManagePanel state={state} api={api} />}

      <Sheet open={pick !== null} onClose={() => setPick(null)} title={pick !== null ? HE.TH_MAP_PICK(unitTitle(state.mode, pick)) : ''} maxWidth={420}>
        <Pick>
          <Button $variant="gold" $size="md" disabled={busy} onClick={() => void take(pick)}>{HE.TH_MAP_TAKE}</Button>
          <Button $variant="ghost" $size="md" onClick={() => setPick(null)}>{HE.CLOSE}</Button>
        </Pick>
      </Sheet>
      {moment !== null && <BookMoment books={moment} purpose={state.purpose} names={state.names} onDone={clear} />}
      <ReadingSheet open={reading} onClose={() => setReading(false)} state={state} api={api} />
    </Page>
  );
}
