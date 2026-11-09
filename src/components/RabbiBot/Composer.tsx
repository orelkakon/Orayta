'use client';

import { useCallback, useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { QUESTION_MAX, validateQuestion } from '@/lib/rabbiBot/rules';
import { Disclaimer } from './styles';
import { canRecord } from './voice/useRecorder';
import { useVoiceQuestion } from './voice/useVoiceQuestion';
import VoiceBar from './voice/VoiceBar';
import { Action, Box, Counter, Form, Honeypot, Input, Meta, VoiceNote } from './composerStyles';

interface Props {
  disabled: boolean;
  initial?: string;
  /** `voice`: the question was spoken — the answer is then read aloud. */
  onAsk: (question: string, website: string, voice: boolean) => void;
}

/**
 * The question box. Empty, its round button is a microphone (speak → the
 * transcript lands here for a look → send); with text it becomes "send".
 */
export default function Composer({ disabled, initial = '', onAsk }: Props) {
  const [text, setText] = useState(initial);
  const [website, setWebsite] = useState('');
  const [spoken, setSpoken] = useState(false);
  const [mic, setMic] = useState(false);
  const valid = validateQuestion(text).ok;

  useEffect(() => { setMic(canRecord()); }, []);

  const onText = useCallback((t: string) => {
    setText(prev => (prev.trim() ? `${prev.trim()} ${t}` : t).slice(0, QUESTION_MAX));
    // Not focused: on a phone the keyboard would cover the text the asker should read.
    setSpoken(true);
  }, []);
  const voice = useVoiceQuestion(onText);
  const live = voice.phase !== 'idle';

  const submit = () => {
    const v = validateQuestion(text);
    if (v.ok && !disabled) onAsk(v.text, website, spoken);
  };

  const showMic = mic && !text.trim() && !live;
  return (
    <Form onSubmit={e => { e.preventDefault(); submit(); }}>
      <Box $live={live}>
        {live ? (
          <>
            <VoiceBar phase={voice.phase} seconds={voice.seconds} levelRef={voice.levelRef} />
            {voice.phase !== 'transcribing' && (
              <>
                <Action type="button" $quiet onClick={voice.cancel} aria-label={HE.RB_MIC_CANCEL}><LineIcon name="close" size={18} strokeWidth={2} /></Action>
                <Action type="button" onClick={voice.stop} disabled={voice.phase !== 'recording'} aria-label={HE.RB_MIC_STOP}><LineIcon name="check" size={20} strokeWidth={2.4} /></Action>
              </>
            )}
          </>
        ) : (
          <>
            <Input
              value={text}
              maxLength={QUESTION_MAX + 20}
              rows={2}
              placeholder={HE.RB_PLACEHOLDER}
              aria-label={HE.RB_INPUT_LABEL}
              enterKeyHint="send"
              onChange={e => { setText(e.target.value); if (!e.target.value.trim()) setSpoken(false); voice.clearNote(); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            />
            {showMic ? (
              <Action type="button" onClick={voice.start} disabled={disabled} aria-label={HE.RB_MIC} title={HE.RB_MIC}>
                <LineIcon name="mic" size={20} strokeWidth={2} />
              </Action>
            ) : (
              <Action type="submit" $send $glow={spoken && valid} disabled={disabled || !valid} aria-label={HE.RB_SEND}>
                <LineIcon name="send" size={19} strokeWidth={2} />
              </Action>
            )}
          </>
        )}
      </Box>
      {voice.note && <VoiceNote $error={voice.note.error} role={voice.note.error ? 'alert' : 'status'}>{voice.note.text}</VoiceNote>}
      <Honeypot tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      <Meta>
        <Disclaimer>{HE.RB_DISCLAIMER}</Disclaimer>
        <Counter $over={text.length > QUESTION_MAX}>{HE.RB_COUNTER(text.length, QUESTION_MAX)}</Counter>
      </Meta>
    </Form>
  );
}
