'use client';

import { RefObject, useCallback, useState } from 'react';
import { PUNCTUATE_MAX_CHARS } from '@/lib/sikum/punctuate';
import { HE } from '@/lib/hebrewTexts';
import { replaceRange } from './insertText';

/**
 * "סדר פיסוק": sends the selection (or the whole summary) to
 * /api/sikum-entries/punctuate and writes the result back. The server only
 * returns text with the writer's exact words, and one tap on "בטל" restores
 * the text as it was, while nothing else has changed it since.
 */
type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'done'; before: string; after: string } | { kind: 'error'; text: string };

const ERRORS: Record<string, string> = {
  changed: HE.SE_PUNCT_CHANGED, too_long: HE.SE_PUNCT_LONG,
};

export function usePunctuate(textRef: RefObject<HTMLTextAreaElement>, setText: (v: string) => void) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const run = useCallback(async () => {
    const el = textRef.current;
    if (!el || !el.value.trim()) return;
    const selStart = el.selectionStart ?? 0;
    const selEnd = el.selectionEnd ?? 0;
    const hasSel = selEnd - selStart > 20;
    const [start, end] = hasSel ? [selStart, selEnd] : [0, el.value.length];
    const part = el.value.slice(start, end);
    if (part.length > PUNCTUATE_MAX_CHARS) { setStatus({ kind: 'error', text: HE.SE_PUNCT_LONG }); return; }
    setStatus({ kind: 'busy' });
    try {
      const res = await fetch('/api/sikum-entries/punctuate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: part }),
      });
      const body = await res.json().catch(() => ({})) as { text?: string; error?: string };
      if (!res.ok || !body.text) { setStatus({ kind: 'error', text: ERRORS[body.error ?? ''] ?? HE.SE_PUNCT_FAILED }); return; }
      const before = el.value;
      // The text may have been edited while waiting — write back only if this part is unchanged.
      if (before.slice(start, end) !== part) { setStatus({ kind: 'idle' }); return; }
      const lead = part.match(/^\s*/)?.[0] ?? '';
      const trail = part.match(/\s*$/)?.[0] ?? '';
      const next = `${lead}${body.text}${trail}`;
      replaceRange(el, start, end, next, setText);
      setStatus({ kind: 'done', before, after: before.slice(0, start) + next + before.slice(end) });
    } catch {
      setStatus({ kind: 'error', text: HE.SE_PUNCT_FAILED });
    }
  }, [textRef, setText]);

  const undo = useCallback(() => {
    if (status.kind !== 'done') return;
    if (textRef.current?.value === status.after) setText(status.before);
    setStatus({ kind: 'idle' });
  }, [status, textRef, setText]);

  return { status, run, undo, clear: () => setStatus({ kind: 'idle' }) };
}
