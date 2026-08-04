'use client';

import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { LiveStream } from '@/types';

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to   { opacity: 1; transform: none; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${theme.z.modal};
  background: rgba(10,6,3,0.88);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: ${theme.spacing.md};
  animation: ${fadeIn} 0.2s ease;
`;

const Sheet = styled.div`
  width: 100%; max-width: 960px;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  animation: ${rise} 0.3s ${theme.motion.out};
`;

const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.sm}; color: #fff;
`;

const StreamTitle = styled.div`
  display: flex; flex-direction: column; gap: 2px; min-width: 0;
`;

const ChannelName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.lg}; font-weight: 800;
`;

const VideoTitle = styled.span`
  font-size: ${theme.fontSizes.xs}; opacity: 0.75;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const CloseBtn = styled.button`
  flex-shrink: 0; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.5rem; border-radius: ${theme.radii.md};
  transition: background ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { background: rgba(255,255,255,0.15); }
  &:active { transform: scale(0.9); }
`;

const Frame = styled.div`
  position: relative; width: 100%; aspect-ratio: 16 / 9;
  background: #000; border-radius: ${theme.radii.lg}; overflow: hidden;
  box-shadow: 0 24px 70px rgba(0,0,0,0.6);
  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
`;

interface Props {
  stream: LiveStream;
  onClose: () => void;
}

export default function LivePlayer({ stream, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <Overlay onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <Sheet role="dialog" aria-modal="true" aria-label={`${HE.LIVE_TITLE}: ${stream.channelName}`}>
        <TopBar>
          <StreamTitle>
            <ChannelName>🔴 {stream.channelName}</ChannelName>
            <VideoTitle>{stream.title}</VideoTitle>
          </StreamTitle>
          <CloseBtn onClick={onClose} aria-label={HE.CLOSE}>×</CloseBtn>
        </TopBar>
        <Frame>
          {/* vq is best-effort — YouTube's embed treats quality as a hint and
              still adapts to bandwidth; there is no supported hard override. */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${stream.videoId}?autoplay=1&rel=0&hl=he&vq=hd1080`}
            title={stream.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </Frame>
      </Sheet>
    </Overlay>
  );
}
