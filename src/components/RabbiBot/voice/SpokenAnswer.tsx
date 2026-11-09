'use client';

import { useMemo } from 'react';
import type { RabbiBotAnswer } from '@/types/rabbiBot';
import { answerSpeech } from '@/lib/rabbiBot/voice/speech';
import AnswerView from '../AnswerView';
import ListenBar from './ListenBar';
import { useSpeech } from './useSpeech';

/** The answer with its read-aloud bar; the point being read is highlighted. */
export default function SpokenAnswer({ answer, idPrefix, autoPlay }: { answer: RabbiBotAnswer; idPrefix: string; autoPlay: boolean }) {
  const chunks = useMemo(() => answerSpeech(answer), [answer]);
  const speech = useSpeech(chunks);
  const active = speech.status !== 'idle' ? chunks[speech.index]?.point : undefined;
  return (
    <>
      <ListenBar speech={speech} autoPlay={autoPlay} />
      <AnswerView answer={answer} idPrefix={idPrefix} activePoint={active} />
    </>
  );
}
