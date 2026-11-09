import { WHISPER_PROMPT, cleanTranscript } from './transcript';

// Server-only: speech-to-text with Groq's Whisper (the same GROQ_API_KEY, free
// tier: ~2,000 requests and hours of audio a day). large-v3 spells Hebrew best;
// the turbo model takes over when it is rate-limited or down. Audio is
// forwarded and never stored.
const API = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODELS = ['whisper-large-v3', 'whisper-large-v3-turbo'];
const TIMEOUT_MS = 20_000;

export type TranscribeResult = { ok: true; text: string } | { ok: false; error: 'unavailable' | 'busy' };

export async function transcribe(audio: Blob, ext: string): Promise<TranscribeResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, error: 'unavailable' };
  let busy = false;
  for (const model of MODELS) {
    const form = new FormData();
    form.append('file', audio, `question.${ext}`);
    form.append('model', model);
    form.append('language', 'he');
    form.append('temperature', '0');
    form.append('response_format', 'json');
    form.append('prompt', WHISPER_PROMPT);
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
        signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store',
      });
      if (res.ok) {
        const body = await res.json() as { text?: string };
        return { ok: true, text: cleanTranscript(body.text ?? '') };
      }
      busy ||= res.status === 429;
      console.error('[rabbi-bot] whisper', model, res.status);
    } catch (e) {
      console.error('[rabbi-bot] whisper', model, e);
    }
  }
  return { ok: false, error: busy ? 'busy' : 'unavailable' };
}
