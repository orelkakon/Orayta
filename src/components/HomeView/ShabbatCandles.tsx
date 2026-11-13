'use client';

import { CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { CANDLE_GLOW, Flame, Halo, Wick } from './Flame';

/**
 * Two Shabbat candles in gold line-art candlesticks (the menorah's hand),
 * standing in the hero's top corner instead of the sun arc from Friday until
 * Shabbat goes out. On mount they catch one after the other — right first —
 * with a small burst at each wick, then their light blooms over the card and
 * embers drift up. The drawing is a static SVG; only HTML layers move, and the
 * loops rest under reduced motion. Decorative: the times are in the text.
 */
const VB_W = 120;
const VB_H = 96;
const CANDLE_TOP = 16;
const CANDLE_H = 28;
const TIP_Y = 12.5;
const STICKS = [{ x: 80, d: 0.35 }, { x: 40, d: 0.8 }];
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

const Stage = styled.div`
  position: relative; flex-shrink: 0; --wick-w: 9%;
  width: 112px; aspect-ratio: ${VB_W} / ${VB_H};
  ${theme.up.md} { width: 140px; }
  svg { display: block; width: 100%; height: 100%; overflow: visible; }
`;

/* The candlelight on the card: behind the text, clipped by the card. */
const Glow = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; z-index: -1; pointer-events: none;
  left: 50%; top: 14%; width: 520%; aspect-ratio: 1;
  border-radius: 50%; background: ${CANDLE_GLOW};
  transform: translate(-50%, -50%);
  animation:
    ${bloom} 1.4s ${theme.motion.outStrong} ${GLOW_AT}s both,
    ${pulse} 3.8s ease-in-out ${GLOW_AT + 1.4}s infinite alternate;
`;

const Burst = styled.i`
  position: absolute; width: 34%; aspect-ratio: 1; pointer-events: none;
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

function Candlestick({ x }: { x: number }) {
  const bottom = CANDLE_TOP + CANDLE_H;
  return (
    <g>
      <rect x={x - 4.2} y={CANDLE_TOP} width="8.4" height={CANDLE_H} rx="1.6" fill={theme.game.goldInk} stroke="none" />
      <path d={`M${x + 2.2} ${CANDLE_TOP + 3}V${bottom - 3}`} stroke={theme.game.gold} strokeOpacity="0.3" strokeWidth="1.2" />
      <path d={`M${x} ${CANDLE_TOP}V${TIP_Y}`} stroke={theme.game.goldDeep} strokeWidth="1.3" />
      <path d={`M${x - 10} ${bottom}H${x + 10}`} stroke={theme.game.goldLight} strokeWidth="3" />
      <path d={`M${x - 9} ${bottom + 1.5}Q${x} ${bottom + 10} ${x + 9} ${bottom + 1.5}`} />
      <path d={`M${x} ${bottom + 7}V${VB_H - 8}`} />
      <ellipse cx={x} cy={bottom + 19} rx="3.6" ry="2.4" />
      <path d={`M${x - 13} ${VB_H - 2}H${x + 13}M${x - 9} ${VB_H - 2}Q${x} ${VB_H - 14} ${x + 9} ${VB_H - 2}`} />
    </g>
  );
}

export default function ShabbatCandles() {
  return (
    <Stage aria-hidden="true">
      <Glow />
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none" stroke={theme.game.gold} strokeWidth="2.2" strokeLinecap="round">
        {STICKS.map(s => <Candlestick key={s.x} x={s.x} />)}
      </svg>
      {STICKS.map((s, i) => {
        const at = { left: pct(s.x, VB_W), top: pct(TIP_Y + 1, VB_H) };
        return (
          <span key={s.x}>
            <Burst style={{ ...at, '--d': `${s.d}s` } as CSSProperties} />
            <Wick style={{ ...at, '--d': `${s.d}s`, '--t': `${1.2 + i * 0.37}s`, '--o': `-${(i * 0.53).toFixed(2)}s` } as CSSProperties}>
              <Halo /><Flame />
            </Wick>
            {EMBERS.map((e, k) => (
              <Ember
                key={k}
                style={{
                  left: pct(s.x, VB_W), top: pct(TIP_Y - 9, VB_H),
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
