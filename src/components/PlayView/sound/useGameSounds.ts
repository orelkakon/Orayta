'use client';

import { useEffect, useRef } from 'react';
import type { PlayState } from '@/types/play';
import { initMuted, unlock } from './engine';
import { play } from './sfx';
import { setTension, startMusic, stopMusic } from './music';

/**
 * Turns game state into sound. The big screen (host / projector) gets the
 * full show — music, countdown ticks, reveal sting, winner fanfare; phones
 * get only their own moments (last-seconds ticks, right / wrong, final).
 */
type Role = 'stage' | 'player';

function useUnlockOnTap(defaultMuted: boolean): void {
  useEffect(() => {
    initMuted(defaultMuted);
    const on = () => unlock();
    window.addEventListener('pointerdown', on);
    window.addEventListener('keydown', on);
    return () => { window.removeEventListener('pointerdown', on); window.removeEventListener('keydown', on); };
  }, [defaultMuted]);
}

export function useGameSounds(role: Role, state: PlayState | null, now: () => number, opts: { answered?: boolean; defaultMuted?: boolean } = {}): void {
  useUnlockOnTap(!!opts.defaultMuted);
  const seen = useRef({ version: -1, players: 0, lastSec: -1, upFor: -1 });

  // Phase changes.
  useEffect(() => {
    if (!state) return;
    const s = seen.current;
    if (state.status === 'lobby' && role === 'stage' && state.playerCount > s.players && s.version >= 0) play('join');
    s.players = state.playerCount;
    if (state.version === s.version) return;
    const first = s.version < 0;
    s.version = state.version;
    if (first) return; // don't replay the current phase on page load
    if (state.status === 'question') { if (role === 'stage') play('start'); }
    if (state.status === 'reveal') {
      stopMusic();
      if (role === 'stage') play('reveal');
      else if (state.me) play(state.me.correct ? 'correct' : 'wrong');
    }
    if (state.status === 'board' && role === 'stage') play('whoosh');
    if (state.status === 'ended') {
      stopMusic();
      if (role === 'stage' || (state.me && state.me.rank <= 3)) play('fanfare'); else play('chime');
    }
  }, [state, role]);

  // Countdown: music while answers are open, ticks for the last five seconds.
  const q = state?.status === 'question' ? state.question : null;
  const answered = !!opts.answered;
  useEffect(() => {
    if (!q) { stopMusic(); return; }
    const id = setInterval(() => {
      const t = now();
      const s = seen.current;
      if (t < q.opensAt) return;
      if (role === 'stage' && t <= q.endsAt) startMusic();
      const left = Math.ceil((q.endsAt - t) / 1000);
      setTension(left <= 5);
      if (left !== s.lastSec && left >= 1 && left <= 5 && !(role === 'player' && answered)) play(left <= 3 ? 'tickUrgent' : 'tick');
      s.lastSec = left;
      if (t > q.endsAt && s.upFor !== q.index) {
        s.upFor = q.index;
        stopMusic();
        if (role === 'stage' || !answered) play('timeUp');
      }
    }, 100);
    return () => clearInterval(id);
  }, [q, now, role, answered]);

  useEffect(() => () => stopMusic(), []);
}
