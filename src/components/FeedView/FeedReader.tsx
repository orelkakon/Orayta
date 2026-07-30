'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 950;
  background: rgba(5,4,10,0.98); backdrop-filter: blur(10px);
  display: flex; flex-direction: column;
`;

const Halo = styled.div<{ $accent: string }>`
  position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
  width: 130vw; max-width: 860px; height: 50vh; pointer-events: none;
  background: radial-gradient(ellipse at 50% 40%, rgba(${p => p.$accent}, 0.1) 0%, transparent 62%);
`;

const Head = styled.div`
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.07); position: relative;
`;

const HeadBadge = styled.div<{ $accent: string }>`
  display: flex; align-items: center; gap: 7px;
  background: rgba(${p => p.$accent}, 0.08); border: 1px solid rgba(${p => p.$accent}, 0.3);
  border-radius: 999px; padding: 6px 14px;
  color: rgba(${p => p.$accent}, 0.95);
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em;
`;

const CloseBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 999px; padding: 8px 16px;
  color: rgba(255,252,244,0.9); font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.16); }
`;

const Body = styled.div`
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 30px 22px 36px; position: relative;
`;

const BigTitle = styled.div`
  color: #FFFDF6; font-family: var(--font-frank, serif);
  font-size: 1.45rem; font-weight: 800; text-align: center; margin-bottom: 14px;
`;

const Orn = styled.div<{ $accent: string }>`
  display: flex; align-items: center; justify-content: center; gap: 10px;
  color: rgba(${p => p.$accent}, 0.6); font-size: 0.55rem; line-height: 1;
  margin: 0 auto 22px;
  &::before, &::after {
    content: ''; width: 52px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(${p => p.$accent}, 0.5));
  }
  &::after { background: linear-gradient(270deg, transparent, rgba(${p => p.$accent}, 0.5)); }
`;

const FullText = styled.p`
  color: rgba(255,251,240,0.94); font-family: var(--font-frank, serif);
  font-size: 1.28rem; line-height: 2.05; white-space: pre-wrap;
  text-wrap: pretty;
  max-width: 620px; margin: 0 auto;
`;

const Footer = styled.div`
  flex-shrink: 0; display: flex; justify-content: center; gap: 10px;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255,255,255,0.07);
`;

const btnBase = `
  border-radius: 999px; padding: 12px 24px;
  font-size: 0.9rem; font-weight: 800; cursor: pointer;
  transition: transform 0.12s, background 0.15s;
  &:active { transform: scale(0.97); }
`;

const BackFooterBtn = styled.button`
  ${btnBase}
  -webkit-tap-highlight-color: transparent; appearance: none;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,252,244,0.9);
  &:hover { background: rgba(255,255,255,0.16); }
`;

const SourceLink = styled(Link)`
  ${btnBase}
  background: linear-gradient(135deg, #ffd950, #f0a818); color: #241a00;
  box-shadow: 0 4px 18px rgba(255,190,0,0.22);
`;

export interface ReaderData {
  icon: string;
  label: string;
  accent: string;
  title?: string;
  text: string;
  href?: string;
}

interface Props {
  data: ReaderData;
  onClose: () => void;
}

// Full-screen in-feed reader for long texts, with a deep link to the source page
export default function FeedReader({ data, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Overlay onClick={e => e.stopPropagation()}>
      <Halo $accent={data.accent} />
      <Head>
        <CloseBtn onClick={onClose}>← {HE.FEED_READER_CLOSE}</CloseBtn>
        <HeadBadge $accent={data.accent}>
          <LineIcon name={data.icon} size={13} strokeWidth={1.8} />
          {data.label}
        </HeadBadge>
      </Head>
      <Body>
        {data.title && <BigTitle>{data.title}</BigTitle>}
        <Orn $accent={data.accent}>✦</Orn>
        <FullText>{data.text}</FullText>
      </Body>
      <Footer>
        <BackFooterBtn onClick={onClose}>{HE.FEED_READER_CLOSE}</BackFooterBtn>
        {data.href && <SourceLink href={data.href}>{HE.FEED_READER_SOURCE} ↗</SourceLink>}
      </Footer>
    </Overlay>
  );
}
