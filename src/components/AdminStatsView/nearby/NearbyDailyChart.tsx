'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { niceMax, shortDay } from '@/lib/adminStatsUtils';
import { NEARBY_FEATURES, NearbyAdminStats } from '@/types/nearbyStats';
import { Section, SectionTitle, CardSub } from '../rabbiBot/adminBotStyles';
import { SERIES } from './nearbyStyles';

/* Time axis reads left→right even on an RTL page. */
const PlotWrap = styled.div`direction: ltr; position: relative; width: 100%;`;

const Tooltip = styled.div<{ $x: number }>`
  position: absolute; top: 0; left: ${p => p.$x}%; transform: translateX(-50%);
  background: ${theme.colors.text}; color: ${theme.colors.surface};
  font-size: 0.72rem; font-weight: 600; white-space: nowrap; line-height: 1.5;
  padding: 4px 9px; border-radius: ${theme.radii.sm};
  pointer-events: none; direction: rtl; z-index: 2;
`;

const Legend = styled.div`display: flex; gap: ${theme.spacing.ms}; flex-wrap: wrap; font-size: 0.75rem; color: ${theme.colors.textMuted};`;
const Key = styled.span`display: inline-flex; align-items: center; gap: 5px;`;
const Swatch = styled.span<{ $c: string }>`width: 10px; height: 10px; border-radius: 3px; background: ${p => p.$c};`;

const W = 660, H = 170, PAD_L = 30, PAD_R = 6, PAD_T = 12, PAD_B = 20, GAP = 2;

/** Rounded top only — the segment that ends the stack. */
function topPath(x: number, w: number, y: number, bottom: number): string {
  const r = Math.min(4, w / 2, Math.max(0, bottom - y));
  return `M ${x} ${bottom} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${bottom} Z`;
}

/** Searches per day, stacked by feature. */
export default function NearbyDailyChart({ daily }: { daily: NearbyAdminStats['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const totals = daily.map(d => d.minyan + d.mikveh + d.kivrei);
  const max = niceMax(Math.max(4, ...totals));
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B, baseY = PAD_T + plotH;
  const slot = plotW / daily.length;
  const barW = Math.min(26, slot * 0.6);
  const yFor = (v: number) => baseY - (v / max) * plotH;
  const h = hover === null ? null : daily[hover];

  return (
    <Section>
      <SectionTitle>{HE.NS_CHART_TITLE} <CardSub>{HE.NS_CHART_SUB}</CardSub></SectionTitle>
      <Legend>
        {NEARBY_FEATURES.map(f => <Key key={f}><Swatch $c={SERIES[f]} />{HE.NS_FEATURE[f]}</Key>)}
      </Legend>
      <PlotWrap>
        {h && hover !== null && (
          <Tooltip $x={((PAD_L + hover * slot + slot / 2) / W) * 100}>
            {shortDay(h.day)} · {HE.NS_CHART_DAY_TOTAL(totals[hover])}
            {NEARBY_FEATURES.map(f => <div key={f}>{HE.NS_FEATURE[f]}: {h[f]}</div>)}
          </Tooltip>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={HE.NS_CHART_TITLE}>
          {[0, max / 2, max].map(t => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yFor(t)} y2={yFor(t)} stroke={theme.colors.borderLight} strokeWidth={1} />
              <text x={PAD_L - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9} fill={theme.colors.textLight} fontFamily={theme.fonts.ui}>
                {t.toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {daily.map((d, i) => {
            const x = PAD_L + i * slot + (slot - barW) / 2;
            const present = NEARBY_FEATURES.filter(f => d[f] > 0);
            let acc = 0;
            return (
              <g key={d.day} opacity={hover === null || hover === i ? 1 : 0.55}>
                {present.map((f, k) => {
                  const bottom = yFor(acc) - (k > 0 ? GAP : 0);
                  acc += d[f];
                  const top = yFor(acc);
                  if (bottom - top <= 0) return null;
                  return k === present.length - 1
                    ? <path key={f} d={topPath(x, barW, top, bottom)} fill={SERIES[f]} />
                    : <rect key={f} x={x} y={top} width={barW} height={bottom - top} fill={SERIES[f]} />;
                })}
                {i % 3 === 0 && (
                  <text x={PAD_L + i * slot + slot / 2} y={H - 5} textAnchor="middle" fontSize={9} fill={theme.colors.textLight} fontFamily={theme.fonts.ui}>
                    {shortDay(d.day)}
                  </text>
                )}
                <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={plotH} fill="transparent"
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)} />
              </g>
            );
          })}
        </svg>
      </PlotWrap>
    </Section>
  );
}
