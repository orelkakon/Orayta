'use client';

import { useId } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export type AvatarMood = 'idle' | 'think' | 'write' | 'happy';

const B = theme.bot;

const blink = keyframes`0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.12); }`;
const look = keyframes`
  0%, 100% { transform: translate(0, 0); } 25% { transform: translate(2.2px, -0.8px); }
  50% { transform: translate(-2.2px, -0.8px); } 75% { transform: translate(1px, 0.5px); }
`;
const read = keyframes`0%, 100% { transform: translate(-2px, 1px); } 50% { transform: translate(2px, 1px); }`;
const glow = keyframes`0%, 100% { opacity: 0.5; } 50% { opacity: 1; }`;

/* LEDs blink on their own and move by mood; the visor glows while he works.
   All motion stops under reduced-motion. */
const Svg = styled.svg<{ $mood: AvatarMood }>`
  display: block; overflow: visible;
  .rb-led { transform-box: fill-box; transform-origin: center; animation: ${blink} 4.6s infinite; }
  .rb-eyes {
    transform-box: fill-box;
    ${p => p.$mood === 'think' && css`animation: ${look} 2.4s ease-in-out infinite;`}
    ${p => p.$mood === 'write' && css`animation: ${read} 1.1s ease-in-out infinite;`}
  }
  .rb-glow { opacity: 0.6; ${p => (p.$mood === 'think' || p.$mood === 'write') && css`animation: ${glow} 1.2s ease-in-out infinite;`} }
  @media (prefers-reduced-motion: reduce) { .rb-led, .rb-eyes, .rb-glow { animation: none; } }
`;

interface Props { size?: number; mood?: AvatarMood; title?: string }

const KIPPAH = 'M15.5 19 Q32 -1 48.5 19 Q32 14 15.5 19 Z';
const PEAH = 'c-3.4 2.4 -3.4 5.2 0 6.8 c3.4 1.6 3.4 4.4 0 6.2 c-3 1.6 -3 4 0 5.4 c2 1 2 2.6 0.4 3.6';
const PEAH_R = 'c3.4 2.4 3.4 5.2 0 6.8 c-3.4 1.6 -3.4 4.4 0 6.2 c3 1.6 3 4 0 5.4 c-2 1 -2 2.6 -0.4 3.6';

/**
 * רבי־בוט: a screen-shaped bot head with a glossy LED visor and brass bolt
 * ears, wearing a knitted kippah, with long payot and a full beard. Fixed
 * palette (theme.bot) in both themes.
 */
