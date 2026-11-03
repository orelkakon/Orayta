'use client';

import { useCallback, useEffect, useState } from 'react';
import { syncThemeColor } from '@/components/common/ThemeContext';

/**
 * Reading preferences shared by the siddur and every prayer/Tanakh reader,
 * remembered per device: text size (the existing `orayta_siddur_font` step),
 * reading mode (regular / sepia / night — applied to the whole page via
 * html[data-reading] while a reader is open) and keep-screen-awake.
 */
export type ReadingMode = 'regular' | 'sepia' | 'night';

const FONT_KEY = 'orayta_siddur_font';
const MODE_KEY = 'orayta_reader_mode';
const AWAKE_KEY = 'orayta_reader_awake';
export const FONT_STEPS = [1, 1.1, 1.22, 1.36, 1.5, 1.7];
const DEFAULT_STEP = 2;

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, v: string) => { try { localStorage.setItem(key, v); } catch {} };

export interface ReaderPrefs {
  step: number;
  scale: number;
  setStep: (step: number) => void;
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  awake: boolean;
  setAwake: (on: boolean) => void;
}

export function useReaderPrefs(): ReaderPrefs {
  const [step, setStepState] = useState(DEFAULT_STEP);
  const [mode, setModeState] = useState<ReadingMode>('regular');
  const [awake, setAwakeState] = useState(true);

  useEffect(() => {
    const saved = Number(read(FONT_KEY));
    if (Number.isInteger(saved) && saved >= 0 && saved < FONT_STEPS.length) setStepState(saved);
    const m = read(MODE_KEY);
    if (m === 'sepia' || m === 'night' || m === 'regular') setModeState(m);
    setAwakeState(read(AWAKE_KEY) !== 'off');
  }, []);

  // The reading mode tints the whole page while the reader is mounted.
  useEffect(() => {
    const el = document.documentElement;
    if (mode === 'regular') el.removeAttribute('data-reading');
    else el.setAttribute('data-reading', mode);
    syncThemeColor();
    return () => { el.removeAttribute('data-reading'); syncThemeColor(); };
  }, [mode]);

  const setStep = useCallback((next: number) => {
    const s = Math.min(FONT_STEPS.length - 1, Math.max(0, next));
    write(FONT_KEY, String(s));
    setStepState(s);
  }, []);
  const setMode = useCallback((m: ReadingMode) => { write(MODE_KEY, m); setModeState(m); }, []);
  const setAwake = useCallback((on: boolean) => { write(AWAKE_KEY, on ? 'on' : 'off'); setAwakeState(on); }, []);

  return { step, scale: FONT_STEPS[step], setStep, mode, setMode, awake, setAwake };
}
