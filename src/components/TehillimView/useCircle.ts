'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TehillimState } from '@/types/tehillim';
import { headingOf, manageKeyFor, rememberCircle, thFetch } from '@/lib/tehillim/client';

/**
 * The live reading: polled every few seconds while the page is visible (a
 * minute apart when hidden), plus the reader's actions. Each action returns
 * the fresh state from the server, so the screen never waits for a poll.
 */
const VISIBLE_MS = 5000;
const HIDDEN_MS = 60_000;

export type Load = 'loading' | 'ready' | 'missing' | 'error';

export function useCircle(slug: string) {
  const [state, setState] = useState<TehillimState | null>(null);
  const [load, setLoad] = useState<Load>('loading');
  const manageKey = useRef<string | null>(null);

  const apply = useCallback((s: TehillimState) => {
    setState(s);
    setLoad('ready');
    rememberCircle(s.slug, headingOf(s.purpose, s.names), manageKey.current ?? undefined);
  }, []);

  const refresh = useCallback(async () => {
    const r = await thFetch<TehillimState>(`/api/tehillim/${slug}`, { manageKey: manageKey.current });
    if (r.ok) apply(r.data);
    else setLoad(prev => (r.status === 404 ? 'missing' : prev === 'ready' ? 'ready' : 'error'));
  }, [slug, apply]);

  useEffect(() => {
    // An organizer link carries its key in the hash (never sent to the server): keep it, then drop it from the address.
    const m = /[#&]m=([\w-]{16,128})/.exec(window.location.hash);
    if (m) {
      manageKey.current = m[1];
      rememberCircle(slug, '', m[1]);
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    } else {
      manageKey.current = manageKeyFor(slug);
    }
    void refresh();
    let timer = 0;
    const loop = () => { timer = window.setTimeout(() => { void refresh().finally(loop); }, document.hidden ? HIDDEN_MS : VISIBLE_MS); };
    loop();
    const onShow = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', onShow);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', onShow); };
  }, [slug, refresh]);

  const act = useCallback(async (path: string, body: object, method = 'POST') => {
    const r = await thFetch<TehillimState>(path, { method, body: JSON.stringify(body), manageKey: manageKey.current });
    if (r.ok && r.data) apply(r.data);
    return r;
  }, [apply]);

  return {
    state, load, manageKey: manageKey.current, refresh,
    take: (unit: number | null) => act(`/api/tehillim/${slug}/claim`, unit === null ? {} : { unit }),
    finish: (id: string, name: string) => act(`/api/tehillim/${slug}/claim/${id}`, { action: 'done', name: name || undefined }),
    release: (id: string) => act(`/api/tehillim/${slug}/claim/${id}`, { action: 'release' }),
    manage: (body: object) => act(`/api/tehillim/${slug}`, body, 'PATCH'),
    remove: () => thFetch<null>(`/api/tehillim/${slug}`, { method: 'DELETE', manageKey: manageKey.current }),
  };
}

export type CircleApi = ReturnType<typeof useCircle>;
