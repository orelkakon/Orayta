'use client';

import { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from './LineIcons';

/** `emoji` — the original quiet speaker glyph; `icon` — a round button that matches card actions. */
type Variant = 'emoji' | 'icon';

const Btn = styled.button<{ $active: boolean; $v: Variant }>`
  line-height: 1;
  ${({ $v, $active }) => ($v === 'emoji' ? css`
    font-size: 1rem;
    opacity: ${$active ? 1 : 0.45};
    transition: opacity 0.15s;
    &:hover { opacity: 1; }
  ` : css`
    width: 34px; height: 34px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 999px;
    border: 1px solid ${$active ? theme.colors.primaryLight : theme.colors.border};
    background: ${$active ? theme.colors.surfaceAlt : 'transparent'};
    color: ${$active ? theme.colors.primary : theme.colors.textMuted};
    transition: background ${theme.motion.fast}, color ${theme.motion.fast}, border-color ${theme.motion.fast};
    &:hover { color: ${theme.colors.primary}; border-color: ${theme.colors.primaryLight}; }
    &:focus-visible { outline: 2px solid ${theme.colors.primaryLight}; outline-offset: 2px; }
  `)}
`;

export default function SpeakButton({ text, variant = 'emoji' }: { text: string; variant?: Variant }) {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (active) {
      window.speechSynthesis.cancel();
      setActive(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'he-IL';
    utt.rate = 0.85;
    utt.onend = () => setActive(false);
    utt.onerror = () => setActive(false);
    window.speechSynthesis.speak(utt);
    setActive(true);
  }, [text, active, supported]);

  if (!supported) return null;
  const label = active ? HE.SPEAK_STOP : HE.SPEAK_PLAY;

  return (
    <Btn type="button" $v={variant} $active={active} onClick={toggle} title={label} aria-label={label} aria-pressed={active}>
      {variant === 'icon'
        ? <LineIcon name={active ? 'stop' : 'volume'} size={16} strokeWidth={1.8} />
        : (active ? '🔊' : '🔈')}
    </Btn>
  );
}
