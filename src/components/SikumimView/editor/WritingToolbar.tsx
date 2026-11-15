'use client';

import type { MutableRefObject } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { Waveform } from '@/components/RabbiBot/voice/VoiceBar';
import { Bar, Tool, MicTool, Group, Live, LiveText, LiveHint, Clock, Notice, NoticeBtn } from './WritingToolbar.styles';

/**
 * The row above the keyboard (the sheet's footer stays on top of it): the
 * microphone, the Hebrew marks an iPhone keyboard hides behind a long-press,
 * punctuation, and taking back the last dictated piece. While dictating the
 * row becomes the live recording bar. Buttons never take focus from the text
 * (mousedown is cancelled), so the keyboard stays open.
 */
interface Dictation {
  recording: boolean; seconds: number; levelRef: MutableRefObject<number>;
  pending: number; failed: number; canUndo: boolean; denied: boolean; error: boolean;
  start: () => void; stop: () => void; undoLast: () => void; dismiss: () => void;
}
interface Punct { busy: boolean; done: boolean; error: string | null; run: () => void; undo: () => void; clear: () => void }
interface Props { dictation: Dictation; punct: Punct; onSymbol: (s: string) => void; hasText: boolean }

const keepFocus = (e: React.MouseEvent | React.PointerEvent) => e.preventDefault();
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const SYMBOLS: [string, string][] = [['״', HE.SE_INSERT_GERSHAYIM], ['׳', HE.SE_INSERT_GERESH], ['–', HE.SE_INSERT_DASH]];

export default function WritingToolbar({ dictation: d, punct: p, onSymbol, hasText }: Props) {
  const notice = d.denied ? { text: HE.SE_DENIED, act: d.dismiss }
    : d.error ? { text: HE.SE_MIC_ERROR, act: d.dismiss }
    : d.failed ? { text: HE.SE_FAILED(d.failed), act: d.dismiss }
    : p.error ? { text: p.error, act: p.clear }
    : null;

  return (
    <>
      {notice && (
        <Notice role="alert" $error>
          {notice.text}
          <NoticeBtn type="button" onMouseDown={keepFocus} onClick={notice.act} aria-label={HE.CLOSE}>✕</NoticeBtn>
        </Notice>
      )}
      {p.done && !notice && (
        <Notice role="status">
          {HE.SE_PUNCTUATED}
          <NoticeBtn type="button" onMouseDown={keepFocus} onClick={p.undo}>{HE.SE_PUNCT_UNDO}</NoticeBtn>
        </Notice>
      )}
      {d.recording ? (
        <Bar>
          <MicTool type="button" $live onClick={d.stop} aria-label={HE.SE_MIC_STOP}><LineIcon name="stop" size={20} filled /></MicTool>
          <Live role="status" aria-live="polite">
            <LiveText>
              <Waveform levelRef={d.levelRef} />
              <Clock>{clock(d.seconds)}</Clock>
            </LiveText>
            <LiveHint>{d.pending ? HE.SE_TRANSCRIBING(d.pending) : HE.SE_HINT_PAUSE}</LiveHint>
          </Live>
          {d.canUndo && <Tool type="button" onMouseDown={keepFocus} onClick={d.undoLast} aria-label={HE.SE_UNDO_PIECE}>↶</Tool>}
        </Bar>
      ) : (
        <Bar>
          <MicTool type="button" onClick={d.start} aria-label={HE.SE_MIC}>
            <LineIcon name="mic" size={20} strokeWidth={1.9} />
            <span>{d.pending ? HE.SE_WRITING : HE.SE_MIC_SHORT}</span>
          </MicTool>
          <Group>
            {SYMBOLS.map(([s, label]) => (
              <Tool key={s} type="button" onMouseDown={keepFocus} onClick={() => onSymbol(s)} aria-label={label}>{s}</Tool>
            ))}
            {d.canUndo && <Tool type="button" onMouseDown={keepFocus} onClick={d.undoLast} aria-label={HE.SE_UNDO_PIECE}>↶</Tool>}
            <Tool
              type="button" $wide onMouseDown={keepFocus} onClick={p.run}
              disabled={!hasText || p.busy} aria-busy={p.busy} aria-label={HE.SE_PUNCTUATE}
            >
              <LineIcon name="sparkle" size={17} strokeWidth={1.8} />
              <span>{p.busy ? HE.SE_PUNCTUATING : HE.SE_PUNCTUATE_SHORT}</span>
            </Tool>
          </Group>
        </Bar>
      )}
    </>
  );
}
