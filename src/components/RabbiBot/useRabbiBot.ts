'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RabbiBotError, RabbiBotStep } from '@/types/rabbiBot';
import { readBotLocal, writeBotLocal, streamAsk, sendFeedback, withHistory, LastAnswer } from '@/lib/rabbiBot/client';

export type BotPhase = 'idle' | 'asking' | 'done' | 'error';

export interface BotState {
  phase: BotPhase;
  welcomed: boolean;
  question: string;
  steps: { step: RabbiBotStep; count?: number; books?: string[] }[];
  last: LastAnswer | null;
  history: LastAnswer[];
  error: RabbiBotError | null;
  resetAt: string | null;
}

const INITIAL: BotState = { phase: 'idle', welcomed: true, question: '', steps: [], last: null, history: [], error: null, resetAt: null };

/** State machine for one asker: welcome → ask (streamed steps) → answer → rate/report; earlier answers reopen from history. */
export function useRabbiBot() {
  const [s, setS] = useState<BotState>(INITIAL);
  const busy = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const local = readBotLocal();
    setLoaded(true);
    setS(prev => ({
      ...prev, welcomed: local.welcomed, last: local.last, history: local.history,
      phase: local.last ? 'done' : 'idle', question: local.last?.question ?? '',
    }));
  }, []);

  const acceptWelcome = useCallback(() => {
    writeBotLocal({ welcomed: true });
    setS(prev => ({ ...prev, welcomed: true }));
  }, []);

  const ask = useCallback(async (question: string, website = '') => {
    if (busy.current) return;
    busy.current = true;
    setS(prev => ({ ...prev, phase: 'asking', question, steps: [], error: null, resetAt: null }));
    try {
      await streamAsk(question, e => {
        if (e.type === 'step') {
          setS(prev => ({ ...prev, steps: [...prev.steps.filter(x => x.step !== e.step), { step: e.step, count: e.count, books: e.books }] }));
        } else if (e.type === 'done') {
          const last: LastAnswer = { question, id: e.id, token: e.token, answer: e.answer, rating: null, reported: false };
          const history = withHistory(readBotLocal().history, last);
          writeBotLocal({ last, history });
          setS(prev => ({ ...prev, phase: 'done', last, history }));
        } else {
          setS(prev => ({ ...prev, phase: 'error', error: e.error, resetAt: e.resetAt ?? null }));
        }
      }, website);
    } catch {
      setS(prev => ({ ...prev, phase: 'error', error: 'unavailable' }));
    } finally {
      busy.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    writeBotLocal({ last: null });
    setS(prev => ({ ...prev, phase: 'idle', question: '', steps: [], last: null, error: null }));
  }, []);

  /** Shows an earlier answer from this device's history (no new request). */
  const reopen = useCallback((item: LastAnswer) => {
    if (busy.current) return;
    writeBotLocal({ last: item });
    setS(prev => ({ ...prev, phase: 'done', question: item.question, steps: [], last: item, error: null }));
  }, []);

  const clearHistory = useCallback(() => {
    writeBotLocal({ history: [] });
    setS(prev => ({ ...prev, history: [] }));
  }, []);

  const feedback = useCallback(async (data: { rating?: number; report?: boolean; note?: string }) => {
    const last = readBotLocal().last;
    if (!last) return false;
    const ok = await sendFeedback({ id: last.id, token: last.token, ...data });
    if (ok) {
      const next: LastAnswer = { ...last, rating: data.rating ?? last.rating, reported: last.reported || Boolean(data.report) };
      const history = readBotLocal().history.map(h => (h.id === next.id && h.question === next.question ? next : h));
      writeBotLocal({ last: next, history });
      setS(prev => ({ ...prev, last: next, history }));
    }
    return ok;
  }, []);

  return { state: s, loaded, acceptWelcome, ask, reset, reopen, clearHistory, feedback };
}
