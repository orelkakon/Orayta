import type { RabbiBotAnswer, RabbiBotEvent } from '@/types/rabbiBot';

// Client-only helpers: open the floating panel from anywhere, the per-device
// memory (welcome accepted, last answer), and reading the NDJSON stream.

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
}

export interface BotLocal {
  welcomed: boolean;
  last: LastAnswer | null;
}

export function readBotLocal(): BotLocal {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<BotLocal> | null;
    return { welcomed: v?.welcomed === true, last: v?.last ?? null };
  } catch {
    return { welcomed: false, last: null };
  }
}

export function writeBotLocal(patch: Partial<BotLocal>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readBotLocal(), ...patch }));
  } catch { /* storage blocked — the session still works */ }
}

/** POSTs the question and feeds each streamed event to `onEvent`. */
export async function streamAsk(question: string, onEvent: (e: RabbiBotEvent) => void, website = ''): Promise<void> {
  const res = await fetch('/api/rabbi-bot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, website }),
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
