'use client';

import { CSSProperties, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ShabbatStatus, countdownParts, shabbatPreview, shabbatStatus } from '@/lib/shabbat';
import { LineIcon } from '@/components/common/LineIcons';
import CityTable from './CityTable';

const ShabbatShareSheet = dynamic(() => import('./ShabbatShareSheet'), { ssr: false });

/**
 * The hero's Shabbat block, from Friday until Shabbat goes out: a live
 * countdown to candle lighting (the hero's clock ticks each minute) over a
 * thin line of Friday's remaining daylight, then "שבת שלום"; Jerusalem and
 * Tel Aviv times in a gilded luach; and on Friday a button that makes a short
 * Shabbat-times clip to share. `/?shabbat=1` previews Friday at this clock
 * time, `=2` just after candle lighting.
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

const HERO_CITIES = 2;
const grow = keyframes`from { transform: scaleX(0); } to { transform: scaleX(var(--p)); }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const shimmer = keyframes`from { background-position: 200% 0; } to { background-position: -100% 0; }`;

const Wrap = styled.div`margin-top: ${theme.spacing.md};`;
const Kicker = styled.p`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; letter-spacing: 0.04em; color: ${theme.game.gold};
`;
const Title = styled.p`
  margin-top: 2px; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.xl}; font-weight: 700; line-height: 1.2; color: ${theme.gilded.nightInk};
  font-variant-numeric: tabular-nums;
`;

/* Friday's daylight running out toward candle lighting; the tip glows like a wick. */
const Track = styled.div`
  position: relative; height: 3px; margin-top: ${theme.spacing.sm}; border-radius: ${theme.radii.pill};
  background: ${theme.gilded.nightLine};
`;
const Fill = styled.div`
  position: absolute; inset: 0; border-radius: inherit; transform-origin: right center;
  background: linear-gradient(to left, ${theme.game.goldDeep}, ${theme.game.goldLight});
  transform: scaleX(var(--p));
  animation: ${grow} 1.2s ${theme.motion.outStrong} 0.5s both;
`;
const Tip = styled.i`
  position: absolute; top: 50%; right: calc(var(--p) * 100%); width: 9px; height: 9px; margin: -4.5px -4.5px 0 0;
  border-radius: 50%; background: ${theme.game.goldInk};
  box-shadow: 0 0 0 3px ${theme.game.goldGlow}, 0 0 12px 3px ${theme.game.goldGlow};
  animation: ${fadeIn} 0.4s ease-out 1.5s both;
`;

const ShareBtn = styled.button`
  position: relative; overflow: hidden; width: 100%; margin-top: ${theme.spacing.ms};
  display: flex; align-items: center; gap: ${theme.spacing.ms}; text-align: start;
  min-height: 56px; padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.lg}; border: 1px solid ${theme.gilded.nightLine};
  color: ${theme.gilded.nightInk}; cursor: pointer; font: inherit;
  background:
    linear-gradient(100deg, transparent 30%, ${theme.game.goldGlow} 50%, transparent 70%) 0 0 / 200% 100%,
    ${theme.gilded.nightGhost};
  animation: ${shimmer} 3.2s ${theme.motion.inOut} 2.2s 2 both;
  transition: transform ${theme.motion.fast}, background-color ${theme.motion.fast};
  &:active { transform: scale(0.98); }
  @media (hover: hover) and (pointer: fine) { &:hover { background-color: ${theme.gilded.nightGhostHi}; } }
`;
const ShareIcon = styled.span`
  display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
`;
const ShareText = styled.span`display: flex; flex-direction: column; flex: 1; min-width: 0;`;
const ShareMain = styled.span`font-weight: 800; font-size: ${theme.fontSizes.md};`;
const ShareSub = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.gilded.nightMuted};`;

interface Props { status: ShabbatStatus; parasha: string | null }

export default function ShabbatTimes({ status, parasha }: Props) {
  // Mounted on first open and kept, so the sheet can animate both ways.
  const [sharing, setSharing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const erev = status.phase === 'erev';
  const { h, m } = countdownParts(status.minutesToCandles);
  const p = status.dayProgress;

  return (
    <Wrap>
      <Kicker>{erev ? HE.SHABBAT_KICKER_EREV : HE.SHABBAT_KICKER}</Kicker>
      <Title>{erev ? HE.SHABBAT_COUNTDOWN(h, m) : HE.SHABBAT_GREETING}</Title>
      {erev && (
        <Track role="img" aria-label={HE.SHABBAT_DAY_ARIA(Math.round(p * 100))} style={{ '--p': p.toFixed(3) } as CSSProperties}>
          <Fill /><Tip />
        </Track>
      )}
      <CityTable cities={status.cities.slice(0, HERO_CITIES)} lit={!erev} />
      {erev && (
        <>
          <ShareBtn type="button" onClick={() => { setMounted(true); setSharing(true); }}>
            <ShareIcon><LineIcon name="share" size={18} strokeWidth={2} /></ShareIcon>
            <ShareText>
              <ShareMain>{HE.SHABBAT_SHARE_CTA}</ShareMain>
              <ShareSub>{HE.SHABBAT_SHARE_CTA_SUB}</ShareSub>
            </ShareText>
            <LineIcon name="chevron" size={18} />
          </ShareBtn>
          {mounted && <ShabbatShareSheet open={sharing} status={status} parasha={parasha} onClose={() => setSharing(false)} />}
        </>
      )}
    </Wrap>
  );
}
