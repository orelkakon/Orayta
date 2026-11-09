'use client';

import { useCallback, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import { useRecorder } from './useRecorder';

/**
 * Speak → text: records, sends the audio to /api/rabbi-bot/transcribe and
 * hands the transcript to `onText` (the composer, for a look before sending).
 * `note` is the line under the composer: the review hint or what went wrong.
 */
export type VoicePhase = 'idle' | 'starting' | 'recording' | 'transcribing';
export interface VoiceNote { text: string; error: boolean }

const ERRORS: Record<string, string> = {
  empty: HE.RB_MIC_EMPTY, rate_limited: HE.RB_MIC_LIMIT,
};

async function transcribe(audio: Blob): Promise<{ text?: string; error?: string }> {
  try {
    const res = await fetch('/api/rabbi-bot/transcribe', { method: 'POST', headers: { 'Content-Type': audio.type }, body: audio });
    return await res.json() as { text?: string; error?: string };
  } catch {
    return { error: 'network' };
  }
}

export function useVoiceQuestion(onText: (text: string) => void) {
  const [transcribing, setTranscribing] = useState(false);
  const [note, setNote] = useState<VoiceNote | null>(null);

  const onAudio = useCallback(async (audio: Blob | null) => {
    if (!audio) { setNote({ text: HE.RB_MIC_EMPTY, error: true }); return; }
    setTranscribing(true);
    const r = await transcribe(audio);
    setTranscribing(false);
    if (r.text) {
      haptics.success();
      onText(r.text);
      setNote({ text: HE.RB_MIC_REVIEW, error: false });
    } else {
      haptics.error();
      setNote({ text: ERRORS[r.error ?? ''] ?? HE.RB_MIC_FAILED, error: true });
    }
  }, [onText]);

  const rec = useRecorder(audio => { void onAudio(audio); });
  const recNote: VoiceNote | null = rec.state === 'denied' ? { text: HE.RB_MIC_DENIED, error: true }
    : rec.state === 'error' ? { text: HE.RB_MIC_ERROR, error: true } : null;

  const start = useCallback(() => {
    setNote(null);
    haptics.tap();
    // Unlocks speech synthesis inside this tap, so the answer can be read aloud when it arrives (iOS).
    try { window.speechSynthesis?.speak(new SpeechSynthesisUtterance('')); } catch {}
    void rec.start();
  }, [rec]);

  const phase: VoicePhase = transcribing ? 'transcribing'
    : rec.state === 'recording' ? 'recording' : rec.state === 'starting' ? 'starting' : 'idle';
  return {
    phase, seconds: rec.seconds, levelRef: rec.levelRef, note: recNote ?? note,
    start, stop: () => { haptics.tap(); rec.stop(); }, cancel: () => { rec.cancel(); setNote(null); }, clearNote: () => setNote(null),
  };
}
