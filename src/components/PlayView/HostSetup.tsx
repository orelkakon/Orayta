'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { QUESTION_COUNTS, QUESTION_SECONDS } from '@/lib/play/rules';
import { LEVELS, topicOf } from '@/lib/play/kinds';
import type { PlayCreateResponse, PlayErrorCode, PlaySettings } from '@/types/play';
import { playFetch, setHostKey } from './playClient';
import { Card, ErrorBox, Label, Segment, Segments, Select, TopBar } from './formStyles';
import { Center, GoldButton, Stage, Sub, Title } from './playStyles';
import KindPicker from './setup/KindPicker';
import EraPicker from './setup/EraPicker';
import { useSetupPrefs } from './setup/useSetupPrefs';

/**
 * /play/new — the host builds the game: which question types, which part of
 * the Talmud, which eras, how hard, how long. Choices are remembered.
 */
const Wide = styled(Card)`max-width: 640px;`;
const LabelRow = styled.div`display: flex; justify-content: space-between; align-items: baseline; gap: ${theme.spacing.sm};`;
const Hint = styled.small`color: ${theme.game.inkFaint}; font-size: ${theme.fontSizes.xs};`;
const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  background: linear-gradient(0deg, ${theme.game.stageSolid} 70%, transparent);
`;

const ERR: Partial<Record<PlayErrorCode | 'network', string>> = { not_enough: HE.PLAY_ERR_NOT_ENOUGH, rate_limited: HE.PLAY_ERR_RATE };

export default function HostSetup() {
  const router = useRouter();
  const [p, update] = useSetupPrefs();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topics = new Set(p.kinds.map(topicOf));
  // ~6s to read + the answer window + ~12s for reveal and leaderboard talk.
  const minutes = Math.max(1, Math.round((p.count * (p.seconds + 18)) / 60));

  const create = async () => {
    if (p.kinds.length === 0) { setError(HE.PLAY_ERR_NO_KINDS); return; }
    setBusy(true); setError(null);
    const [kind, value] = p.scope.split(':');
    const settings: PlaySettings = {
      kinds: p.kinds, count: p.count, seconds: p.seconds, level: p.level,
      ...(topics.has('talmud') && kind === 'm' ? { masechet: value } : topics.has('talmud') && kind === 's' ? { seder: value } : {}),
      ...(topics.has('rabbis') && p.eras.length ? { eras: p.eras } : {}),
    };
    const res = await playFetch<PlayCreateResponse>('/api/play', { method: 'POST', body: JSON.stringify(settings) });
    if (!res.ok) { setBusy(false); setError(ERR[res.error] ?? HE.PLAY_ERR_GENERIC); return; }
    setHostKey(res.data.code, res.data.hostKey);
    router.push(`/play/host/${res.data.code}`);
  };

  return (
    <Stage>
      <TopBar><strong>{HE.PLAY_TITLE}</strong><Link href="/play">{HE.PLAY_JOIN_TITLE}</Link></TopBar>
      <Center>
        <Title>{HE.PLAY_NEW_TITLE}</Title>
        <Sub>{HE.PLAY_NEW_SUB}</Sub>
        <Wide>
          <LabelRow><Label as="div">{HE.PLAY_KINDS_LABEL}</Label><Hint>{HE.PLAY_KINDS_COUNT(p.kinds.length)}</Hint></LabelRow>
          <KindPicker value={p.kinds} onChange={kinds => { update({ kinds }); setError(null); }} />

          {topics.has('talmud') && (
            <>
              <Label htmlFor="scope">{HE.PLAY_FILTER_LABEL}</Label>
              <Select id="scope" value={p.scope} onChange={e => update({ scope: e.target.value })}>
                <option value="">{HE.PLAY_FILTER_ALL}</option>
                {SEDARIM.map(s => (
                  <optgroup key={s} label={s}>
                    <option value={`s:${s}`}>{s}</option>
                    {MASECHTOT.filter(m => m.seder === s).map(m => <option key={m.name} value={`m:${m.name}`}>{m.name}</option>)}
                  </optgroup>
                ))}
              </Select>
            </>
          )}

          {topics.has('rabbis') && (
            <>
              <Label as="div">{HE.PLAY_ERAS_LABEL}</Label>
              <EraPicker value={p.eras} onChange={eras => update({ eras })} />
            </>
          )}

          <LabelRow><Label as="div">{HE.PLAY_LEVEL_LABEL}</Label><Hint>{HE.PLAY_LEVEL_HINT}</Hint></LabelRow>
          <Segments role="radiogroup" aria-label={HE.PLAY_LEVEL_LABEL}>
            {LEVELS.map(l => (
              <Segment key={l} type="button" role="radio" aria-checked={l === p.level} $on={l === p.level} onClick={() => update({ level: l })}>
                {HE[`PLAY_LEVEL_${l}`]}
              </Segment>
            ))}
          </Segments>

          <Label as="div">{HE.PLAY_COUNT_LABEL}</Label>
          <Segments role="radiogroup" aria-label={HE.PLAY_COUNT_LABEL}>
            {QUESTION_COUNTS.map(n => <Segment key={n} type="button" role="radio" aria-checked={n === p.count} $on={n === p.count} onClick={() => update({ count: n })}>{n}</Segment>)}
          </Segments>

          <Label as="div">{HE.PLAY_SECONDS_LABEL}</Label>
          <Segments role="radiogroup" aria-label={HE.PLAY_SECONDS_LABEL}>
            {QUESTION_SECONDS.map(n => <Segment key={n} type="button" role="radio" aria-checked={n === p.seconds} $on={n === p.seconds} onClick={() => update({ seconds: n })}>{HE.PLAY_SECONDS(n)}</Segment>)}
          </Segments>

          <Footer>
            <Sub style={{ textAlign: 'center' }}>{HE.PLAY_ESTIMATE(minutes)}</Sub>
            {error && <ErrorBox role="alert">{error}</ErrorBox>}
            <GoldButton type="button" onClick={() => { void create(); }} disabled={busy || p.kinds.length === 0}>
              {busy ? HE.PLAY_CREATING : HE.PLAY_CREATE_BTN}
            </GoldButton>
          </Footer>
        </Wide>
      </Center>
    </Stage>
  );
}
