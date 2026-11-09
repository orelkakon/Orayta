'use client';

import { useEffect, useRef } from 'react';
import type { LastAnswer } from '@/lib/rabbiBot/client';

const same = (a: string, b: string) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();

/**
 * A question that arrived in a shared link (/ask?q=…): once the panel is
 * ready (local state read, welcome accepted) it is reopened from this
 * device's history when already answered here, otherwise asked — usually
 * served from the server's cache. The query is then dropped from the URL so
 * a reload doesn't ask again.
 */
export function useSharedQuestion(
  question: string | null | undefined,
  ready: boolean,
  history: LastAnswer[],
  ask: (q: string) => Promise<void>,
  reopen: (item: LastAnswer) => void,
) {
  const done = useRef(false);
  useEffect(() => {
    if (!question || !ready || done.current) return;
    done.current = true;
    const known = history.find(h => same(h.question, question));
    if (known) reopen(known);
    else void ask(question);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {}
  }, [question, ready, history, ask, reopen]);
}
