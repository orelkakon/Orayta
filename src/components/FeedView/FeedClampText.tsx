'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';

export const MainText = styled.p`
  color: rgba(255,251,240,0.97); font-family: var(--font-frank, serif);
  font-size: clamp(1.28rem, 4.6vw, 1.62rem); line-height: 1.85; font-weight: 500;
  max-width: min(92vw, 34rem); letter-spacing: 0.005em;
  text-shadow: 0 2px 30px rgba(0,0,0,0.55);
  text-wrap: pretty;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

const ClickableText = styled(MainText)`cursor: pointer;`;

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

  useEffect(() => {
    const el = ref.current;
    if (el) setTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  if (!truncated) return <MainText ref={ref}>{text}</MainText>;

  const expand = (e: React.MouseEvent) => { e.stopPropagation(); onExpand(); };
  return (
    <>
      <ClickableText ref={ref} onClick={expand}>{text}</ClickableText>
      <ReadMoreBtn onClick={expand}>{HE.FEED_READ_MORE}</ReadMoreBtn>
    </>
  );
}
