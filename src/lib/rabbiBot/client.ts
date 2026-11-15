import type { RabbiBotAnswer, RabbiBotEvent, RabbiBotFollowUp } from '@/types/rabbiBot';

// Client-only helpers: open the floating panel from anywhere, the per-device
// memory (welcome accepted, the answer on screen, the last few answers), and
// reading the NDJSON stream.

const OPEN_EVENT = 'orayta:rabbi-bot-open';
const STORAGE_KEY = 'orayta_rabbibot';

export function openRabbiBot(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenRabbiBot(fn: () => void): () => void {
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
}

export interface LastAnswer {
  question: string;
  id: string;
  token: string;
  answer: RabbiBotAnswer;
  rating: number | null;
  reported: boolean;
  /** Asked as a follow-up to this question. */
  followOf?: string;
}

export interface BotLocal {
  welcomed: boolean;
  /** The answer on screen (null = composer). */
  last: LastAnswer | null;
  /** The device's latest answers, newest first. */
  history: LastAnswer[];
  /** Earlier turns of the conversation on screen, oldest first (follow-ups). */
  thread: LastAnswer[];
}

export const HISTORY_MAX = 5;
/** Earlier turns kept above a follow-up. */
export const THREAD_MAX = 4;

/** The question as it stands alone: a follow-up's resolved wording, else what was asked. Pure. */
export const fullQuestion = (a: LastAnswer) => a.answer.standalone || a.question;

/** `item` first, replacing an older copy of the same answer (id) or question, capped. Pure. */
export function withHistory(list: LastAnswer[], item: LastAnswer, max = HISTORY_MAX): LastAnswer[] {
  const same = (x: LastAnswer) => (item.id && x.id === item.id) || fullQuestion(x).trim() === fullQuestion(item).trim();
  return [item, ...list.filter(x => !same(x))].slice(0, max);
}

/** A follow-up makes sense after a real answer or a "not found" (not after a fixed reply). Pure. */
export const canFollowUp = (a: LastAnswer | null) => !!a && (a.answer.status === 'answered' || a.answer.status === 'not_found');

/** The previous turn as sent with a follow-up (its refs = the Sefaria sources it cited). Pure. */
export function followUpFrom(a: LastAnswer): RabbiBotFollowUp {
  return {
    question: fullQuestion(a),
    understood: a.answer.understood ?? '',
    short: a.answer.short,
    refs: Array.from(new Set(a.answer.sources.map(s => s.ref).filter((r): r is string => !!r))).slice(0, 4),
  };
}

export function readBotLocal(): BotLocal {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<BotLocal> | null;
    const ok = (h: LastAnswer | null | undefined): h is LastAnswer => !!h && typeof h.question === 'string' && !!h.answer;
    const history = Array.isArray(v?.history) ? v.history.filter(ok) : [];
    const thread = Array.isArray(v?.thread) ? v.thread.filter(ok) : [];
    return { welcomed: v?.welcomed === true, last: v?.last ?? null, history: history.slice(0, HISTORY_MAX), thread: thread.slice(-THREAD_MAX) };
  } catch {
    return { welcomed: false, last: null, history: [], thread: [] };
  }
}

export function writeBotLocal(patch: Partial<BotLocal>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readBotLocal(), ...patch }));
  } catch { /* storage blocked — the session still works */ }
}

/** POSTs the question (with the previous turn, for a follow-up) and feeds each streamed event to `onEvent`. */
export async function streamAsk(
  question: string, onEvent: (e: RabbiBotEvent) => void, website = '', followUp: RabbiBotFollowUp | null = null,
): Promise<void> {
  const res = await fetch('/api/rabbi-bot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(followUp ? { question, website, followUp } : { question, website }),
  });
  if (!res.body) {
    onEvent({ type: 'error', error: 'unavailable' });
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let ended = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buf += decoder.decode(value, { stream: !done });
    let nl = buf.indexOf('\n');
    while (nl >= 0 || (done && buf.trim())) {
      const line = nl >= 0 ? buf.slice(0, nl) : buf;
      buf = nl >= 0 ? buf.slice(nl + 1) : '';
      if (line.trim()) {
        try {
          const e = JSON.parse(line) as RabbiBotEvent;
          if (e.type !== 'step') ended = true;
          onEvent(e);
        } catch { /* partial or foreign line */ }
      }
      nl = buf.indexOf('\n');
    }
    if (done) break;
  }
  if (!ended) onEvent({ type: 'error', error: 'unavailable' });
}

export async function sendFeedback(body: { id: string; token: string; rating?: number; report?: boolean; note?: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/rabbi-bot/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
