'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { PlayCreateResponse, PlayHostAction } from '@/types/play';
import { getHostKey, hostAction, playFetch, setHostKey } from './playClient';
import { usePlayState, useWakeLock } from './usePlayState';
import { useGameSounds } from './sound/useGameSounds';
import Stage from './stage/Stage';
import HostControls from './HostControls';
import HostSheets, { type HostSheet } from './HostSheets';
import HostTopBar from './HostTopBar';
import PlayNotice from './PlayNotice';
import { Stage as StageShell } from './playStyles';

/**
 * The host's device: everything the projector shows plus the controls. The
 * host key lives in localStorage; a "remote control" link carries it in the
 * URL hash (never sent to the server) to hand control to another phone.
 */
export default function HostView({ code }: { code: string }) {
  const [hostKey, setKey] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const m = window.location.hash.match(/k=([a-f0-9]{48})/);
    if (m) {
      setHostKey(code, m[1]);
      window.history.replaceState(null, '', window.location.pathname);
    }
    setKey(getHostKey(code));
  }, [code]);

  if (hostKey === undefined) return <StageShell />;
  if (!hostKey) return <PlayNotice title={HE.PLAY_NOT_HOST} sub={HE.PLAY_NOT_HOST_HINT} screenCode={code} />;
  return <HostGame code={code} hostKey={hostKey} />;
}

function HostGame({ code, hostKey }: { code: string; hostKey: string }) {
  const router = useRouter();
  const { state, fatal, reconnecting, now, refresh } = usePlayState(code, { hostKey }, 800);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<HostSheet | null>(null);
  useWakeLock(true);
  // A host on a phone is usually the remote next to a projector that plays the sound.
  useGameSounds('stage', state, now, { defaultMuted: window.matchMedia('(pointer: coarse)').matches });

  const act = useCallback(async (action: PlayHostAction) => {
    setBusy(true);
    haptics.tap();
    await hostAction(code, hostKey, action);
    refresh();
    setBusy(false);
  }, [code, hostKey, refresh]);

  const playAgain = useCallback(async () => {
    if (!state) return;
    setBusy(true);
    const res = await playFetch<PlayCreateResponse>('/api/play', { method: 'POST', body: JSON.stringify(state.settings) });
    setBusy(false);
    if (!res.ok) return;
    setHostKey(res.data.code, res.data.hostKey);
    router.push(`/play/host/${res.data.code}`);
  }, [state, router]);

  // Keyboard remote for a laptop at the front of the room: space / → advances.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!state || sheet || busy || (e.target as HTMLElement).closest('input,textarea,button')) return;
      if (e.key !== ' ' && e.key !== 'ArrowLeft' && e.key !== 'Enter') return;
      e.preventDefault();
      const s = state.status;
      const last = state.current + 1 >= state.total;
      if (s === 'lobby' && state.playerCount > 0) void act({ action: 'start' });
      else if (s === 'question') void act({ action: 'reveal' });
      else if (s === 'reveal') void act({ action: last ? 'next' : 'board' });
      else if (s === 'board') void act({ action: 'next' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, sheet, busy, act]);

  if (fatal) return <PlayNotice title={HE.PLAY_GAME_GONE} />;
  if (!state) return <StageShell />;
  if (!state.isHost) return <PlayNotice title={HE.PLAY_NOT_HOST} sub={HE.PLAY_NOT_HOST_HINT} screenCode={code} />;

  return (
    <StageShell>
      <HostTopBar state={state} reconnecting={reconnecting} onOpen={kind => setSheet({ kind })} />
      <Stage state={state} now={now} onKick={(id, name) => setSheet({ kind: 'kick', id, name })} />
      <HostControls
        state={state}
        busy={busy}
        onAction={a => { void act({ action: a } as PlayHostAction); }}
        onPlayAgain={() => { void playAgain(); }}
        onNewGame={() => router.push('/play/new')}
      />
      {sheet && (
        <HostSheets
          sheet={sheet}
          code={code}
          hostKey={hostKey}
          roster={state.roster}
          total={state.total}
          seconds={state.settings.seconds}
          onClose={() => setSheet(null)}
          onAskKick={(id, name) => setSheet({ kind: 'kick', id, name })}
          onKick={id => { void act({ action: 'kick', playerId: id }); }}
          onEnd={() => { void act({ action: 'end' }); }}
        />
      )}
    </StageShell>
  );
}
