'use client';

import styled, { keyframes } from 'styled-components';
import { LineIcon } from '@/components/common/LineIcons';
import type { StoryKey } from '@/types';

/*
 * Per-category background scenery — each story type gets its own decorative
 * treatment on top of its gradient, so every swipe lands on a visibly
 * different world. Pure CSS layers, pointer-transparent, artwork colors.
 */

const drift = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(6%); }
`;
const flicker = keyframes`
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.95; }
`;
const spinSlow = keyframes`to { transform: rotate(360deg); }`;
const riseFade = keyframes`
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  15%  { opacity: 0.7; }
  100% { transform: translateY(-340px) scale(0.6); opacity: 0; }
`;

const Layer = styled.div`
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
`;

/* rabbi — a quiet double halo behind the portrait */
const Halo = styled(Layer)`
  background:
    radial-gradient(circle at 50% 30%, transparent 106px, rgba(226,168,98,0.16) 108px, transparent 132px),
    radial-gradient(circle at 50% 30%, transparent 146px, rgba(226,168,98,0.08) 148px, transparent 174px);
`;

/* citation — giant quote watermark + a slow drifting band of light */
const QuoteWm = styled.span`
  position: absolute; top: 2%; right: 5%; line-height: 1;
  font-family: Georgia, serif; font-size: 11rem;
  color: rgba(232, 203, 118, 0.09);
`;
const Beam = styled(Layer).attrs({ className: 'anim-loop' })`
  left: -30%; width: 160%;
  background: linear-gradient(115deg, transparent 42%, rgba(255,240,200,0.06) 50%, transparent 58%);
  animation: ${drift} 7s ease-in-out infinite;
`;

/* reel / video — film-strip perforations down both edges */
const Film = styled.span<{ $side: 'left' | 'right' }>`
  position: absolute; top: 0; bottom: 0; ${p => p.$side}: 10px; width: 14px;
  background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16) 2.5px, transparent 3.5px);
  background-size: 14px 24px;
`;

/* parasha — torah-scroll rods at the edges + soft light from above */
const Rod = styled.span<{ $side: 'left' | 'right' }>`
  position: absolute; top: 7%; bottom: 7%; ${p => p.$side}: 14px; width: 7px;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(178,214,124,0.28), rgba(178,214,124,0.05));
`;
const SkyLight = styled(Layer)`
  background: radial-gradient(ellipse 80% 34% at 50% -6%, rgba(240,248,220,0.14), transparent 70%);
`;

/* halacha — a breathing candle glow rising from the bottom */
const CandleGlow = styled(Layer).attrs({ className: 'anim-loop' })`
  background: radial-gradient(ellipse 62% 36% at 50% 94%, rgba(244,203,94,0.32), transparent 72%);
  animation: ${flicker} 2.6s ease-in-out infinite;
`;

/* sikum — ruled notebook lines + a margin line */
const Ruled = styled(Layer)`
  background-image: repeating-linear-gradient(180deg, transparent 0 34px, rgba(255,255,255,0.05) 34px 35px);
`;
const MarginLine = styled.span`
  position: absolute; top: 0; bottom: 0; right: 13%; width: 1px;
  background: rgba(214, 150, 244, 0.28);
`;

/* quiz — concentric target rings, off-center */
const Rings = styled(Layer)`
  background:
    radial-gradient(circle at 82% 16%, transparent 34px, rgba(110,214,190,0.14) 35px, transparent 38px),
    radial-gradient(circle at 82% 16%, transparent 58px, rgba(110,214,190,0.09) 59px, transparent 62px),
    radial-gradient(circle at 82% 16%, transparent 84px, rgba(110,214,190,0.06) 85px, transparent 88px);
`;

/* chidush — a slowly turning ray burst, like an idea radiating */
const Burst = styled(Layer).attrs({ className: 'anim-loop' })`
  inset: -30%;
  background: repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,158,84,0.07) 0deg 7deg, transparent 7deg 20deg);
  animation: ${spinSlow} 80s linear infinite;
`;

/* tale — embers rising from a storyteller's fire */
const Ember = styled.span.attrs({ className: 'anim-loop' })<{ $x: string; $d: string; $s: string }>`
  position: absolute; bottom: 10%; left: ${p => p.$x};
  width: ${p => p.$s}; height: ${p => p.$s}; border-radius: 50%;
  background: rgba(255, 148, 128, 0.55); filter: blur(1px);
  animation: ${riseFade} 4.6s ease-in ${p => p.$d} infinite;
`;

/* gematria — a faint grid of values + a large aleph watermark */
const Grid = styled(Layer)`
  background-image:
    linear-gradient(rgba(148,158,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,158,255,0.06) 1px, transparent 1px);
  background-size: 46px 46px;
`;
const AlefWm = styled.span`
  position: absolute; bottom: 4%; left: 4%;
  color: rgba(148, 158, 255, 0.1);
`;

/* daf — an arched beit-midrash window over two text columns */
const Arch = styled(Layer)`
  background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(120,196,224,0.18), transparent 70%);
`;
const PageCol = styled.span<{ $side: 'left' | 'right' }>`
  position: absolute; top: 26%; bottom: 20%; ${p => p.$side}: 11%; width: 19%;
  border-radius: 6px;
  background: repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 9px);
`;

export default function StoryScene({ storyKey }: { storyKey: StoryKey }) {
  switch (storyKey) {
    case 'rabbi':    return <Halo aria-hidden="true" />;
    case 'citation': return <Layer aria-hidden="true"><QuoteWm>”</QuoteWm><Beam /></Layer>;
    case 'reel':
    case 'video':    return <Layer aria-hidden="true"><Film $side="left" /><Film $side="right" /></Layer>;
    case 'parasha':  return <Layer aria-hidden="true"><SkyLight /><Rod $side="left" /><Rod $side="right" /></Layer>;
    case 'halacha':  return <CandleGlow aria-hidden="true" />;
    case 'sikum':    return <Layer aria-hidden="true"><Ruled /><MarginLine /></Layer>;
    case 'quiz':     return <Rings aria-hidden="true" />;
    case 'chidush':  return <Layer aria-hidden="true"><Burst /></Layer>;
    case 'tale':     return (
      <Layer aria-hidden="true">
        <Ember $x="22%" $d="0s" $s="7px" /><Ember $x="48%" $d="1.6s" $s="5px" /><Ember $x="72%" $d="0.8s" $s="6px" />
      </Layer>
    );
    case 'gematria': return <Layer aria-hidden="true"><Grid /><AlefWm><LineIcon name="aleph" size={150} /></AlefWm></Layer>;
    case 'daf':      return <Layer aria-hidden="true"><Arch /><PageCol $side="left" /><PageCol $side="right" /></Layer>;
  }
}
