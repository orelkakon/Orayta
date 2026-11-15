'use client';

import { useEffect, useState } from 'react';
import {
  InterestPrefs, NO_PREFS, cacheEnabled, onPrefsChange, readCachedEnabled, readPrefs,
} from '@/lib/interests';

export interface InterestsState {
  /** The admin's switch (false until known on a first visit). */
  enabled: boolean;
  prefs: InterestPrefs;
  /** Device prefs have been read. */
  ready: boolean;
}

let configLoad: Promise<boolean> | null = null;

/** One request per page load; on failure keep what this device saw last (or on). */
function loadEnabled(): Promise<boolean> {
  configLoad ??= fetch('/api/config/home')
    .then(r => (r.ok ? r.json() as Promise<{ personalize?: boolean }> : Promise.reject(new Error('config'))))
    .then(c => {
      const on = c.personalize !== false;
      cacheEnabled(on);
      return on;
    })
    .catch(() => readCachedEnabled() ?? true);
  return configLoad;
}

/** Home personalisation: the admin switch + this device's interests, kept in sync. */
export function useInterests(): InterestsState {
  const [state, setState] = useState<InterestsState>({ enabled: false, prefs: NO_PREFS, ready: false });

  useEffect(() => {
    let alive = true;
    setState({ enabled: readCachedEnabled() ?? false, prefs: readPrefs(), ready: true });
    void loadEnabled().then(enabled => { if (alive) setState(s => ({ ...s, enabled })); });
    const off = onPrefsChange(prefs => setState(s => ({ ...s, prefs })));
    return () => { alive = false; off(); };
  }, []);

  return state;
}

/** Interests that apply right now (none when the admin turned personalisation off). */
export const activeInterests = (s: InterestsState) => (s.enabled ? s.prefs.picked : []);
