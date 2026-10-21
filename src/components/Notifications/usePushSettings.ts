'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  pushSupport, readLocal, enablePush, savePrefs, saveLocalPrefs, ensureRegistered, disablePush, isSubscribed, localTest, DEFAULT_PREFS,
  type PushSupport,
} from '@/lib/push/client';
import type { PushPrefs } from '@/types/push';

export type PushView = 'loading' | PushSupport | 'denied' | 'off' | 'on';
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 600;

/** All state for the notifications sheet: support, permission, subscription and prefs. */
export function usePushSettings(active: boolean) {
  const [view, setView] = useState<PushView>('loading');
  const [prefs, setPrefs] = useState<PushPrefs>(DEFAULT_PREFS);
  const [busy, setBusy] = useState(false);
  const [save, setSave] = useState<SaveState>('idle');
  const timer = useRef<number | undefined>(undefined);
  const viewRef = useRef<PushView>('loading');
  viewRef.current = view;

  const refresh = useCallback(async () => {
    const support = pushSupport();
    const local = readLocal();
    setPrefs({ dailyMinutes: local.dailyMinutes, daily: local.daily, hilula: local.hilula, omer: local.omer });
    if (support !== 'supported') { setView(support); return; }
    if (Notification.permission === 'denied') { setView('denied'); return; }
    const on = await isSubscribed();
    if (on) await ensureRegistered();
    setSave('idle');
    setView(on ? 'on' : 'off');
  }, []);

  useEffect(() => { if (active) void refresh(); }, [active, refresh]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enable = useCallback(async () => {
    setBusy(true);
    const result = await enablePush(prefs);
    setBusy(false);
    if (result === 'ok') { setView('on'); setSave('idle'); }
    else if (result === 'denied') setView('denied');
    else setSave('error');
  }, [prefs]);

  const update = useCallback((patch: Partial<PushPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      window.clearTimeout(timer.current);
      // Not subscribed yet: just remember the choice — enable() sends it along.
      if (viewRef.current !== 'on') { saveLocalPrefs(next); setSave('idle'); return next; }
      setSave('saving');
      timer.current = window.setTimeout(async () => {
        setSave(await savePrefs(next) ? 'saved' : 'error');
      }, SAVE_DEBOUNCE_MS);
      return next;
    });
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    await disablePush();
    setBusy(false);
    setView('off');
  }, []);

  const test = useCallback(() => localTest(), []);

  return { view, prefs, busy, save, enable, update, disable, test };
}
