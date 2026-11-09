'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RECORD_MAX_SEC } from '@/lib/rabbiBot/voice/transcript';

/**
 * Records one spoken question with MediaRecorder (works in the iOS home-screen
 * app too). A live level (0–1) drives the meter; recording stops by itself
 * after a pause once speech was heard, or at the length cap. `stop` hands the
 * audio to `onAudio` (null when too short to hold a question); `cancel`
 * throws it away. The AudioContext is created inside the tap — iOS keeps one
 * made after an await suspended, and the meter would stay flat.
 */
export type RecorderState = 'idle' | 'starting' | 'recording' | 'denied' | 'error';

const SPEECH_LEVEL = 0.06;
const SILENCE_MS = 1800;
const MIN_MS = 700;
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];

export const canRecord = () =>
  typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

export function useRecorder(onAudio: (audio: Blob | null) => void) {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const levelRef = useRef(0);
  const live = useRef<{ rec: MediaRecorder; stream: MediaStream; ctx: AudioContext; raf: number; keep: boolean } | null>(null);
  const onAudioRef = useRef(onAudio);
  onAudioRef.current = onAudio;
  // Set by cancel/unmount while the microphone permission is still pending.
  const abandoned = useRef(false);

  const finish = useCallback((keep: boolean) => {
    const l = live.current;
    if (!l) { abandoned.current = !keep; return; }
    l.keep = keep;
    cancelAnimationFrame(l.raf);
    if (l.rec.state !== 'inactive') l.rec.stop();
    else setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (live.current || !canRecord()) return;
    abandoned.current = false;
    setState('starting');
    setSeconds(0);
    const ctx = new AudioContext();
    void ctx.resume().catch(() => undefined);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      void ctx.close().catch(() => undefined);
      setState((e as Error)?.name === 'NotAllowedError' ? 'denied' : 'error');
      return;
    }
    if (abandoned.current) {
      stream.getTracks().forEach(t => t.stop());
      void ctx.close().catch(() => undefined);
      setState('idle');
      return;
    }
    const mimeType = MIME_TYPES.find(t => MediaRecorder.isTypeSupported?.(t));
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const parts: Blob[] = [];
    const began = performance.now();
    let heard = 0;
    let lastLoud = began;
    const buf = new Uint8Array(analyser.fftSize);

    live.current = { rec, stream, ctx, raf: 0, keep: true };
    rec.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    rec.onstop = () => {
      const l = live.current;
      live.current = null;
      stream.getTracks().forEach(t => t.stop());
      void ctx.close().catch(() => undefined);
      levelRef.current = 0;
      setState('idle');
      if (!l?.keep) return;
      // Kept even when the meter heard nothing (a muted meter must not lose a question) — the server answers "empty".
      const long = performance.now() - began >= MIN_MS;
      onAudioRef.current(long ? new Blob(parts, { type: rec.mimeType || mimeType || 'audio/webm' }) : null);
    };

    const tick = () => {
      const l = live.current;
      if (!l) return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += ((buf[i] - 128) / 128) ** 2;
      const level = Math.min(1, Math.sqrt(sum / buf.length) * 4);
      levelRef.current = level;
      const now = performance.now();
      if (level > SPEECH_LEVEL) { heard += 1; lastLoud = now; }
      setSeconds(Math.floor((now - began) / 1000));
      if ((heard > 8 && now - lastLoud > SILENCE_MS) || now - began > RECORD_MAX_SEC * 1000) { finish(true); return; }
      l.raf = requestAnimationFrame(tick);
    };
    rec.start(250);
    setState('recording');
    live.current.raf = requestAnimationFrame(tick);
  }, [finish]);

  useEffect(() => () => finish(false), [finish]);

  return { state, seconds, levelRef, start, stop: () => finish(true), cancel: () => finish(false), reset: () => setState('idle') };
}
