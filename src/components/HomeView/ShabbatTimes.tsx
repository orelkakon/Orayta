'use client';

import { CSSProperties, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ShabbatStatus, countdownParts, shabbatPreview, shabbatStatus } from '@/lib/shabbat';
import { timeFmt } from './todayInfo';

/**
 * The hero's Shabbat block, from Friday until Shabbat goes out (Jerusalem):
 * a live countdown to candle lighting (the hero's clock ticks each minute),
 * then "שבת שלום", over three tiles — candle lighting, Shabbat's end and
 * Rabbeinu Tam. `/?shabbat=1` previews Friday at this clock time, `=2` just
 * after candle lighting.
 */
function previewMode(): number {
  try { return Number(new URLSearchParams(window.location.search).get('shabbat')) || 0; }
  catch { return 0; }
}

/** The hero's Shabbat status (or the URL preview); null outside Friday/Shabbat or before the clock is known. */
export function useShabbatStatus(now: Date | null): ShabbatStatus | null {
  const preview = useMemo(() => (typeof window === 'undefined' ? 0 : previewMode()), []);
  if (!now) return null;
  return preview ? shabbatPreview(now, preview) : shabbatStatus(now);
}

const pop = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

const Wrap = styled.div`margin-top: ${theme.spacing.md};`;
const Kicker = styled.p`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; letter-spacing: 0.04em; color: ${theme.game.gold};
`;
const Title = styled.p`
  margin-top: 2px; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.xl}; font-weight: 700; line-height: 1.2; color: ${theme.gilded.nightInk};
  font-variant-numeric: tabular-nums;
`;
const Tiles = styled.dl`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;
const Tile = styled.div<{ $past: boolean }>`
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.ms};
  border-radius: ${theme.radii.md};
  background: ${theme.gilded.nightTag}; border: 1px solid ${theme.gilded.nightLine};
  opacity: ${p => (p.$past ? 0.6 : 1)};
  animation: ${pop} 0.45s ${theme.motion.outStrong} calc(0.7s + var(--i) * 80ms) both;
`;
const Label = styled.dt`
  font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.gilded.nightMuted};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
`;
const Time = styled.dd`
  margin: 0; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.lg}; font-weight: 700; line-height: 1.15;
  color: ${theme.game.goldLight}; font-variant-numeric: tabular-nums;
`;

export default function ShabbatTimes({ status }: { status: ShabbatStatus }) {
  const erev = status.phase === 'erev';
  const { h, m } = countdownParts(status.minutesToCandles);
  const tiles = [
    { label: HE.SHABBAT_CANDLES, at: status.candles, past: !erev },
    { label: HE.SHABBAT_ENDS, at: status.ends, past: false },
    { label: HE.SHABBAT_RT, at: status.rabbeinuTam, past: false },
  ];

  return (
    <Wrap>
      <Kicker>{erev ? HE.SHABBAT_KICKER_EREV : HE.SHABBAT_KICKER}</Kicker>
      <Title>{erev ? HE.SHABBAT_COUNTDOWN(h, m) : HE.SHABBAT_GREETING}</Title>
      <Tiles aria-label={HE.SHABBAT_TIMES_ARIA}>
        {tiles.map((t, i) => (
          <Tile key={t.label} $past={t.past} style={{ '--i': i } as CSSProperties}>
            <Label>{t.label}</Label>
            <Time>{timeFmt(t.at)}</Time>
          </Tile>
        ))}
      </Tiles>
    </Wrap>
  );
}
