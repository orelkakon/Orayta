'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechChunk } from '@/lib/rabbiBot/voice/speech';

/**
 * Reads a list of short chunks aloud with the device's Hebrew voice, one
 * utterance at a time (long ones get cut off on iOS / Chrome). Pause is a
 * cancel that remembers the chunk — `speechSynthesis.pause` is unreliable on
 * Android. The rate is remembered per device.
 */
export type SpeechStatus = 'idle' | 'playing' | 'paused';
export const RATES = [0.85, 1, 1.2] as const;
const RATE_KEY = 'orayta_tts_rate';

function hebrewVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter(v => /^(he|iw)([-_]|$)/i.test(v.lang));
  return voices.find(v => /enhanced|premium|natural|google/i.test(v.name)) ?? voices[0] ?? null;
}

export function useSpeech(chunks: SpeechChunk[]) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [index, setIndex] = useState(0);
  const [rate, setRateState] = useState<number>(1);
  const pos = useRef(0);
  const run = useRef(0);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    try { const r = Number(localStorage.getItem(RATE_KEY)); if ((RATES as readonly number[]).includes(r)) setRateState(r); } catch {}
    window.speechSynthesis?.getVoices();
    return () => { run.current += 1; window.speechSynthesis?.cancel(); };
  }, []);

  const speakFrom = useCallback((from: number, r: number) => {
    const synth = window.speechSynthesis;
    const id = ++run.current;
    synth.cancel();
    const voice = hebrewVoice();
    const next = (i: number) => {
      if (id !== run.current) return;
      if (i >= chunks.length) { pos.current = 0; setIndex(0); setStatus('idle'); return; }
      pos.current = i;
      setIndex(i);
      const u = new SpeechSynthesisUtterance(chunks[i].text);
      u.lang = 'he-IL';
      if (voice) u.voice = voice;
      u.rate = r;
      u.onend = () => next(i + 1);
      u.onerror = e => { if (e.error !== 'interrupted' && e.error !== 'canceled') next(i + 1); };
      synth.speak(u);
    };
    setStatus('playing');
    next(from);
  }, [chunks]);

  const play = useCallback(() => speakFrom(status === 'paused' ? pos.current : 0, rate), [speakFrom, status, rate]);
  const pause = useCallback(() => { run.current += 1; window.speechSynthesis.cancel(); setStatus('paused'); }, []);
  const stop = useCallback(() => { run.current += 1; window.speechSynthesis.cancel(); pos.current = 0; setIndex(0); setStatus('idle'); }, []);
  const setRate = useCallback((r: number) => {
    setRateState(r);
    try { localStorage.setItem(RATE_KEY, String(r)); } catch {}
    if (status === 'playing') speakFrom(pos.current, r);
  }, [status, speakFrom]);

  return { supported: supported && chunks.length > 0, status, index, total: chunks.length, rate, play, pause, stop, setRate };
}
