'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

const SONGS = [
  { id: 'xilcxmW7xYo', name: 'אישתי',         artist: 'בן צור' },
  { id: 'Z7OD4VEeOu8', name: 'טאטע תטהר',     artist: 'בן צור' },
  { id: 'qHdf4FOtqdo', name: 'אמונה',          artist: 'בן צור' },
  { id: 'QBrY-J9Vm-s', name: 'סולי',           artist: 'בן צור' },
  { id: 'Jhx8kKQOUDQ', name: 'נשמות צמאות',   artist: 'בן צור' },
  { id: 'C590zIn1znM', name: 'כל עכבה לטובה', artist: 'בן צור' },
  { id: '-1L6W2Z2KwI', name: 'אהבת השם',      artist: 'בן צור' },
  { id: '_HTyC9emB74', name: 'השבעתי אתכם',   artist: 'ישי ריבו' },
  { id: 'a470tNqmYJg', name: 'אחת ולתמיד',    artist: 'ישי ריבו' },
  { id: 'iG_XzBrfcl8', name: 'רבי שמעון',     artist: 'ישי ריבו' },
  { id: 'GVqt0MRI1q8', name: 'אין לי מלבדך',  artist: 'ישי ריבו' },
  { id: 'tGilTBGfP1E', name: 'הלב שלי',       artist: 'ישי ריבו' },
  { id: 'kq67kMNGgpg', name: 'כתר מלוכה',     artist: 'ישי ריבו' },
  { id: 'j9cPwwhah0c', name: 'סדר העבודה',    artist: 'ישי ריבו' },
  { id: 'E5mCRmuaSXU', name: 'לילה טוב שון',  artist: 'חנן בן ארי' },
  { id: 'gQaCWeAIrHI', name: 'שבורי לב',      artist: 'חנן בן ארי' },
  { id: '-gACoOrsQZM', name: 'מולדת',          artist: 'חנן בן ארי' },
  { id: 'tm-0AW0MoSs', name: 'שמש',            artist: 'חנן בן ארי' },
  { id: 'WUSzwJFXh2o', name: 'בסוף זה הלחן',  artist: 'חנן בן ארי' },
  { id: 'WPpuU-8cvb0', name: 'חנניה',          artist: 'חנן בן ארי' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

export default function FeedAmbient() {
  const playlistRef  = useRef<typeof SONGS>(shuffle(SONGS));
  const idxRef       = useRef(0);
  const [currentSong, setCurrentSong] = useState(() => playlistRef.current[0]);
  const [on, setOn]                   = useState(false);
  const [pillVisible, setPill]        = useState(false);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const unlockedRef  = useRef(false);
  const onRef        = useRef(false);
  const pillTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onRef.current = on; }, [on]);

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
      if (onRef.current) ytCmd(iframeRef.current, 'unMute');
      else ytCmd(iframeRef.current, 'mute');
    }, 350);
    if (onRef.current) showPill();
  }, [showPill]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== 'https://www.youtube.com') return;
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
        if (iframeRef.current) ytCmd(iframeRef.current, 'unMute');
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
      ytCmd(iframeRef.current, 'unMute');
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
