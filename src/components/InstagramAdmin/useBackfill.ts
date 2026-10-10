'use client';

import { useCallback, useState } from 'react';
import type { BackfillEvent, BackfillSummary } from '@/lib/igBackfill';

export type BackfillState =
  | { phase: 'idle' }
  | { phase: 'running'; status: 'starting' | 'listing' | 'inspecting'; source?: BackfillSummary['source'];
      scanned: number; added: number; skipped: number }
  | { phase: 'done'; summary: BackfillSummary }
  | { phase: 'error'; message: string; busy?: boolean; network?: boolean };

/** Runs one page backfill and folds the NDJSON event stream into UI state. */
export function useBackfill(pageId: string, onFinished: () => void) {
  const [state, setState] = useState<BackfillState>({ phase: 'idle' });

  const apply = useCallback((e: BackfillEvent) => {
    setState(prev => {
      const run = prev.phase === 'running' ? prev
        : { phase: 'running' as const, status: 'starting' as const, scanned: 0, added: 0, skipped: 0 };
      switch (e.type) {
        case 'status':   return { ...run, status: e.message, source: e.source };
        case 'progress': return { ...run, scanned: e.scanned, added: e.added, skipped: e.skipped };
        case 'done':     return { phase: 'done', summary: e.summary };
        case 'error':    return { phase: 'error', message: e.message };
        default:         return run;
      }
    });
  }, []);

  const start = useCallback(async () => {
    setState({ phase: 'running', status: 'starting', scanned: 0, added: 0, skipped: 0 });
    let res: Response;
    try {
      res = await fetch(`/api/instagram/pages/${pageId}/backfill`, { method: 'POST' });
    } catch {
      setState({ phase: 'error', message: '', network: true });
      return;
    }
    if (!res.ok || !res.body) {
      setState({ phase: 'error', message: `HTTP ${res.status}`, busy: res.status === 409 });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finished = false;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as BackfillEvent;
          if (event.type === 'done' || event.type === 'error') finished = true;
          apply(event);
        }
      }
    } catch {
      setState({ phase: 'error', message: '', network: true });
      finished = true;
    }
    // Stream closed without a terminal event (function killed / timeout).
    if (!finished) setState({ phase: 'error', message: '', network: true });
    onFinished();
  }, [pageId, apply, onFinished]);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, start, reset };
}
