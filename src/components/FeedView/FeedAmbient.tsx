'use client';

import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

// Piano-only (קריוקי פסנתר) versions — melody, no vocals
const SONGS = [
  // בן צור
  { id: 'xilcxmW7xYo', name: 'אישתי',          artist: 'בן צור' },
  { id: 'Z7OD4VEeOu8', name: 'טאטע תטהר',      artist: 'בן צור' },
  { id: 'qHdf4FOtqdo', name: 'אמונה',           artist: 'בן צור' },
  { id: 'QBrY-J9Vm-s', name: 'סולי',            artist: 'בן צור' },
  { id: 'Jhx8kKQOUDQ', name: 'נשמות צמאות',    artist: 'בן צור' },
  { id: 'C590zIn1znM', name: 'כל עכבה לטובה',  artist: 'בן צור' },
  { id: '-1L6W2Z2KwI', name: 'אהבת השם',       artist: 'בן צור' },
  // ישי ריבו
  { id: '_HTyC9emB74', name: 'השבעתי אתכם',    artist: 'ישי ריבו' },
  { id: 'a470tNqmYJg', name: 'אחת ולתמיד',     artist: 'ישי ריבו' },
  { id: 'iG_XzBrfcl8', name: 'רבי שמעון',      artist: 'ישי ריבו' },
  { id: 'GVqt0MRI1q8', name: 'אין לי מלבדך',   artist: 'ישי ריבו' },
  { id: 'tGilTBGfP1E', name: 'הלב שלי',        artist: 'ישי ריבו' },
  { id: 'kq67kMNGgpg', name: 'כתר מלוכה',      artist: 'ישי ריבו' },
  { id: 'j9cPwwhah0c', name: 'סדר העבודה',     artist: 'ישי ריבו' },
  // חנן בן ארי
  { id: 'E5mCRmuaSXU', name: 'לילה טוב שון',   artist: 'חנן בן ארי' },
  { id: 'gQaCWeAIrHI', name: 'שבורי לב',       artist: 'חנן בן ארי' },
  { id: '-gACoOrsQZM', name: 'מולדת',           artist: 'חנן בן ארי' },
  { id: 'tm-0AW0MoSs', name: 'שמש',             artist: 'חנן בן ארי' },
  { id: 'WUSzwJFXh2o', name: 'בסוף זה הלחן',   artist: 'חנן בן ארי' },
  { id: 'WPpuU-8cvb0', name: 'חנניה',           artist: 'חנן בן ארי' },
];

// Iframe sits exactly behind the button so it is technically present in the DOM
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
`;

const Label = styled.div<{ $visible: boolean }>`
  position: fixed; bottom: 30px; left: 58px; z-index: 301;
  color: rgba(255,255,255,0.55); font-size: 0.72rem; white-space: nowrap;
  opacity: ${p => p.$visible ? 1 : 0}; transition: opacity 0.4s;
  pointer-events: none;
`;

function ytCmd(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    'https://www.youtube.com'
  );
}

export default function FeedAmbient() {
  const [on, setOn]                   = useState(false);
  const [showLabel, setShowLabel]     = useState(false);
  const [song]                        = useState(() => SONGS[Math.floor(Math.random() * SONGS.length)]);
  const iframeRef                     = useRef<HTMLIFrameElement>(null);
  const unlockedRef                   = useRef(false);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(e.data as string) as { event?: string; info?: number };
        if (data.event === 'onStateChange' && data.info === 0 && iframeRef.current) {
          ytCmd(iframeRef.current, 'seekTo', [30, true]);
          ytCmd(iframeRef.current, 'playVideo');
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      // Send unMute at 300 ms and again at 1 s to survive slow loads
      [300, 1000].forEach(d => setTimeout(() => {
        if (iframeRef.current) ytCmd(iframeRef.current, 'unMute');
      }, d));
      setOn(true);
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 3000);
    }

    document.addEventListener('touchstart',  unlock, { passive: true, once: true });
    document.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      document.removeEventListener('touchstart',  unlock);
      document.removeEventListener('pointerdown', unlock);
    };
  }, []);

  const toggle = () => {
    if (!iframeRef.current) return;
    if (on) {
      ytCmd(iframeRef.current, 'mute');
      setOn(false);
    } else {
      ytCmd(iframeRef.current, 'unMute');
      setOn(true);
    }
  };

  // No loop=1 — we handle looping manually via onStateChange so the video
  // always seeks back to 30s instead of restarting from 0.
  const src =
    `https://www.youtube.com/embed/${song.id}` +
    `?autoplay=1&mute=1&controls=0` +
    `&playsinline=1&rel=0&enablejsapi=1&start=30`;

  return (
    <>
      <HiddenFrame
        ref={iframeRef}
        src={src}
        title={song.name}
        allow="autoplay; encrypted-media"
      />
      <Btn $on={on} onClick={toggle} title={on ? 'כבה מוזיקה' : 'הפעל מוזיקה'}>♪</Btn>
      <Label $visible={showLabel}>♪ {song.name} — {song.artist}</Label>
    </>
  );
}
