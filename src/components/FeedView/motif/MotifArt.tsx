'use client';

import { CSSProperties, useId } from 'react';
import styled, { keyframes } from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { MotifKind, dafPath, scrollPath, hexagram, ticks, embers } from './motifPaths';

/**
 * The drawings behind each feed post, in the post's accent colour. Every
 * moving part is an HTML layer animated with transform/opacity only (the
 * SVG inside never re-rasterizes), so they stay on the compositor.
 */
const spin = keyframes`to { transform: rotate(360deg); }`;
const spinBack = keyframes`to { transform: rotate(-360deg); }`;
const descend = keyframes`from { transform: translate3d(0, -30%, 0); } to { transform: translate3d(0, 560%, 0); }`;
const roll = keyframes`from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, -50%, 0); }`;
const rise = keyframes`
  0% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.5); }
  15% { opacity: 1; }
  75% { opacity: 0.8; }
  100% { opacity: 0; transform: translate3d(var(--sway), -62vh, 0) scale(1.1); }
`;
const flicker = keyframes`
  0%, 100% { opacity: 0.75; transform: translateX(-50%) scale(1); }
  40% { opacity: 1; transform: translateX(-50%) scale(1.08, 1.14); }
  70% { opacity: 0.85; transform: translateX(-50%) scale(0.97, 1.04); }
`;

const Layer = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; inset: 0;
  svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
`;

const Spin = styled(Layer)<{ $dur: number; $back?: boolean }>`
  animation: ${p => (p.$back ? spinBack : spin)} ${p => p.$dur}s linear infinite;
`;

/* A soft light travelling down the daf, like a finger following the lines. */
const Glint = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; left: 10%; right: 10%; top: 0; height: 16%;
  background: radial-gradient(50% 50% at 50% 50%, var(--motif-glow), transparent 70%);
  animation: ${descend} 15s linear infinite;
`;

const Window = styled.div`
  position: absolute; inset: 0; overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent, #000 22%, #000 78%, transparent);
  mask-image: linear-gradient(transparent, #000 22%, #000 78%, transparent);
`;

const Roller = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; left: 0; right: 0; top: 0; height: 200%;
  animation: ${roll} 70s linear infinite;
  svg { position: absolute; inset: 0; width: 100%; height: 100%; }
`;

const Spark = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; border-radius: 50%;
  background: var(--motif-spark);
  box-shadow: 0 0 8px 1px var(--motif-glow);
  animation: ${rise} var(--dur) ease-out var(--delay) infinite;
`;

const Candle = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; left: 50%; bottom: -14%; width: 70%; height: 46%;
  background: radial-gradient(50% 50% at 50% 60%, var(--motif-glow), transparent 70%);
  transform-origin: 50% 80%;
  animation: ${flicker} 3.2s ease-in-out infinite;
`;

// CSS variables resolve in style, not in SVG presentation attributes.
const line = { fill: 'none', strokeWidth: 1, vectorEffect: 'non-scaling-stroke', style: { stroke: 'var(--motif-line)' } } as const;
const ink = { fill: 'var(--motif-line)' };

export default function MotifArt({ kind, seed }: { kind: MotifKind; seed: number }) {
  const uid = useId().replace(/:/g, '');

  if (kind === 'daf') return (
    <Layer>
      <svg viewBox="0 0 400 400"><path d={dafPath(seed)} {...line} /></svg>
      <Glint />
    </Layer>
  );

  if (kind === 'script') return (
    <Window>
      <Roller>
        <svg viewBox="0 0 400 800" preserveAspectRatio="none">
          <path d={scrollPath(seed)} {...line} />
          <path d={scrollPath(seed)} transform="translate(0 400)" {...line} />
        </svg>
      </Roller>
    </Window>
  );

  if (kind === 'rosette') return (
    <>
      <Spin $dur={150}>
        <svg viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="188" {...line} />
          <circle cx="200" cy="200" r="174" {...line} />
          <path d={ticks(200, 200, 174, 188, 72)} {...line} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M200 32A17 50 0 0 1 200 132A17 50 0 0 1 200 32Z" transform={`rotate(${i * 30} 200 200)`} {...line} />
          ))}
        </svg>
      </Spin>
      <Spin $dur={90} $back>
        <svg viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="62" {...line} strokeDasharray="2 7" />
          <path d={hexagram(200, 200, 54)} {...line} />
          <circle cx="200" cy="200" r="20" {...line} />
        </svg>
      </Spin>
    </>
  );

  if (kind === 'lattice') return (
    <Spin $dur={240}>
      <svg viewBox="0 0 400 400">
        <defs>
          <pattern id={`mp-${uid}`} width="56" height="56" patternUnits="userSpaceOnUse">
            <path d={hexagram(28, 28, 17)} {...line} />
            <circle cx="0" cy="0" r="1.6" style={ink} />
          </pattern>
          <radialGradient id={`mg-${uid}`}>
            <stop offset="0.45" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`mm-${uid}`}><circle cx="200" cy="200" r="196" fill={`url(#mg-${uid})`} /></mask>
        </defs>
        <rect width="400" height="400" fill={`url(#mp-${uid})`} mask={`url(#mm-${uid})`} />
      </svg>
    </Spin>
  );

  if (kind === 'orbit') {
    const letters = Array.from(HE.ABOUT_ORBIT_LETTERS);
    return (
      <>
        <Spin $dur={160}>
          <svg viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="190" {...line} />
            <circle cx="200" cy="200" r="146" {...line} />
            {letters.map((ch, i) => (
              <text
                key={i} x="200" y="40" textAnchor="middle" fontSize="22"
                style={{ ...ink, fontFamily: 'var(--font-frank, serif)' }} transform={`rotate(${(i * 360) / letters.length} 200 200)`}
              >{ch}</text>
            ))}
          </svg>
        </Spin>
        <Spin $dur={100} $back>
          <svg viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="118" {...line} strokeDasharray="1 9" />
            <path d={hexagram(200, 200, 96)} {...line} />
          </svg>
        </Spin>
      </>
    );
  }

  return (
    <Layer>
      <Candle />
      {embers(seed).map((e, i) => (
        <Spark
          key={i}
          style={{
            left: `${e.x}%`, top: `${e.top}%`, width: e.size, height: e.size,
            '--dur': `${e.dur}s`, '--delay': `${e.delay}s`, '--sway': `${e.sway}px`,
          } as CSSProperties}
        />
      ))}
    </Layer>
  );
}
