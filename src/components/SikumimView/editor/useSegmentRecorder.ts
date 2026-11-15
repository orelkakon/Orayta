'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SEGMENT_MAX_SEC } from '@/lib/sikum/dictation';
import { canRecord } from '@/components/RabbiBot/voice/useRecorder';

/**
 * Continuous dictation: one microphone stream, cut into pieces at natural
 * pauses so each can be transcribed while the writer keeps talking. Each
 * piece is its own MediaRecorder (a fresh file with its own header — chunks
 * of one recording can't be decoded alone), opened when the previous one
 * closes — iOS won't run two recorders on one stream; the cut falls in a
 * pause, so the few milliseconds between them lose nothing. A piece with no speech in it is
 * dropped (Whisper invents text over silence) — unless the level meter is
 * dead (a suspended AudioContext), then pieces are cut by time and all kept.
 * Stops by itself after a long silence. The AudioContext is created inside
 * the tap (iOS).
 */
export type DictationState = 'idle' | 'starting' | 'recording' | 'denied' | 'error';

const SPEECH_LEVEL = 0.06;
const PAUSE_MS = 1100;
const MIN_PIECE_MS = 2500;
const IDLE_STOP_MS = 90_000;
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];

interface Live { stream: MediaStream; ctx: AudioContext; rec: MediaRecorder | null; raf: number; stopping: boolean }

export function useSegmentRecorder(onPiece: (audio: Blob) => void) {
  const [state, setState] = useState<DictationState>('idle');
  const [seconds, setSeconds] = useState(0);
  const levelRef = useRef(0);
  const live = useRef<Live | null>(null);
  const onPieceRef = useRef(onPiece);
  onPieceRef.current = onPiece;

  const stop = useCallback(() => {
    const l = live.current;
    if (!l || l.stopping) return;
    l.stopping = true;
    cancelAnimationFrame(l.raf);
    if (l.rec && l.rec.state !== 'inactive') l.rec.stop();
    else { l.stream.getTracks().forEach(t => t.stop()); void l.ctx.close().catch(() => undefined); live.current = null; setState('idle'); }
  }, []);

  const start = useCallback(async () => {
    if (live.current || !canRecord()) return;
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
    const mimeType = MIME_TYPES.find(t => MediaRecorder.isTypeSupported?.(t));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    const l: Live = { stream, ctx, rec: null, raf: 0, stopping: false };
    live.current = l;
    const began = performance.now();
    let lastLoud = began;
    let meterAlive = false;
    let piece = { began, heard: 0 };

    const openPiece = () => {
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const parts: Blob[] = [];
      const meta = { began: performance.now(), heard: 0 };
      piece = meta;
      rec.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
      rec.onstop = () => {
        if (meta.heard > 6 || !meterAlive) onPieceRef.current(new Blob(parts, { type: rec.mimeType || mimeType || 'audio/webm' }));
        if (!l.stopping) { openPiece(); return; }
        stream.getTracks().forEach(t => t.stop());
        void ctx.close().catch(() => undefined);
        levelRef.current = 0;
        live.current = null;
        setState('idle');
      };
      rec.start(500);
      l.rec = rec;
    };

    const cut = () => { if (l.rec?.state === 'recording') l.rec.stop(); };
    // A call, Siri or leaving the app ends the track — finish cleanly with what was said.
    stream.getAudioTracks().forEach(t => { t.onended = () => stop(); });

    const tick = () => {
      if (l.stopping) return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += ((buf[i] - 128) / 128) ** 2;
      const level = Math.min(1, Math.sqrt(sum / buf.length) * 4);
      levelRef.current = level;
      if (level > 0.004) meterAlive = true;
      const now = performance.now();
      if (level > SPEECH_LEVEL) { piece.heard += 1; lastLoud = now; }
      setSeconds(Math.floor((now - began) / 1000));
      const age = now - piece.began;
      const paused = l.rec?.state === 'recording' && piece.heard > 6 && now - lastLoud > PAUSE_MS && age > MIN_PIECE_MS;
      if (paused || (l.rec?.state === 'recording' && age > SEGMENT_MAX_SEC * 1000)) cut();
      if (now - lastLoud > IDLE_STOP_MS) { stop(); return; }
      l.raf = requestAnimationFrame(tick);
    };
    openPiece();
    setState('recording');
    l.raf = requestAnimationFrame(tick);
  }, [stop]);

  // Leaving the editor ends the recording (the last piece is still sent).
  useEffect(() => () => stop(), [stop]);

  return { state, seconds, levelRef, start, stop, reset: () => setState('idle') };
}
