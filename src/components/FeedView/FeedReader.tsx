'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { HE } from '@/lib/hebrewTexts';

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 950;
  background: rgba(3,2,8,0.94); backdrop-filter: blur(8px);
  display: flex; flex-direction: column;
`;

const Head = styled.div`
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const HeadTitle = styled.div`
  color: white; font-family: var(--font-frank,serif);
  font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
  border-radius: 50%; width: 32px; height: 32px;
  color: rgba(255,255,255,0.85); font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.2); }
`;

const Body = styled.div`
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 26px 20px 32px;
`;

const BigTitle = styled.div`
  color: white; font-family: var(--font-frank,serif);
  font-size: 1.4rem; font-weight: 800; text-align: center; margin-bottom: 16px;
`;

const FullText = styled.p`
  color: rgba(255,255,255,0.93); font-family: var(--font-frank,serif);
  font-size: 1.2rem; line-height: 1.9; white-space: pre-wrap;
  max-width: 640px; margin: 0 auto;
`;

const Footer = styled.div`
  flex-shrink: 0; display: flex; justify-content: center;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255,255,255,0.08);
`;

const SourceLink = styled(Link)`
  background: linear-gradient(135deg, #ffd950, #f0a818); color: #241a00;
  border-radius: 14px; padding: 11px 26px;
  font-size: 0.9rem; font-weight: 800;
  box-shadow: 0 4px 18px rgba(255,190,0,0.22);
  transition: transform 0.12s;
  &:active { transform: scale(0.97); }
`;

export interface ReaderData {
  icon: string;
  label: string;
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
  return (
    <Overlay onClick={e => e.stopPropagation()}>
      <Head>
        <CloseBtn onClick={onClose}>✕</CloseBtn>
        <HeadTitle>{data.icon} {data.label}</HeadTitle>
      </Head>
      <Body>
        {data.title && <BigTitle>{data.title}</BigTitle>}
        <FullText>{data.text}</FullText>
      </Body>
      {data.href && (
        <Footer>
          <SourceLink href={data.href}>{HE.FEED_READER_SOURCE} ↗</SourceLink>
        </Footer>
      )}
    </Overlay>
  );
}
