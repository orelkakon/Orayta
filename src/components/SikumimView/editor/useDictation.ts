'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { joinDictation } from '@/lib/sikum/dictation';
import { useWakeLock } from '@/components/Reader/useWakeLock';
import { insertAtCaret } from './insertText';
import { useSegmentRecorder } from './useSegmentRecorder';

/**
 * Speak a summary: pieces from useSegmentRecorder are transcribed one after
 * another (so they land in the order spoken) and written in at the caret —
 * the writer can move it, or type, between pieces. The screen stays awake
 * while recording (an iPhone that locks stops the microphone). Every piece
 * can be taken back with `undoLast` (shake-to-undo is no way to fix a misheard
 * sentence). Failures are counted, never lost silently.
 */
export interface DictationContext { book: string; title: string }
interface Inserted { start: number; text: string }

async function transcribe(audio: Blob, ctx: DictationContext, before: string): Promise<string | null> {
  const q = new URLSearchParams({ book: ctx.book, title: ctx.title, before: before.slice(-300) });
  try {
    const res = await fetch(`/api/sikum-entries/transcribe?${q}`, { method: 'POST', headers: { 'Content-Type': audio.type }, body: audio });
    if (!res.ok) return res.status === 422 ? '' : null;
    return ((await res.json()) as { text?: string }).text ?? '';
  } catch { return null; }
}

export function useDictation(textRef: RefObject<HTMLTextAreaElement>, setText: (v: string) => void, ctx: DictationContext) {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [history, setHistory] = useState<Inserted[]>([]);
  const queue = useRef(Promise.resolve());
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const onPiece = useCallback((audio: Blob) => {
    setPending(n => n + 1);
    queue.current = queue.current.then(async () => {
      const el = textRef.current;
      const before = el ? el.value.slice(0, el.selectionStart ?? el.value.length) : '';
      const raw = await transcribe(audio, ctxRef.current, before);
      const target = textRef.current;
      if (!alive.current) return;
      setPending(n => n - 1);
      if (raw === null) { setFailed(n => n + 1); return; }
      if (!raw || !target) return;
      const atEnd = (target.selectionEnd ?? 0) >= target.value.length;
      const done = insertAtCaret(target, setText, (b, a) => joinDictation(raw, b, a, b.slice(-300)));
      if (!done) return;
      setHistory(h => [...h.slice(-19), done]);
      if (atEnd) requestAnimationFrame(() => target.scrollIntoView({ block: 'end', behavior: 'smooth' }));
    });
  }, [textRef, setText]);

  const rec = useSegmentRecorder(onPiece);
  useWakeLock(rec.state === 'recording');

  /** Removes the last dictated piece if it is still where it was written. */
  const undoLast = useCallback(() => {
    const el = textRef.current;
    const last = history[history.length - 1];
    if (!el || !last) return;
    setHistory(h => h.slice(0, -1));
    const v = el.value;
    if (v.slice(last.start, last.start + last.text.length) !== last.text) return;
    setText(v.slice(0, last.start) + v.slice(last.start + last.text.length));
    requestAnimationFrame(() => { try { el.setSelectionRange(last.start, last.start); } catch {} });
  }, [history, textRef, setText]);

  return {
    state: rec.state, seconds: rec.seconds, levelRef: rec.levelRef,
    recording: rec.state === 'recording' || rec.state === 'starting',
    pending, failed, canUndo: history.length > 0,
    start: () => { setFailed(0); void rec.start(); },
    stop: rec.stop, undoLast, dismiss: () => { setFailed(0); rec.reset(); },
  };
}
