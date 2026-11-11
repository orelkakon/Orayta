'use client';

import { CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

/**
 * אותיות פורחות — gold letters drifting up through the hero's sky and fading,
 * like the letters that rose from the broken luchot. Ten tiny composited
 * glyphs; negative delays put them mid-flight from the first frame.
 */
const float = keyframes`
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  20% { opacity: var(--o); }
  70% { opacity: var(--o); }
  100% { opacity: 0; transform: translate3d(var(--sx), -150px, 0) rotate(var(--r)); }
`;

const Glyph = styled.span.attrs({ className: 'anim-loop' })`
  position: absolute; bottom: -10px; opacity: 0;
  font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1;
  color: ${theme.game.goldLight};
  text-shadow: 0 0 10px ${theme.game.goldGlow};
  animation: ${float} var(--t) linear var(--d) infinite;
`;

const rand = (n: number) => { const x = Math.sin(n * 91.345) * 47453.5453; return x - Math.floor(x); };
const LETTERS = Array.from(HE.ABOUT_ORBIT_LETTERS);
const GLYPHS = Array.from({ length: 10 }, (_, i) => ({
  ch: LETTERS[Math.floor(rand(i + 3) * LETTERS.length)],
  x: Math.round(6 + rand(i + 11) * 88),
  size: Math.round(11 + rand(i + 23) * 11),
  t: 11 + rand(i + 31) * 9,
  d: -rand(i + 41) * 20,
  o: (0.16 + rand(i + 53) * 0.2).toFixed(2),
  sx: Math.round((rand(i + 61) - 0.5) * 50),
  r: Math.round((rand(i + 71) - 0.5) * 50),
}));

export default function RisingLetters() {
  return (
    <>
      {GLYPHS.map((g, i) => (
        <Glyph
          key={i}
          style={{
            left: `${g.x}%`, fontSize: g.size,
            '--t': `${g.t.toFixed(1)}s`, '--d': `${g.d.toFixed(1)}s`, '--o': g.o,
            '--sx': `${g.sx}px`, '--r': `${g.r}deg`,
          } as CSSProperties}
        >{g.ch}</Glyph>
      ))}
    </>
  );
}
