'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { TehillimPurpose } from '@/types/tehillim';
import { namesLine } from '@/lib/tehillim/client';

/**
 * A whole book of Tehillim was just completed: for a few seconds the screen
 * goes to night and scattered gold letters gather into the name the reading
 * is for. Shown to everyone who has the reading open at that moment (the
 * reader who closed the book and whoever is watching), above any sheet.
 * A tap dismisses it; under reduced motion the name simply appears.
 */
const HOLD_MS = 3200;
const LETTER_MS = 42;
const FLY_MS = 1300;

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const gather = keyframes`
  from { opacity: 0; transform: translate3d(var(--x), var(--y), 0) rotate(var(--r)) scale(0.3); }
  60% { opacity: 1; }
`;
const bloom = keyframes`
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;
const rise = keyframes`from { opacity: 0; transform: translateY(12px); }`;

const Stage = styled.div<{ $leaving: boolean }>`
  position: fixed; inset: 0; z-index: ${theme.z.toast}; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.lg}; text-align: center; direction: rtl;
  background: ${theme.game.stage}; color: ${theme.gilded.nightInk};
  animation: ${fade} 0.35s ease both;
  opacity: ${p => (p.$leaving ? 0 : 1)}; transition: opacity 0.4s ease;
`;
const Glow = styled.div`
  position: absolute; left: 50%; top: 50%; width: min(130vw, 720px); aspect-ratio: 1; pointer-events: none;
  background: radial-gradient(closest-side, ${theme.game.goldGlow}, transparent);
  animation: ${bloom} 1.6s ${theme.motion.outStrong} var(--land) both;
`;
const Kicker = styled.p`
  position: relative; margin: 0; font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.game.goldLight};
  animation: ${rise} 0.6s ${theme.motion.outStrong} 0.2s both;
`;
const Prefix = styled.p`
  position: relative; margin: 0; font-size: ${theme.fontSizes.lg}; color: ${theme.gilded.nightMuted};
  animation: ${rise} 0.6s ${theme.motion.outStrong} 0.35s both;
`;
const Name = styled.p<{ $long: boolean }>`
  position: relative; margin: 0; max-width: 18ch; font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1.25;
  font-size: ${p => (p.$long ? 'clamp(1.7rem, 1.1rem + 3vw, 2.8rem)' : 'clamp(2.4rem, 1.4rem + 6vw, 4.4rem)')};
  color: ${theme.game.goldInk};
`;
const Word = styled.span`display: inline-block; white-space: nowrap; margin: 0 0.14em;`;
const Letter = styled.span`
  display: inline-block; will-change: transform;
  animation: ${gather} ${FLY_MS}ms ${theme.motion.outStrong} var(--d) both;
`;
const After = styled.p`
  position: relative; margin: 0; font-size: ${theme.fontSizes.md}; color: ${theme.gilded.nightMuted};
  animation: ${rise} 0.7s ${theme.motion.outStrong} var(--land) both;
`;

// A fixed scatter per letter index, so re-renders don't reshuffle mid-flight.
const rand = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

interface Props { books: number; purpose: TehillimPurpose; names: string[]; onDone: () => void }

export default function BookMoment({ books, purpose, names, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);
  const name = namesLine(names) || HE.TH_MOMENT_FALLBACK;
  const words = name.split(/\s+/).filter(Boolean);
  const letters = name.replace(/\s+/g, '').length;
  const land = 500 + letters * LETTER_MS + FLY_MS * 0.6;

  useEffect(() => {
    haptics.success();
    const out = window.setTimeout(() => setLeaving(true), land + HOLD_MS);
    return () => window.clearTimeout(out);
  }, [land]);
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(onDone, 400);
    return () => window.clearTimeout(t);
  }, [leaving, onDone]);

  let i = 0;
  const prefix = HE.TH_PURPOSES[purpose].prefix;
  return createPortal(
    <Stage $leaving={leaving} role="status" onClick={() => setLeaving(true)} style={{ '--land': `${Math.round(land)}ms` } as CSSProperties}>
      <Glow aria-hidden="true" />
      <Kicker>{HE.TH_MOMENT_KICKER(books)}</Kicker>
      {prefix && <Prefix>{prefix}</Prefix>}
      <Name $long={letters > 22} aria-label={name}>
        {words.map((w, wi) => (
          <Word key={wi} aria-hidden="true">
            {Array.from(w).map(ch => {
              const k = i++;
              const style = {
                '--x': `${Math.round((rand(k + 1) - 0.5) * 90)}vw`,
                '--y': `${Math.round((rand(k + 51) - 0.5) * 80)}vh`,
                '--r': `${Math.round((rand(k + 101) - 0.5) * 240)}deg`,
                '--d': `${500 + k * LETTER_MS}ms`,
              } as CSSProperties;
              return <Letter key={k} style={style}>{ch}</Letter>;
            })}
          </Word>
        ))}
      </Name>
      <After>{HE.TH_MOMENT_THANKS}</After>
    </Stage>,
    document.body,
  );
}
