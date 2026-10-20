'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AmudRef, TalmudPage } from '@/types/talmudContext';

export type PageState =
  | { status: 'loading' }
  | { status: 'error'; notFound: boolean }
  | { status: 'ready'; page: TalmudPage };

// One amud never changes — keep every page fetched this session, and share
// in-flight requests so a prefetch and a render don't both hit the network.
const cache = new Map<string, TalmudPage>();
const inflight = new Map<string, Promise<TalmudPage>>();

class PageError extends Error {
  constructor(readonly notFound: boolean) { super('talmud_page'); }
}

const keyOf = (masechet: string, at: AmudRef) => `${masechet}|${at.daf}|${at.amud}`;

export function loadTalmudPage(masechet: string, at: AmudRef): Promise<TalmudPage> {
  const key = keyOf(masechet, at);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(key);
  if (running) return running;
  const params = new URLSearchParams({ masechet, daf: String(at.daf), amud: at.amud });
  const p = fetch(`/api/talmud/context?${params}`)
    .then(async res => {
      if (!res.ok) throw new PageError(res.status === 404 || res.status === 400);
      const page = await res.json() as TalmudPage;
      cache.set(key, page);
      return page;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** The amud at `at`, loaded through the session cache; `retry` refetches after an error. */
export function useTalmudPage(masechet: string, at: AmudRef) {
  const key = keyOf(masechet, at);
  const [state, setState] = useState<PageState>(() => {
    const hit = cache.get(key);
    return hit ? { status: 'ready', page: hit } : { status: 'loading' };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    const hit = cache.get(key);
    setState(hit ? { status: 'ready', page: hit } : { status: 'loading' });
    if (hit) return;
    loadTalmudPage(masechet, at)
      .then(page => { if (alive) setState({ status: 'ready', page }); })
      .catch((e: unknown) => {
        if (alive) setState({ status: 'error', notFound: e instanceof PageError && e.notFound });
      });
    return () => { alive = false; };
    // `key` captures masechet + at; `attempt` re-runs after a failure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { state, retry };
}
