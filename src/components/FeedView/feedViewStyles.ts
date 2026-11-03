import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const Wrapper = styled.div`
  position: fixed; inset: 0; z-index: ${theme.z.feed}; overflow: hidden;
  background: ${theme.onMedia.void};
`;

export const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll; scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  /* Never hand the gesture to the document — an edge rubber-band (or Android
     pull-to-refresh) hijacks the flick chain and the feed feels stuck. */
  overscroll-behavior-y: contain;
  &::-webkit-scrollbar { display: none; }
`;

const hintBob = keyframes`
  0%, 100% { transform: translate(-50%, 0); opacity: 0.85; }
  50%      { transform: translate(-50%, -9px); opacity: 1; }
`;

/* First-visit only: one quiet gesture cue, gone forever after the first swipe. */
export const SwipeHint = styled.div.attrs({ className: 'anim-loop' })`
  position: fixed; bottom: calc(30px + ${theme.safe.bottom}); left: 50%;
  transform: translateX(-50%);
  z-index: 250; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: ${theme.onMedia.ink}; font-size: ${theme.fontSizes.sm}; font-weight: 600;
  text-shadow: ${theme.onMedia.textShadow};
  animation: ${hintBob} 1.6s ease-in-out infinite;
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

/** Paging indicator — only while more slides load under existing ones. */
export const Spinner = styled.div`
  position: fixed; bottom: calc(24px + ${theme.safe.bottom}); left: 50%; margin-left: -11px;
  width: 22px; height: 22px; border-radius: 50%; z-index: 300;
  border: 2px solid ${theme.onMedia.glass}; border-top-color: ${theme.onMedia.muted};
  animation: ${spin} 0.7s linear infinite;
`;
