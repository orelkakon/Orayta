'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClipData } from '@/lib/shabbatClip/data';
import type { ClipFile } from '@/lib/shabbatClip/encode';

/**
 * Makes the Shabbat clip once the sheet opens (the drawing code loads only
 * then), into the canvas on screen. A failed video falls back to the still
 * image. The finished file is kept while the hero lives, so reopening the
 * sheet shares at once.
 */
export type ClipPhase = 'idle' | 'making' | 'ready' | 'error';

export function useShabbatClip(open: boolean, canvas: HTMLCanvasElement | null, data: ClipData) {
  const [phase, setPhase] = useState<ClipPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<ClipFile | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const make = useCallback(async () => {
    const el = canvas;
    if (!el || busy.current) return;
    busy.current = true;
    setPhase('making'); setProgress(0);
    try {
      const { renderClip, renderStill } = await import('@/lib/shabbatClip/encode');
      let made: ClipFile | null = null;
      try {
        made = await renderClip(el, dataRef.current, k => { if (alive.current) setProgress(k); }, () => !alive.current);
      } catch {
        made = await renderStill(el, dataRef.current).catch(() => null);
      }
      if (!alive.current) return;
      if (!made) { setPhase('error'); return; }
      setFile(made);
      setUrl(URL.createObjectURL(made.blob));
      setPhase('ready');
    } catch {
      if (alive.current) setPhase('error');
    } finally {
      busy.current = false;
    }
  }, [canvas]);

  useEffect(() => {
    if (open && phase === 'idle') void make();
  }, [open, phase, make]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  return { phase, progress, file, url, retry: () => setPhase('idle') };
}
