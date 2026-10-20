'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { QUESTION_COUNTS, QUESTION_SECONDS } from '@/lib/play/rules';
import { LineIcon } from '@/components/common/LineIcons';
import type { PlayCreateResponse, PlayErrorCode, PlaySettings, PlayTopic } from '@/types/play';
import { playFetch, setHostKey } from './playClient';
import { Card, ErrorBox, Label, Segment, Segments, Select, TopBar } from './formStyles';
import { Center, GoldButton, Stage, Sub, Title, press } from './playStyles';

/** /play/new — choose topics, length and pace; create; land on the host screen. */
const Topics = styled.div`display: grid; gap: ${theme.spacing.sm};`;
const Topic = styled.button<{ $on: boolean }>`
  ${press};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.ms};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.lg};
  text-align: right;
  background: ${({ $on }) => ($on ? 'rgba(232,203,118,0.14)' : 'rgba(0,0,0,0.2)')};
  border: 2px solid ${({ $on }) => ($on ? theme.game.gold : theme.game.glassLine)};
  color: ${theme.game.ink};
  strong { display: block; font-size: ${theme.fontSizes.lg}; }
  small { color: ${theme.game.inkMuted}; font-size: ${theme.fontSizes.sm}; }
  > span:last-child { margin-inline-start: auto; font-size: 1.3rem; color: ${theme.game.gold}; }
`;
const Icon = styled.span`
  display: inline-flex; width: 44px; height: 44px; flex: none; align-items: center; justify-content: center;
  border-radius: ${theme.radii.md}; background: ${theme.game.glass}; color: ${theme.game.gold};
`;
const Estimate = styled(Sub)`text-align: center;`;

const TOPIC_UI: { key: PlayTopic; icon: string; label: string; desc: string }[] = [
  { key: 'talmud', icon: 'scroll', label: HE.PLAY_TOPIC_TALMUD, desc: HE.PLAY_TOPIC_TALMUD_DESC },
  { key: 'rabbis', icon: 'users', label: HE.PLAY_TOPIC_RABBIS, desc: HE.PLAY_TOPIC_RABBIS_DESC },
  { key: 'gematria', icon: 'aleph', label: HE.PLAY_TOPIC_GEMATRIA, desc: HE.PLAY_TOPIC_GEMATRIA_DESC },
];
const ERR: Partial<Record<PlayErrorCode | 'network', string>> = { not_enough: HE.PLAY_ERR_NOT_ENOUGH, rate_limited: HE.PLAY_ERR_RATE };

export default function HostSetup() {
  const router = useRouter();
  const [topics, setTopics] = useState<PlayTopic[]>(['talmud', 'rabbis']);
  const [scope, setScope] = useState('');
  const [count, setCount] = useState<number>(10);
  const [seconds, setSeconds] = useState<number>(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: PlayTopic) => setTopics(cur => (cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]));
  // ~6s to read + the answer window + ~12s for reveal and leaderboard talk.
  const minutes = Math.max(1, Math.round((count * (seconds + 18)) / 60));

  const create = async () => {
    setBusy(true); setError(null);
    const [kind, value] = scope.split(':');
    const settings: PlaySettings = {
      topics, count, seconds,
      ...(kind === 'm' ? { masechet: value } : kind === 's' ? { seder: value } : {}),
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
        <Card>
          <Label as="div">{HE.PLAY_TOPICS_LABEL}</Label>
          <Topics>
            {TOPIC_UI.map(t => (
              <Topic key={t.key} type="button" $on={topics.includes(t.key)} aria-pressed={topics.includes(t.key)} onClick={() => toggle(t.key)}>
                <Icon><LineIcon name={t.icon} size={22} /></Icon>
                <span><strong>{t.label}</strong><small>{t.desc}</small></span>
                <span aria-hidden>{topics.includes(t.key) ? '✓' : ''}</span>
              </Topic>
            ))}
          </Topics>
          {topics.includes('talmud') && (
            <>
              <Label htmlFor="scope">{HE.PLAY_FILTER_LABEL}</Label>
              <Select id="scope" value={scope} onChange={e => setScope(e.target.value)}>
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
          <Label as="div">{HE.PLAY_COUNT_LABEL}</Label>
          <Segments role="radiogroup" aria-label={HE.PLAY_COUNT_LABEL}>
            {QUESTION_COUNTS.map(n => <Segment key={n} type="button" role="radio" aria-checked={n === count} $on={n === count} onClick={() => setCount(n)}>{n}</Segment>)}
          </Segments>
          <Label as="div">{HE.PLAY_SECONDS_LABEL}</Label>
          <Segments role="radiogroup" aria-label={HE.PLAY_SECONDS_LABEL}>
            {QUESTION_SECONDS.map(n => <Segment key={n} type="button" role="radio" aria-checked={n === seconds} $on={n === seconds} onClick={() => setSeconds(n)}>{HE.PLAY_SECONDS(n)}</Segment>)}
          </Segments>
          <Estimate>{HE.PLAY_ESTIMATE(minutes)}</Estimate>
          {error && <ErrorBox role="alert">{error}</ErrorBox>}
          <GoldButton type="button" onClick={() => { void create(); }} disabled={busy || topics.length === 0}>
            {busy ? HE.PLAY_CREATING : HE.PLAY_CREATE_BTN}
          </GoldButton>
        </Card>
      </Center>
    </Stage>
  );
}
