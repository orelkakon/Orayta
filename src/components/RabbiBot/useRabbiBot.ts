'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RabbiBotError, RabbiBotStep } from '@/types/rabbiBot';
import { readBotLocal, writeBotLocal, streamAsk, sendFeedback, LastAnswer } from '@/lib/rabbiBot/client';

export type BotPhase = 'idle' | 'asking' | 'done' | 'error';

export interface BotState {
  phase: BotPhase;
  welcomed: boolean;
  question: string;
  steps: { step: RabbiBotStep; count?: number; books?: string[] }[];
  last: LastAnswer | null;
  error: RabbiBotError | null;
  resetAt: string | null;
}

const INITIAL: BotState = { phase: 'idle', welcomed: true, question: '', steps: [], last: null, error: null, resetAt: null };

/** State machine for one asker: welcome → ask (streamed steps) → answer → rate/report. */
export function useRabbiBot() {
  const [s, setS] = useState<BotState>(INITIAL);
  const busy = useRef(false);

  useEffect(() => {
    const local = readBotLocal();
    setS(prev => ({ ...prev, welcomed: local.welcomed, last: local.last, phase: local.last ? 'done' : 'idle', question: local.last?.question ?? '' }));
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
          writeBotLocal({ last });
          setS(prev => ({ ...prev, phase: 'done', last }));
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

  const feedback = useCallback(async (data: { rating?: number; report?: boolean; note?: string }) => {
    const last = readBotLocal().last;
    if (!last) return false;
    const ok = await sendFeedback({ id: last.id, token: last.token, ...data });
    if (ok) {
      const next: LastAnswer = { ...last, rating: data.rating ?? last.rating, reported: last.reported || Boolean(data.report) };
      writeBotLocal({ last: next });
      setS(prev => ({ ...prev, last: next }));
    }
    return ok;
  }, []);

  return { state: s, acceptWelcome, ask, reset, feedback };
}
