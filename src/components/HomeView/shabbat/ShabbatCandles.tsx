'use client';

import { CSSProperties, useId } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { PAN_Y, STICK_BOTTOM, WICK_TIP_Y } from '@/lib/shabbatClip/candlestick';
import { CANDLE_GLOW, HALO, Flame, Halo, Wick, breathe } from '../Flame';
import Candlestick, { CandlestickDefs } from './Candlestick';

/**
 * Two Shabbat candlesticks — shaded gold with knops, collars, a beaded drip
 * pan and a domed foot — in the hero's top corner instead of the sun arc,
 * from Friday until Shabbat goes out. On mount the candles catch one after
 * the other (right first) with a small burst at each wick; the flame's light
 * plays on each drip pan, the glow blooms over the card and embers drift up.
 * The drawing is static SVG; only HTML layers move, and loops rest under
 * reduced motion. Decorative: the times are in the text.
 */
const VB_W = 100;
const TOP = 9;
const VB_H = Math.ceil(TOP + STICK_BOTTOM + 1);
const STICKS = [{ x: 73, d: 0.35 }, { x: 27, d: 0.8 }];
const EMBERS = [{ dx: -7, t: 3.1, o: 0.5 }, { dx: 6, t: 3.6, o: 1.7 }, { dx: -2, t: 2.8, o: 2.9 }];
const GLOW_AT = 1.15;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

const burst = keyframes`
  from { opacity: 0.95; transform: translate(-50%, -50%) scale(0.2); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
`;
const bloom = keyframes`
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.45); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;
const pulse = keyframes`from { opacity: 1; } to { opacity: 0.72; }`;
const drift = keyframes`
  0% { opacity: 0; transform: translate(-50%, 0) scale(1); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -36px) scale(0.35); }
`;
const lightUp = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const Stage = styled.div`
  position: relative; flex-shrink: 0; --wick-w: 9.4%;
  width: 104px; aspect-ratio: ${VB_W} / ${VB_H};
  ${theme.up.md} { width: 128px; }
  svg { display: block; width: 100%; height: 100%; overflow: visible; }
`;

/* The candlelight on the card: behind the text, clipped by the card. */
const Glow = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; z-index: -1; pointer-events: none;
  left: 50%; top: 12%; width: 560%; aspect-ratio: 1;
  border-radius: 50%; background: ${CANDLE_GLOW};
  transform: translate(-50%, -50%);
  animation:
    ${bloom} 1.4s ${theme.motion.outStrong} ${GLOW_AT}s both,
    ${pulse} 3.8s ease-in-out ${GLOW_AT + 1.4}s infinite alternate;
`;

/* The flame's reflection on the polished drip pan. */
const Glint = styled.i`
  position: absolute; width: 26%; aspect-ratio: 2.6; pointer-events: none;
  border-radius: 50%; background: ${HALO}; mix-blend-mode: screen;
  transform: translate(-50%, -50%);
  animation: ${lightUp} 0.8s ease-out calc(var(--d) + 0.2s) both;
  > i { position: absolute; inset: 0; border-radius: inherit; background: inherit; animation: ${breathe} var(--t) ease-in-out infinite alternate; }
`;

const Burst = styled.i`
  position: absolute; width: 36%; aspect-ratio: 1; pointer-events: none;
  border-radius: 50%; background: radial-gradient(closest-side, ${theme.game.goldInk}, ${theme.game.goldGlow} 55%, transparent);
  opacity: 0; transform: translate(-50%, -50%);
  animation: ${burst} 0.65s ${theme.motion.outStrong} calc(var(--d) + 0.08s) forwards;
`;

const Ember = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; width: 2.5px; height: 2.5px; border-radius: 50%; pointer-events: none;
  background: ${theme.game.goldLight}; box-shadow: 0 0 4px 1px ${theme.game.goldGlow};
  opacity: 0;
  animation: ${drift} var(--t) ease-out var(--d) infinite;
`;

export default function ShabbatCandles() {
  const id = useId().replace(/:/g, '');
  return (
    <Stage aria-hidden="true">
      <Glow />
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <CandlestickDefs id={id} />
        {STICKS.map(s => <Candlestick key={s.x} id={id} x={s.x} y={TOP} />)}
      </svg>
      {STICKS.map((s, i) => {
        const tip = { left: pct(s.x, VB_W), top: pct(TOP + WICK_TIP_Y + 0.8, VB_H) };
        const t = `${1.2 + i * 0.37}s`;
        return (
          <span key={s.x}>
            <Glint style={{ left: pct(s.x, VB_W), top: pct(TOP + PAN_Y, VB_H), '--d': `${s.d}s`, '--t': t } as CSSProperties}><i className="anim-loop" /></Glint>
            <Burst style={{ ...tip, '--d': `${s.d}s` } as CSSProperties} />
            <Wick style={{ ...tip, '--d': `${s.d}s`, '--t': t, '--o': `-${(i * 0.53).toFixed(2)}s` } as CSSProperties}>
              <Halo /><Flame />
            </Wick>
            {EMBERS.map((e, k) => (
              <Ember
                key={k}
                style={{
                  left: tip.left, top: pct(TOP + WICK_TIP_Y - 12, VB_H),
                  '--dx': `${i ? -e.dx : e.dx}px`, '--t': `${e.t}s`, '--d': `${GLOW_AT + e.o + i * 0.6}s`,
                } as CSSProperties}
              />
            ))}
          </span>
        );
      })}
    </Stage>
  );
}
