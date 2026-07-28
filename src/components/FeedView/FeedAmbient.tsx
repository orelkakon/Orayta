'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AMBIENT_SONGS, shuffleSongs } from '@/lib/ambientSongs';

function ytCmd(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube.com');
}

const HiddenFrame = styled.iframe`
  position: fixed; bottom: 26px; left: 14px; z-index: 300;
  width: 36px; height: 36px; border: none; border-radius: 50%;
  opacity: 0; pointer-events: none;
`;

const Btn = styled.button<{ $on: boolean }>`
  position: fixed; bottom: 26px; left: 14px; z-index: 301;
  width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
  background: ${p => p.$on ? 'rgba(255,220,140,0.18)' : 'rgba(0,0,0,0.38)'};
  border: 1px solid rgba(255,255,255,${p => p.$on ? '0.38' : '0.12'});
  color: ${p => p.$on ? 'rgba(255,220,140,0.9)' : 'rgba(255,255,255,0.4)'};
  font-size: 0.95rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.25s, border-color 0.25s, color 0.25s;
  backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent; outline: none; appearance: none; -webkit-appearance: none;
`;

const b1 = keyframes`0%,100%{height:4px} 50%{height:14px}`;
const b2 = keyframes`0%,100%{height:10px} 33%{height:4px} 66%{height:16px}`;
const b3 = keyframes`0%,100%{height:7px} 25%{height:16px} 75%{height:3px}`;

const EqWrap = styled.div<{ $on: boolean }>`
  position: fixed; bottom: 32px; left: 56px; z-index: 301;
  display: flex; gap: 2px; align-items: flex-end; height: 18px;
  opacity: ${p => p.$on ? 1 : 0}; transition: opacity 0.3s; pointer-events: none;
`;
const Bar = styled.div<{ $i: number }>`
  width: 3px; border-radius: 2px; background: rgba(255,220,140,0.75);
  ${p => p.$i === 0 && css`animation: ${b1} 0.75s ease-in-out infinite;`}
  ${p => p.$i === 1 && css`animation: ${b2} 0.9s ease-in-out infinite 0.15s;`}
  ${p => p.$i === 2 && css`animation: ${b3} 0.65s ease-in-out infinite 0.3s;`}
`;

const Pill = styled.div<{ $visible: boolean }>`
  position: fixed; bottom: 70px; left: 12px; z-index: 301;
  background: rgba(10,8,20,0.82); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,220,140,0.28); border-radius: 20px;
  padding: 6px 14px; pointer-events: none;
  opacity: ${p => p.$visible ? 1 : 0}; transition: opacity 0.45s;
  white-space: nowrap; max-width: 200px;
`;
const PillName = styled.div`color: rgba(255,220,140,0.92); font-size: 0.75rem; font-weight: 700;`;
const PillArtist = styled.div`color: rgba(255,255,255,0.5); font-size: 0.66rem;`;

export default function FeedAmbient({ suppressed = false }: { suppressed?: boolean }) {
  const playlistRef  = useRef(shuffleSongs(AMBIENT_SONGS));
  const idxRef       = useRef(0);
  const [currentSong, setCurrentSong] = useState(() => playlistRef.current[0]);
  const [on, setOn]                   = useState(false);
  const [pillVisible, setPill]        = useState(false);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const unlockedRef  = useRef(false);
  const handshakeRef = useRef(false);
  const onRef        = useRef(false);
  const suppressedRef = useRef(false);
  const pillTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onRef.current = on; }, [on]);

  // A visible Instagram reel takes over the audio: mute while suppressed,
  // restore the user's music state when the reel leaves the screen.
  useEffect(() => {
    suppressedRef.current = suppressed;
    if (!iframeRef.current) return;
    if (suppressed) ytCmd(iframeRef.current, 'mute');
    else if (onRef.current) {
      // playVideo too — the browser may have paused the muted player meanwhile
      ytCmd(iframeRef.current, 'playVideo');
      ytCmd(iframeRef.current, 'unMute');
    }
  }, [suppressed]);

  // The YT iframe only emits onStateChange after a 'listening' handshake;
  // without it songs never auto-advance and the feed goes silent at song end.
  useEffect(() => {
    const timer = setInterval(() => {
      if (handshakeRef.current) { clearInterval(timer); return; }
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
        'https://www.youtube.com'
      );
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Browsers pause background playback: resume when the tab becomes visible again
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== 'visible' || !iframeRef.current) return;
      ytCmd(iframeRef.current, 'playVideo');
      if (onRef.current && !suppressedRef.current) ytCmd(iframeRef.current, 'unMute');
      else ytCmd(iframeRef.current, 'mute');
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const showPill = useCallback(() => {
    setPill(true);
    if (pillTimer.current) clearTimeout(pillTimer.current);
    pillTimer.current = setTimeout(() => setPill(false), 4000);
  }, []);

  // Advance to next song using loadVideoById (no iframe reload)
  const advanceSong = useCallback(() => {
    idxRef.current = (idxRef.current + 1) % playlistRef.current.length;
    const next = playlistRef.current[idxRef.current];
    setCurrentSong(next);
    if (!iframeRef.current) return;
    ytCmd(iframeRef.current, 'loadVideoById', [{ videoId: next.id, startSeconds: 30 }]);
    setTimeout(() => {
      if (!iframeRef.current) return;
      if (onRef.current && !suppressedRef.current) ytCmd(iframeRef.current, 'unMute');
      else ytCmd(iframeRef.current, 'mute');
    }, 350);
    if (onRef.current) showPill();
  }, [showPill]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== 'https://www.youtube.com') return;
      handshakeRef.current = true;
      try {
        const data = JSON.parse(e.data as string) as { event?: string; info?: number };
        if (data.event === 'onStateChange' && data.info === 0) advanceSong();
      } catch {}
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [advanceSong]);

  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      [300, 1000].forEach(d => setTimeout(() => {
        if (iframeRef.current && !suppressedRef.current) {
          ytCmd(iframeRef.current, 'playVideo');
          ytCmd(iframeRef.current, 'unMute');
        }
      }, d));
      setOn(true);
      showPill();
    }
    document.addEventListener('touchstart', unlock, { passive: true, once: true });
    document.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('pointerdown', unlock);
    };
  }, [showPill]);

  const toggle = () => {
    if (!iframeRef.current) return;
    if (on) {
      ytCmd(iframeRef.current, 'mute');
      setOn(false); setPill(false);
    } else {
      ytCmd(iframeRef.current, 'playVideo');
      if (!suppressedRef.current) ytCmd(iframeRef.current, 'unMute');
      setOn(true); showPill();
    }
  };

  // src must never change — song advances happen via loadVideoById, not src updates
  const initialSrc = useRef(
    `https://www.youtube.com/embed/${playlistRef.current[0].id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1&start=30`
  );

  return (
    <>
      <HiddenFrame ref={iframeRef} src={initialSrc.current} title={currentSong.name} allow="autoplay; encrypted-media" />
      <Btn $on={on} onClick={on ? () => { showPill(); toggle(); } : toggle} title={on ? 'כבה מוזיקה' : 'הפעל מוזיקה'}>♪</Btn>
      <EqWrap $on={on}><Bar $i={0} /><Bar $i={1} /><Bar $i={2} /></EqWrap>
      <Pill $visible={pillVisible}>
        <PillName>♪ {currentSong.name}</PillName>
        <PillArtist>{currentSong.artist}</PillArtist>
      </Pill>
    </>
  );
}
