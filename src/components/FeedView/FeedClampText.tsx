'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';

export const MainText = styled.p`
  color: rgba(255,255,255,0.95); font-family: var(--font-frank,serif);
  font-size: 1.25rem; line-height: 1.75; max-width: 95%;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

const ClickableText = styled(MainText)`cursor: pointer;`;

const ReadMoreBtn = styled.button`
  background: rgba(255,255,255,0.12); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.28); border-radius: 16px;
  padding: 5px 15px; color: rgba(255,255,255,0.92);
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.22); }
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
