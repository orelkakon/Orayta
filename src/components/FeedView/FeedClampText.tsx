'use client';

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { theme } from '@/lib/theme';
import { FEED_GOLD } from './feedTypes';

/* Length-aware type register: a 10-word aphorism earns display type; a long
   sugya settles into a quieter reading size. One size for both flattens the
   feed's rhythm. */
const sizeFor = (len?: number) =>
  len !== undefined && len < 70 ? 'clamp(1.7rem, 6vw, 2.15rem)'
  : len !== undefined && len < 150 ? 'clamp(1.45rem, 5.2vw, 1.8rem)'
  : 'clamp(1.28rem, 4.6vw, 1.62rem)';

const lineFor = (len?: number) =>
  len !== undefined && len < 70 ? 1.65
  : len !== undefined && len < 150 ? 1.75
  : 1.85;

export const MainText = styled.p<{ $len?: number }>`
  color: rgba(255,251,240,0.97); font-family: var(--font-frank, serif);
  font-size: ${p => sizeFor(p.$len)};
  line-height: ${p => lineFor(p.$len)};
  font-weight: ${p => (p.$len !== undefined && p.$len < 70 ? 600 : 500)};
  /* Clears the 46px action rail (right edge) symmetrically — text must never
     run underneath the buttons. Long texts clamp into the fullscreen reader. */
  max-width: min(calc(100vw - 132px), 34rem);
  letter-spacing: 0.005em;
  text-shadow: 0 2px 30px rgba(0,0,0,0.55);
  text-wrap: pretty;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

const ClickableText = styled(MainText)`cursor: pointer;`;

/* Written in light: when the slide arrives, its words surface one after
   another in the post's accent colour and settle into parchment white — a
   scribe's line, not a fade. Leaving resets them at once, so they rewrite
   on every return. Outside a feed slide (no data-v) they simply show. */
const Word = styled.span`
  display: inline-block;
  [data-v='0'] & {
    opacity: 0; transform: translate3d(0, 0.45em, 0);
    color: rgb(var(--accent, ${FEED_GOLD}));
  }
  [data-v='1'] & {
    transition: opacity 0.5s ${theme.motion.out} var(--d),
                transform 0.7s ${theme.motion.out} var(--d),
                color 1.3s ease var(--d);
  }
`;

/** Only the words that can show inside the clamp get their own span. */
const INK_WORDS = 90;

function inkWords(text: string): React.ReactNode {
  const parts = text.split(/(\s+)/);
  const head: React.ReactNode[] = [];
  let n = 0, i = 0;
  for (; i < parts.length && n < INK_WORDS; i++) {
    const p = parts[i];
    if (!p) continue;
    if (/^\s+$/.test(p)) { head.push(' '); continue; }
    head.push(<Word key={i} style={{ '--d': `${160 + Math.min(n, 42) * 26}ms` } as CSSProperties}>{p}</Word>);
    n++;
  }
  return <>{head}{parts.slice(i).join('')}</>;
}

const ReadMoreBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none;
  background: transparent; backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.24); border-radius: 999px;
  padding: 7px 19px; color: rgba(255,252,242,0.88);
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4); }
  &::after { content: ' ⌄'; opacity: 0.7; }
`;

interface Props {
  text: string;
  onExpand: () => void;
}

// Clamped feed text: when the text overflows its 7-line clamp it becomes
// clickable and shows a "read more" affordance that opens the full-text reader.
export default function ClampText({ text, onExpand }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  const words = useMemo(() => inkWords(text), [text]);

  useEffect(() => {
    const el = ref.current;
    if (el) setTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  if (!truncated) return <MainText ref={ref} $len={text.length}>{words}</MainText>;

  const expand = (e: React.MouseEvent) => { e.stopPropagation(); onExpand(); };
  return (
    <>
      <ClickableText ref={ref} $len={text.length} onClick={expand}>{words}</ClickableText>
      <ReadMoreBtn onClick={expand}>{HE.FEED_READ_MORE}</ReadMoreBtn>
    </>
  );
}
