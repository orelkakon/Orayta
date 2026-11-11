'use client';

import { CSSProperties, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ChanukahStatus, candleSlot, chanukahStatus } from '@/lib/chanukah';

/**
 * The home hero's menorah, on the eight days of Chanukah (and the eve): the
 * night's candles stand in it from the right, and at nightfall in Jerusalem
 * the shamash catches and lights them newest first. By day they wait unlit.
 * The drawing is a static SVG; only the flames (HTML) move.
 * `/?chanukah=1…8` previews a night outside the season.
 */
const VB_W = 180;
const VB_H = 104;
const CUP_Y = 40;
const SHAMASH_Y = 26;
const CANDLE_H = 14;
const SLOT_X = Array.from({ length: 9 }, (_, i) => 14 + i * 19);
const FLAME = 'radial-gradient(60% 70% at 50% 72%, #FFFBEA 0%, #FFD98A 42%, #F2994A 78%, rgba(242, 153, 74, 0) 100%)';
const HALO = 'radial-gradient(closest-side, rgba(255, 205, 120, 0.5), rgba(255, 205, 120, 0))';

const ignite = keyframes`
  from { opacity: 0; transform: translate(-50%, -100%) scale(0); }
  to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
`;
const flicker = keyframes`
  0%, 100% { transform: scale(1, 1) rotate(-2deg); }
  30% { transform: scale(0.9, 1.1) rotate(2.5deg); }
  62% { transform: scale(1.06, 0.93) rotate(-1deg); }
`;
const breathe = keyframes`from { opacity: 0.55; } to { opacity: 1; }`;

const Wrap = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;
const Kicker = styled.p`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; letter-spacing: 0.04em; color: ${theme.game.gold};
`;
const Title = styled.p`
  margin-top: 2px; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.xl}; font-weight: 700; line-height: 1.2; color: ${theme.gilded.nightInk};
`;
const Sub = styled.p`margin-top: 2px; font-size: ${theme.fontSizes.sm}; color: ${theme.gilded.nightMuted};`;

const Stage = styled.div`
  position: relative; flex-shrink: 0; width: clamp(140px, 40vw, 200px); aspect-ratio: ${VB_W} / ${VB_H};
  svg { display: block; width: 100%; height: 100%; overflow: visible; }
`;
const Wick = styled.span`
  position: absolute; width: 4.6%; aspect-ratio: 7 / 13;
  transform: translate(-50%, -100%); transform-origin: 50% 100%;
  animation: ${ignite} 0.5s ${theme.motion.spring} var(--d) both;
`;
const Halo = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; left: 50%; top: 40%; width: 420%; aspect-ratio: 1; margin: -210% 0 0 -210%;
  border-radius: 50%; background: ${HALO};
  animation: ${breathe} var(--t) ease-in-out var(--o) infinite alternate;
`;
const Flame = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; inset: 0; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: ${FLAME}; transform-origin: 50% 100%;
  animation: ${flicker} var(--t) ease-in-out var(--o) infinite;
`;

function previewDay(): ChanukahStatus | null {
  try {
    const n = Number(new URLSearchParams(window.location.search).get('chanukah'));
    return n >= 1 && n <= 8 ? { candles: Math.floor(n), lit: true, zot: false, when: 'tonight' } : null;
  } catch { return null; }
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

export default function ChanukahLights({ now }: { now: Date }) {
  const preview = useMemo(previewDay, []);
  const status = preview ?? chanukahStatus(now);
  if (!status) return null;

  const { candles, lit } = status;
  const ord = HE.CHANUKAH_ORDINALS[candles - 1];
  const title = status.zot ? HE.CHANUKAH_ZOT : lit ? HE.CHANUKAH_LIT(ord) : HE.CHANUKAH_WHEN[status.when](ord);
  const sub = lit ? HE.CHANUKAH_LIT_SUB : status.when === 'before-shabbat' ? HE.CHANUKAH_BEFORE_SHABBAT : null;
  // The shamash first, then from the newest candle back to the first.
  const flames = [
    { x: SLOT_X[4], y: SHAMASH_Y - CANDLE_H, d: 0.5 },
    ...Array.from({ length: candles }, (_, i) => ({
      x: SLOT_X[candleSlot(i + 1)], y: CUP_Y - CANDLE_H, d: 0.95 + (candles - 1 - i) * 0.26,
    })),
  ];

  return (
    <Wrap>
      <div>
        <Kicker>{lit ? HE.CHANUKAH_KICKER_LIT : HE.CHANUKAH_KICKER}</Kicker>
        <Title>{title}</Title>
        {sub && <Sub>{sub}</Sub>}
      </div>
      <Stage aria-hidden="true">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none" stroke={theme.game.gold} strokeWidth="2.2" strokeLinecap="round">
          {[1, 2, 3, 4].map(k => (
            <path key={k} d={`M${90 - 19 * k} ${CUP_Y}A${19 * k} ${11.6 * k} 0 0 0 ${90 + 19 * k} ${CUP_Y}`} />
          ))}
          <path d={`M90 ${SHAMASH_Y}V94M70 99H110M78 99Q90 86 102 99`} />
          {SLOT_X.map((x, i) => (
            <path key={x} d={`M${x - 4.5} ${i === 4 ? SHAMASH_Y : CUP_Y}h9`} stroke={theme.game.goldLight} strokeWidth="3" />
          ))}
          {flames.map(f => (
            <rect key={f.x} x={f.x - 2.2} y={f.y} width="4.4" height={CANDLE_H - 1.5} rx="1.2" fill={theme.game.goldInk} stroke="none" />
          ))}
        </svg>
        {lit && flames.map((f, i) => (
          <Wick
            key={f.x}
            style={{
              left: pct(f.x, VB_W), top: pct(f.y + 1, VB_H),
              '--d': `${f.d}s`, '--t': `${1.1 + ((i * 37) % 60) / 100}s`, '--o': `-${(i * 0.31).toFixed(2)}s`,
            } as CSSProperties}
          >
            <Halo /><Flame />
          </Wick>
        ))}
      </Stage>
    </Wrap>
  );
}
