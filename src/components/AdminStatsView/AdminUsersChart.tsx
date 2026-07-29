'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { niceMax, shortDay } from '@/lib/adminStatsUtils';
import type { AdminDailyRow } from '@/types';

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const CardTitle = styled.h2`font-size: 0.95rem; font-weight: 700; color: ${theme.colors.text};`;
const CardSub = styled.span`font-size: 0.75rem; color: ${theme.colors.textLight};`;

/* Time axis reads left→right even on an RTL page */
const PlotWrap = styled.div`direction: ltr; position: relative; width: 100%;`;

const Tooltip = styled.div<{ $x: number }>`
  position: absolute; top: 0; left: ${p => p.$x}%;
  transform: translateX(-50%);
  background: ${theme.colors.text}; color: ${theme.colors.surface};
  font-size: 0.72rem; font-weight: 600; white-space: nowrap;
  padding: 4px 9px; border-radius: ${theme.radii.sm};
  pointer-events: none; direction: rtl; z-index: 2;
`;

const W = 660;
const H = 190;
const PAD_L = 34;
const PAD_R = 6;
const PAD_T = 16;
const PAD_B = 20;

function barPath(x: number, w: number, y: number, baseY: number): string {
  const r = Math.min(4, w / 2, Math.max(0, baseY - y));
  return `M ${x} ${baseY} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y}
    L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${baseY} Z`;
}

export default function AdminUsersChart({ daily }: { daily: AdminDailyRow[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const max = niceMax(Math.max(4, ...daily.map(d => d.users)));
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const baseY = PAD_T + plotH;
  const slot = plotW / daily.length;
  const barW = Math.min(24, slot * 0.62);
  const yFor = (v: number) => baseY - (v / max) * plotH;

  const ticks = [0, max / 2, max];

  return (
    <Card>
      <div>
        <CardTitle>{HE.ADMIN_CHART_TITLE}</CardTitle>{' '}
        <CardSub>{HE.ADMIN_CHART_SUB}</CardSub>
      </div>
      <PlotWrap>
        {hover !== null && (
          <Tooltip $x={((PAD_L + hover * slot + slot / 2) / W) * 100}>
            {shortDay(daily[hover].day)} · {daily[hover].users.toLocaleString('he-IL')} {HE.ADMIN_CHART_UNIT}
          </Tooltip>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={HE.ADMIN_CHART_TITLE}>
          {ticks.map(t => (
            <g key={t}>
              <line
                x1={PAD_L} x2={W - PAD_R} y1={yFor(t)} y2={yFor(t)}
                stroke={theme.colors.borderLight} strokeWidth={1}
              />
              <text
                x={PAD_L - 6} y={yFor(t) + 3} textAnchor="end"
                fontSize={9} fill={theme.colors.textLight} fontFamily={theme.fonts.ui}
              >
                {t.toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {daily.map((d, i) => {
            const x = PAD_L + i * slot + (slot - barW) / 2;
            return (
              <g key={d.day}>
                {d.users > 0 && (
                  <path
                    d={barPath(x, barW, yFor(d.users), baseY)}
                    fill={hover === i ? theme.colors.secondary : theme.colors.primary}
                  />
                )}
                {i % 5 === 0 && (
                  <text
                    x={PAD_L + i * slot + slot / 2} y={H - 5} textAnchor="middle"
                    fontSize={9} fill={theme.colors.textLight} fontFamily={theme.fonts.ui}
                  >
                    {shortDay(d.day)}
                  </text>
                )}
                <rect
                  x={PAD_L + i * slot} y={PAD_T} width={slot} height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onTouchStart={() => setHover(i)}
                />
              </g>
            );
          })}
        </svg>
      </PlotWrap>
    </Card>
  );
}
