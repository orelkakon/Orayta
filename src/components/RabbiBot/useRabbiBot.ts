'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RabbiBotAnswer, RabbiBotError, RabbiBotFollowUp, RabbiBotStep } from '@/types/rabbiBot';
import {
  readBotLocal, writeBotLocal, streamAsk, sendFeedback, withHistory, followUpFrom, fullQuestion, LastAnswer, THREAD_MAX,
} from '@/lib/rabbiBot/client';

export type BotPhase = 'idle' | 'asking' | 'done' | 'error';

export interface BotState {
  phase: BotPhase;
  welcomed: boolean;
  question: string;
  steps: { step: RabbiBotStep; count?: number; books?: string[] }[];
  /** The verified points so far while the answer is still being written. */
  partial: RabbiBotAnswer | null;
  last: LastAnswer | null;
  history: LastAnswer[];
  /** Earlier turns above the current one (follow-ups), oldest first. */
  thread: LastAnswer[];
  /** The previous turn the question on screen follows up on (kept for a retry). */
  followUp: { context: RabbiBotFollowUp; of: string } | null;
  error: RabbiBotError | null;
  resetAt: string | null;
}

const INITIAL: BotState = {
  phase: 'idle', welcomed: true, question: '', steps: [], partial: null, last: null, history: [], thread: [], followUp: null, error: null, resetAt: null,
};

/**
 * State machine for one asker: welcome → ask (streamed steps) → answer →
 * rate/report → follow-up (the answer moves up into the thread and the next
 * question carries it as context); earlier answers reopen from history.
 */
export function useRabbiBot() {
  const [s, setS] = useState<BotState>(INITIAL);
  const busy = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const local = readBotLocal();
    setLoaded(true);
    setS(prev => ({
      ...prev, welcomed: local.welcomed, last: local.last, history: local.history, thread: local.last ? local.thread : [],
      phase: local.last ? 'done' : 'idle', question: local.last?.question ?? '',
    }));
  }, []);

  const acceptWelcome = useCallback(() => {
    writeBotLocal({ welcomed: true });
    setS(prev => ({ ...prev, welcomed: true }));
  }, []);

  const ask = useCallback(async (question: string, website = '', followUp: BotState['followUp'] = null) => {
    if (busy.current) return;
    busy.current = true;
    setS(prev => ({ ...prev, phase: 'asking', question, followUp, steps: [], partial: null, error: null, resetAt: null }));
    try {
      await streamAsk(question, e => {
        if (e.type === 'step') {
          setS(prev => ({ ...prev, steps: [...prev.steps.filter(x => x.step !== e.step), { step: e.step, count: e.count, books: e.books }] }));
        } else if (e.type === 'partial') {
          setS(prev => ({ ...prev, partial: e.answer }));
        } else if (e.type === 'done') {
          const last: LastAnswer = {
            question, id: e.id, token: e.token, answer: e.answer, rating: null, reported: false,
            ...(followUp ? { followOf: followUp.of } : {}),
          };
          const local = readBotLocal();
          const history = withHistory(local.history, last);
          writeBotLocal({ last, history, thread: followUp ? local.thread : [] });
          setS(prev => ({ ...prev, phase: 'done', partial: null, last, history }));
        } else {
          setS(prev => ({ ...prev, phase: 'error', partial: null, error: e.error, resetAt: e.resetAt ?? null }));
        }
      }, website, followUp?.context ?? null);
    } catch {
      setS(prev => ({ ...prev, phase: 'error', error: 'unavailable' }));
    } finally {
      busy.current = false;
    }
  }, []);

  /** Asks about the answer on screen: it moves up into the thread and goes along as context. */
  const followUp = useCallback((question: string, website = '') => {
    const last = readBotLocal().last;
    if (!last || busy.current) return;
    const thread = [...readBotLocal().thread, last].slice(-THREAD_MAX);
    writeBotLocal({ thread });
    setS(prev => ({ ...prev, thread }));
    void ask(question, website, { context: followUpFrom(last), of: fullQuestion(last) });
  }, [ask]);

  const reset = useCallback(() => {
    writeBotLocal({ last: null, thread: [] });
    setS(prev => ({ ...prev, phase: 'idle', question: '', steps: [], last: null, thread: [], followUp: null, error: null }));
  }, []);

  /** Shows an earlier answer from this device's history (no new request), as a question of its own. */
  const reopen = useCallback((item: LastAnswer) => {
    if (busy.current) return;
    writeBotLocal({ last: item, thread: [] });
    setS(prev => ({ ...prev, phase: 'done', question: fullQuestion(item), steps: [], last: item, thread: [], followUp: null, error: null }));
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

  return { state: s, loaded, acceptWelcome, ask, followUp, reset, reopen, clearHistory, feedback };
}
