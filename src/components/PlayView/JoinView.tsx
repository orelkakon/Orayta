'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { AVATARS, NAME_MAX, isCode } from '@/lib/play/rules';
import type { PlayErrorCode, PlayJoinResponse, PlayState } from '@/types/play';
import { getMe, getProfile, playFetch, setMe, setProfile } from './playClient';
import { Card, ErrorBox, Field, Label, PinField, TopBar } from './formStyles';
import { Center, GhostButton, GoldButton, Stage, Sub, Title, press } from './playStyles';

/** /play — type (or scan) the PIN, pick a name and a symbol, you're in. */
const Avatars = styled.div`display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; ${theme.media.xs} { grid-template-columns: repeat(4, 1fr); }`;
const Av = styled.button<{ $on: boolean }>`
  ${press};
  aspect-ratio: 1;
  border-radius: ${theme.radii.md};
  font-size: 1.5rem;
  background: ${({ $on }) => ($on ? theme.game.glassHi : 'transparent')};
  border: 2px solid ${({ $on }) => ($on ? theme.game.gold : theme.game.glassLine)};
`;
const HostLink = styled(Link)`color: ${theme.game.gold}; font-weight: 600; text-decoration: none;`;

const ERRORS: Partial<Record<PlayErrorCode | 'network', string>> = {
  not_found: HE.PLAY_PIN_NOT_FOUND, ended: HE.PLAY_PIN_ENDED, name_taken: HE.PLAY_ERR_NAME_TAKEN,
  name_invalid: HE.PLAY_ERR_NAME_INVALID, full: HE.PLAY_ERR_FULL, rate_limited: HE.PLAY_ERR_RATE,
};
const errText = (e: PlayErrorCode | 'network') => ERRORS[e] ?? HE.PLAY_ERR_GENERIC;

export default function JoinView() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (c: string) => {
    if (getMe(c)) { router.push(`/play/${c}`); return; }
    setBusy(true); setError(null);
    const res = await playFetch<PlayState>(`/api/play/${c}`);
    setBusy(false);
    if (!res.ok) { setError(errText(res.error)); return; }
    if (res.data.status === 'ended') { setError(HE.PLAY_PIN_ENDED); return; }
    setStep('name');
  };

  useEffect(() => {
    const p = getProfile();
    if (p) { setName(p.name); setAvatar(p.avatar); }
    const fromUrl = params.get('code') ?? '';
    if (isCode(fromUrl)) { setCode(fromUrl); void check(fromUrl); }
    // Run once on arrival (QR links carry ?code=).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async () => {
    setBusy(true); setError(null);
    const res = await playFetch<PlayJoinResponse>(`/api/play/${code}/join`, { method: 'POST', body: JSON.stringify({ name, avatar }) });
    setBusy(false);
    if (!res.ok) { setError(errText(res.error)); return; }
    setMe(code, res.data);
    setProfile({ name: res.data.name, avatar: res.data.avatar });
    router.push(`/play/${code}`);
  };

  return (
    <Stage>
      <TopBar><strong>{HE.PLAY_TITLE}</strong><Link href="/">{HE.PLAY_BACK_HOME}</Link></TopBar>
      <Center>
        <Title>{HE.PLAY_JOIN_TITLE}</Title>
        {step === 'code' ? (
          <Card as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (isCode(code)) void check(code); }}>
            <Label htmlFor="pin">{HE.PLAY_PIN_LABEL}</Label>
            <PinField id="pin" inputMode="numeric" autoComplete="off" autoFocus maxLength={6} value={code}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(v); setError(null);
                if (isCode(v)) void check(v);
              }} />
            <Sub>{HE.PLAY_PIN_HINT}</Sub>
            {error && <ErrorBox role="alert">{error}</ErrorBox>}
            <GoldButton type="submit" disabled={!isCode(code) || busy}>{busy ? HE.PLAY_CHECKING : HE.PLAY_CONTINUE}</GoldButton>
          </Card>
        ) : (
          <Card as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (name.trim()) void join(); }}>
            <Label htmlFor="nick">{HE.PLAY_NAME_LABEL}</Label>
            <Field id="nick" autoFocus maxLength={NAME_MAX} value={name} placeholder={HE.PLAY_NAME_PLACEHOLDER}
              onChange={e => { setName(e.target.value); setError(null); }} />
            <Label as="div">{HE.PLAY_AVATAR_LABEL}</Label>
            <Avatars role="radiogroup" aria-label={HE.PLAY_AVATAR_LABEL}>
              {AVATARS.map(a => (
                <Av key={a} type="button" role="radio" aria-checked={a === avatar} $on={a === avatar} onClick={() => setAvatar(a)}>{a}</Av>
              ))}
            </Avatars>
            {error && <ErrorBox role="alert">{error}</ErrorBox>}
            <GoldButton type="submit" disabled={!name.trim() || busy}>{busy ? HE.PLAY_JOINING : HE.PLAY_JOIN_BTN}</GoldButton>
            <GhostButton type="button" onClick={() => { setStep('code'); setError(null); }}>{HE.PLAY_CHANGE_CODE} · {code}</GhostButton>
          </Card>
        )}
        <HostLink href="/play/new">{HE.PLAY_HOST_CTA} ←</HostLink>
      </Center>
    </Stage>
  );
}
