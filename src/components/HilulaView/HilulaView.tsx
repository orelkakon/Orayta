'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { openNotifications } from '@/lib/push/client';
import type { HilulaResponse } from '@/types/push';
import HilulaCandle from './HilulaCandle';
import TzadikCard from './TzadikCard';
import UpcomingHilulot from './UpcomingHilulot';
import { Page, Hero, Eyebrow, Title, DateLine, Panel, PanelTitle, LightBtn, Counter, Chips, Chip, Hint, QuietLink, Muted } from './hilulaStyles';

const LIT_KEY = 'orayta_hilula_lit';

export default function HilulaView() {
  const [data, setData] = useState<HilulaResponse | null>(null);
  const [error, setError] = useState(false);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    fetch('/api/hilula')
      .then(r => (r.ok ? r.json() as Promise<HilulaResponse> : Promise.reject()))
      .then(d => {
        setData(d);
        try { setLit(localStorage.getItem(LIT_KEY) === d.today.iso); } catch { /* private mode */ }
      })
      .catch(() => setError(true));
  }, []);

  const light = async () => {
    if (lit || !data) return;
    setLit(true);
    setData({ ...data, candles: data.candles + 1 });
    try { localStorage.setItem(LIT_KEY, data.today.iso); } catch { /* private mode */ }
    const res = await fetch('/api/hilula/candle', { method: 'POST' }).catch(() => null);
    const body = res?.ok ? await res.json() as { candles: number } : null;
    if (body) setData(d => (d ? { ...d, candles: Math.max(d.candles, body.candles) } : d));
  };

  if (error) return <Page><Muted>{HE.HILULA_ERROR}</Muted></Page>;
  if (!data) return <Page><Muted role="status">{HE.LOADING}</Muted></Page>;

  const { today, upcoming, candles } = data;
  const hasToday = today.rabbis.length > 0;

  return (
    <Page>
      <Hero>
        <Eyebrow>{HE.HILULA_EYEBROW}</Eyebrow>
        <Title>{HE.HILULA_PAGE_TITLE}</Title>
        <DateLine>{HE.HILULA_TODAY} · {today.hebrew}</DateLine>
      </Hero>

      {hasToday ? today.rabbis.map(r => <TzadikCard key={r.id} rabbi={r} />) : <Muted>{HE.HILULA_NONE_TODAY}</Muted>}

      {hasToday && (
        <Panel>
          <HilulaCandle lit={lit} />
          <LightBtn type="button" $lit={lit} onClick={() => void light()} aria-pressed={lit}>
            {lit ? HE.HILULA_LIT : HE.HILULA_LIGHT}
          </LightBtn>
          {candles > 0 && <Counter aria-live="polite">{HE.HILULA_CANDLES(candles)}</Counter>}
        </Panel>
      )}

      {hasToday && (
        <Panel>
          <PanelTitle><LineIcon name="note" size={18} /> {HE.HILULA_TEHILLIM}</PanelTitle>
          <Hint>{HE.HILULA_TEHILLIM_HINT}</Hint>
          <Chips>
            {HE.HILULA_PERAKIM.map(p => (
              <Chip key={p.n} as={Link} href={`/content?open=tehillim&chapter=${p.n}`}>{HE.HILULA_PERAK(p.label)}</Chip>
            ))}
          </Chips>
        </Panel>
      )}

      {upcoming.length > 0 && <UpcomingHilulot days={upcoming} />}

      <QuietLink type="button" onClick={openNotifications}>
        <LineIcon name="bell" size={16} /> {HE.HILULA_NOTIFY}
      </QuietLink>
    </Page>
  );
}
