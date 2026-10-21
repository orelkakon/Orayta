'use client';

import { useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { isMuted, onMutedChange, setMuted } from './sound/engine';
import { GhostButton } from './playStyles';

/** 🔊 / 🔇 — per device, remembered. Turning sound on also unlocks audio. */
export default function SoundToggle() {
  const [muted, setState] = useState(false);
  useEffect(() => { setState(isMuted()); return onMutedChange(setState); }, []);
  return (
    <GhostButton type="button" onClick={() => setMuted(!muted)} aria-pressed={!muted}
      aria-label={muted ? HE.PLAY_SOUND_ON : HE.PLAY_SOUND_OFF} title={muted ? HE.PLAY_SOUND_ON : HE.PLAY_SOUND_OFF}>
      {muted ? '🔇' : '🔊'}
    </GhostButton>
  );
}
