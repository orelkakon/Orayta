'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { COMMENT_NAME_MAX, COMMENT_TEXT_MAX, COMMENT_TEXT_MIN, normalizeCommentText } from '@/lib/feedComments';
import { LineIcon } from '@/components/common/LineIcons';
import { haptics } from '@/lib/haptics';
import { loadCommentName, saveCommentName } from './commentStorage';

const Wrap = styled.form`
  flex-shrink: 0; display: flex; flex-direction: column; gap: 8px;
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255,255,255,0.08); background: rgba(10,8,18,0.96);
`;

// 16px font everywhere — anything smaller makes iOS zoom the page on focus.
const field = `
  width: 100%; box-sizing: border-box; appearance: none; outline: none;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  color: #FFF9EC; font-family: inherit; font-size: 16px;
  transition: border-color 0.15s, background 0.15s;
  &::placeholder { color: rgba(255,255,255,0.36); }
  &:focus { border-color: rgba(232,203,118,0.55); background: rgba(255,255,255,0.08); }
`;

const NameInput = styled.input`${field} border-radius: 12px; padding: 8px 12px;`;

const Row = styled.div`display: flex; align-items: flex-end; gap: 8px;`;

const TextArea = styled.textarea`
  ${field} flex: 1; resize: none; border-radius: 20px; padding: 10px 14px;
  line-height: 1.45; min-height: 44px; max-height: 128px;
`;

const SendBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #ffd950, #f0a818); color: #241a00;
  box-shadow: 0 4px 16px rgba(255,190,0,0.25);
  transition: transform 0.12s, opacity 0.15s, filter 0.15s;
  /* The send glyph points right; in RTL "forward" is to the left. */
  svg { transform: scaleX(-1); }
  &:active:not(:disabled) { transform: scale(0.9); }
  &:disabled { opacity: 0.35; cursor: default; filter: grayscale(0.6); box-shadow: none; }
`;

const Meta = styled.div`display: flex; justify-content: space-between; gap: 10px; min-height: 16px; font-size: 0.72rem;`;
const ErrorText = styled.span`color: rgba(255,150,140,0.95); font-weight: 700;`;
const Note = styled.span`color: rgba(255,255,255,0.32);`;
const Counter = styled.span<{ $warn: boolean }>`color: ${p => p.$warn ? 'rgba(255,170,120,0.95)' : 'rgba(255,255,255,0.32)'}; flex-shrink: 0;`;

// Off-screen honeypot — bots fill every field, people never see this one.
const Trap = styled.input`position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; left: -9999px;`;

interface Props {
  onSubmit: (name: string, text: string, website: string) => Promise<string | null>;
}

export default function CommentComposer({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setName(loadCommentName()); }, []);

  // Auto-grow up to max-height, then scroll inside.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const len = normalizeCommentText(text).length;
  const canSend = !sending && len >= COMMENT_TEXT_MIN && len <= COMMENT_TEXT_MAX;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError(null);
    const err = await onSubmit(name, text, website);
    setSending(false);
    if (err) { setError(err); haptics.error(); return; }
    saveCommentName(name.trim());
    setText('');
    haptics.success();
  }

  return (
    <Wrap onSubmit={submit} onClick={e => e.stopPropagation()}>
      <NameInput
        value={name} onChange={e => setName(e.target.value)} maxLength={COMMENT_NAME_MAX}
        placeholder={HE.COMMENTS_NAME_PLACEHOLDER} aria-label={HE.COMMENTS_NAME_PLACEHOLDER}
        autoComplete="nickname" enterKeyHint="next"
      />
      <Trap tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={e => setWebsite(e.target.value)} name="website" />
      <Row>
        <TextArea
          ref={areaRef} rows={1} value={text}
          onChange={e => { setText(e.target.value); if (error) setError(null); }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit(); }}
          maxLength={COMMENT_TEXT_MAX + 50}
          placeholder={HE.COMMENTS_TEXT_PLACEHOLDER} aria-label={HE.COMMENTS_TEXT_PLACEHOLDER}
        />
        <SendBtn type="submit" disabled={!canSend} aria-label={HE.COMMENTS_SEND} title={HE.COMMENTS_SEND}>
          <LineIcon name="send" size={19} strokeWidth={2.1} />
        </SendBtn>
      </Row>
      <Meta aria-live="polite">
        {error ? <ErrorText>{error}</ErrorText> : <Note>{HE.COMMENTS_NOTE}</Note>}
        {len > COMMENT_TEXT_MAX * 0.8 && <Counter $warn={len > COMMENT_TEXT_MAX}>{len}/{COMMENT_TEXT_MAX}</Counter>}
      </Meta>
    </Wrap>
  );
}