export default function RabbiBotAvatar({ size = 48, mood = 'idle', title }: Props) {
  // Unique per instance: a duplicate id inside a hidden element breaks gradients elsewhere.
  const u = useId().replace(/:/g, '');
  const id = (n: string) => `${n}${u}`;
  const url = (n: string) => `url(#${n}${u})`;
  const smile = mood === 'happy' ? 'M27.5 41 Q32 45 36.5 41' : 'M28.5 41.5 Q32 43.8 35.5 41.5';
  return (
    <Svg $mood={mood} width={size} height={size} viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={id('face')} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={B.face} /><stop offset="100%" stopColor={B.faceShade} />
        </linearGradient>
        <linearGradient id={id('beard')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={B.beardHi} /><stop offset="45%" stopColor={B.beard} /><stop offset="100%" stopColor={B.beardShade} />
        </linearGradient>
        <radialGradient id={id('kip')} cx="38%" cy="20%" r="85%">
          <stop offset="0%" stopColor={B.kippahHi} /><stop offset="100%" stopColor={B.kippah} />
        </radialGradient>
        <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={B.visorHi} /><stop offset="100%" stopColor={B.visor} />
        </linearGradient>
        <radialGradient id={id('bolt')} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={B.led} /><stop offset="55%" stopColor={B.bolt} /><stop offset="100%" stopColor={B.boltDark} />
        </radialGradient>
        <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" /></filter>
        <clipPath id={id('kclip')}><path d={KIPPAH} /></clipPath>
      </defs>

      {/* bolt ears */}
      {[7.5, 50.5].map(x => (
        <g key={x}>
          <rect x={x} y="25" width="6" height="9" rx="2.5" fill={url('bolt')} stroke={B.line} strokeWidth="1.5" />
          <path d={`M${x + 1.6} 29.5 h2.8`} stroke={B.boltDark} strokeWidth="0.9" strokeLinecap="round" />
        </g>
      ))}

      {/* payot: long curls hanging beside the ears (outline, body, sheen) */}
      {[`M10.5 33 ${PEAH}`, `M53.5 33 ${PEAH_R}`].map(d => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke={B.line} strokeWidth="4.8" />
          <path d={d} stroke={B.beard} strokeWidth="2.8" />
          <path d={d} stroke={B.beardHi} strokeWidth="0.9" opacity="0.8" />
        </g>
      ))}

      {/* head: a rounded screen with a soft top light */}
      <rect x="12" y="15" width="40" height="38" rx="13" fill={url('face')} stroke={B.line} strokeWidth="2" />
      <ellipse cx="25" cy="22.5" rx="8.5" ry="3.2" fill={B.face} opacity="0.75" filter={url('soft')} />
      <ellipse cx="32" cy="20.4" rx="13" ry="2" fill={B.line} opacity="0.16" filter={url('soft')} />

      {/* beard with strands */}
      <path d="M15 39 Q15.5 56 32 60.5 Q48.5 56 49 39 Q45 46 39.5 45 Q36 48.5 32 48.5 Q28 48.5 24.5 45 Q19 46 15 39 Z" fill={url('beard')} stroke={B.line} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M21 47.5 q1.6 3.4 4.4 5 M27 50.5 q1 3 3 4.6 M33.5 51 q0.4 3.4 -0.6 5.4 M38.5 49.5 q-0.6 3.4 -2.6 5.4 M43.5 46.5 q-1 3.4 -3.6 5.4" fill="none" stroke={B.beardHi} strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
      <path d="M24 55 q8 5 16 0" fill="none" stroke={B.beardShade} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* cheeks + smile */}
      <circle cx="19.5" cy="39.5" r="2.7" fill={B.cheek} />
      <circle cx="44.5" cy="39.5" r="2.7" fill={B.cheek} />
      <path d={smile} fill="none" stroke={B.line} strokeWidth="2" strokeLinecap="round" />

      {/* glossy LED visor */}
      <rect x="16.5" y="25" width="31" height="12" rx="6" fill={url('visor')} stroke={B.line} strokeWidth="1" />
      <rect className="rb-glow" x="18" y="26.5" width="28" height="9" rx="4.5" fill={B.led} opacity="0.18" filter={url('soft')} />
      <g className="rb-eyes">
        <g className="rb-led">
          {[22, 36].map(x => (
            <g key={x}>
              <rect x={x - 0.8} y="27.4" width="7.6" height="7.2" rx="3.6" fill={B.led} opacity="0.45" filter={url('soft')} />
              <rect x={x} y="28.2" width="6" height="5.6" rx="2.8" fill={B.led} />
              <rect x={x + 1.4} y="29.2" width="3.2" height="2.6" rx="1.3" fill={B.ledCore} />
            </g>
          ))}
        </g>
      </g>
      <path d="M19.5 27.4 Q32 25.2 44.5 27.4" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.28" />

      {/* knitted kippah: velvet dome, gold zigzag band, stitched edge, crown knot */}
      <path d={KIPPAH} fill={url('kip')} stroke={B.line} strokeWidth="1.2" strokeLinejoin="round" />
      <g clipPath={url('kclip')}>
        <path d="M15 14.6 l2.6 -2.4 l2.6 2.4 l2.6 -2.4 l2.6 2.4 l2.6 -2.4 l2.6 2.4 l2.6 -2.4 l2.6 2.4 l2.6 -2.4 l2.6 2.4 l2.6 -2.4 l2.6 2.4 l2.6 -2.4" fill="none" stroke={B.rim} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M14 17.4 Q32 12.4 50 17.4" fill="none" stroke={B.rim} strokeWidth="1" strokeDasharray="1.6 1.6" />
        <path d="M24 9.5 Q29 6.6 34.5 7" fill="none" stroke={B.kippahHi} strokeWidth="1.1" strokeLinecap="round" />
      </g>
      <circle cx="32" cy="9.8" r="1.1" fill={B.rim} />
    </Svg>
  );
}
