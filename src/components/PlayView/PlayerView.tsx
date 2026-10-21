'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { PlayJoinResponse } from '@/types/play';
import { getMe, playFetch, setMe } from './playClient';
import { usePlayState, useWakeLock } from './usePlayState';
import PlayerLobby from './player/PlayerLobby';
import PlayerPad from './player/PlayerPad';
import PlayerResult, { resultBackground } from './player/PlayerResult';
import PlayerFinal from './player/PlayerFinal';
import PlayNotice from './PlayNotice';
import ReconnectBadge from './ReconnectBadge';
import SoundToggle from './SoundToggle';
import { useGameSounds } from './sound/useGameSounds';
import { play } from './sound/sfx';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { Stage } from './playStyles';

const Corner = styled.div`
  position: absolute;
  top: max(${theme.spacing.sm}, env(safe-area-inset-top));
  left: ${theme.spacing.sm};
  display: flex;
  gap: ${theme.spacing.xs};
  z-index: ${theme.z.sticky};
`;

/** A participant's phone. Without a saved identity for this game → join flow. */
export default function PlayerView({ code }: { code: string }) {
  const router = useRouter();
  const [me, setMeState] = useState<PlayJoinResponse | null | undefined>(undefined);
  useEffect(() => {
    const saved = getMe(code);
    if (!saved) router.replace(`/play?code=${code}`);
    setMeState(saved);
  }, [code, router]);
  if (!me) return <Stage />;
  return <PlayerGame code={code} me={me} />;
}

function PlayerGame({ code, me }: { code: string; me: PlayJoinResponse }) {
  const router = useRouter();
  const { state, fatal, reconnecting, now, refresh } = usePlayState(code, { me }, 1000);
  const [picked, setPicked] = useState<{ q: number; choice: number } | null>(null);
  const buzzed = useRef('');
  useWakeLock(true);

  // Saved identity no longer valid for this game → start over at the join screen.
  useEffect(() => {
    if (state && !state.me) { setMe(code, null); router.replace(`/play?code=${code}`); }
  }, [state, code, router]);

  // One haptic per revealed question.
  useEffect(() => {
    if (state?.status !== 'reveal' || !state.me) return;
    const key = `${state.version}`;
    if (buzzed.current === key) return;
    buzzed.current = key;
    if (state.me.correct) haptics.success(); else haptics.error();
  }, [state]);

  const pick = useCallback(async (choice: number) => {
    const qIndex = state?.question?.index;
    if (qIndex === undefined || picked?.q === qIndex) return;
    haptics.tap();
    play('lock');
    setPicked({ q: qIndex, choice });
    const res = await playFetch<{ ok: boolean }>(`/api/play/${code}/answer`, {
      method: 'POST', body: JSON.stringify({ qIndex, choice }), identity: { me },
    });
    if (!res.ok && res.error !== 'already') setPicked(null);
    refresh();
  }, [state, picked, code, me, refresh]);

  const mineNow = picked && state?.question && picked.q === state.question.index;
  useGameSounds('player', state, now, { answered: !!mineNow || !!state?.me?.answered });

  if (fatal) return <PlayNotice title={HE.PLAY_GAME_GONE} />;
  if (!state || !state.me) return <Stage />;
  if (state.me.kicked) return <PlayNotice title={HE.PLAY_KICKED} />;

  const mine = picked && picked.q === state.question?.index ? picked.choice : null;
  return (
    <Stage style={{ background: resultBackground(state) }}>
      <Corner><SoundToggle /><ReconnectBadge show={reconnecting} /></Corner>
      {state.status === 'lobby' && <PlayerLobby state={state} me={state.me} />}
      {state.status === 'question' && <PlayerPad state={state} now={now} picked={mine} onPick={c => { void pick(c); }} />}
      {(state.status === 'reveal' || state.status === 'board') && <PlayerResult state={state} me={state.me} />}
      {state.status === 'ended' && <PlayerFinal me={state.me} />}
    </Stage>
  );
}
