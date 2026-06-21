'use client';

import { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/rabbisData';

const MIN_YEAR = -1100;
const MAX_YEAR = 2030;
const SPAN = MAX_YEAR - MIN_YEAR;
const TRACK_PX = 5000;

function pct(year: number) { return ((year - MIN_YEAR) / SPAN) * 100; }
function px(year: number)  { return ((year - MIN_YEAR) / SPAN) * TRACK_PX; }

const ERA_BANDS = [
  { label: 'תנ״ך',           start: -1100, end:  -160, color: '#1A3A6B' },
  { label: 'זוגות + תנאים', start:  -160, end:   220, color: '#7A3B10' },
  { label: 'אמוראים',        start:   220, end:   600, color: '#9B2335' },
  { label: 'גאונים',          start:   600, end:  1050, color: '#2D6A4F' },
  { label: 'ראשונים',         start:  1050, end:  1500, color: '#1A5C8A' },
  { label: 'אחרונים ואילך',  start:  1500, end:  2030, color: '#5B3880' },
];
const TICKS = [-1000, -500, 0, 500, 1000, 1500, 2000];

const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); }`;

const Wrap      = styled.div`display:flex; flex-direction:column; gap:${theme.spacing.md};`;
const ScrollBox = styled.div`
  overflow-x: auto; border-radius: ${theme.radii.lg};
  scrollbar-width: thin; scrollbar-color: #c9a84c55 transparent;
  &::-webkit-scrollbar { height:5px; }
  &::-webkit-scrollbar-thumb { background:#c9a84c55; border-radius:3px; }
  box-shadow: 0 0 40px rgba(0,0,0,0.5);
`;
const Hint = styled.div`
  font-size:0.75rem; color:${theme.colors.textMuted}; text-align:center; letter-spacing:0.06em;
`;

const Track = styled.div`
  position: relative;
  width: ${TRACK_PX}px;
  height: 200px;
  background: linear-gradient(180deg,#06101e 0%,#0d1b2a 100%);
  overflow: visible;
`;
const Band = styled.div<{ $l:number; $w:number; $c:string }>`
  position:absolute; top:0; bottom:0;
  left:${p=>p.$l}px; width:${p=>p.$w}px;
  background:${p=>p.$c}1a; border-right:1px solid ${p=>p.$c}22;
`;
const EraLabel = styled.div<{ $l:number; $c:string }>`
  position:absolute; top:8px; left:${p=>p.$l+6}px;
  font-size:0.58rem; font-weight:700; letter-spacing:0.07em;
  color:${p=>p.$c}bb; white-space:nowrap; pointer-events:none;
`;
const Line = styled.div`
  position:absolute; top:106px; left:0; right:0; height:3px;
  background:linear-gradient(90deg,transparent,#c9a84c 4%,#f5d07a 50%,#c9a84c 96%,transparent);
  box-shadow:0 0 10px #c9a84c55;
`;
const Tick = styled.div<{ $l:number }>`
  position:absolute; top:105px; left:${p=>p.$l}px; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center;
`;
const TickMark  = styled.div`width:1px; height:12px; background:#c9a84c66;`;
const TickLabel = styled.div`
  font-size:0.55rem; font-weight:600; color:#c9a84c88;
  margin-top:2px; white-space:nowrap;
`;
const Node = styled.button<{ $c:string; $active:boolean }>`
  position:absolute; top:100px; width:16px; height:16px;
  border-radius:50%; transform:translateX(-50%);
  border:2px solid ${p=>p.$c};
  background:${p=>p.$active ? p.$c : '#0d1b2a'};
  box-shadow:${p=>p.$active ? `0 0 14px ${p.$c},0 0 28px ${p.$c}55` : `0 0 6px ${p.$c}55`};
  cursor:pointer; transition:all 0.2s; z-index:2;
  &:hover { background:${p=>p.$c}; box-shadow:0 0 14px ${p=>p.$c}; transform:translateX(-50%) scale(1.4); }
`;

const Detail = styled.div`
  background:${theme.colors.surface}; border:1px solid ${theme.colors.borderLight};
  border-radius:${theme.radii.lg}; padding:${theme.spacing.lg};
  animation:${fadeIn} 0.25s ease;
  display:flex; flex-direction:column; gap:${theme.spacing.sm};
`;
const DName    = styled.h3`font-family:${theme.fonts.body}; font-size:1.3rem; font-weight:700; color:${theme.colors.primary};`;
const DFull    = styled.div`font-size:0.85rem; color:${theme.colors.textMuted}; font-style:italic;`;
const DRow     = styled.div`display:flex; gap:${theme.spacing.sm}; flex-wrap:wrap;`;
const DCat     = styled.span<{ $c:string }>`
  font-size:0.75rem; font-weight:700; color:${p=>p.$c};
  border:1px solid ${p=>p.$c}44; background:${p=>p.$c}11;
  border-radius:${theme.radii.sm}; padding:2px ${theme.spacing.sm};
`;
const DDate    = styled.span`font-size:0.8rem; color:${theme.colors.textMuted};`;
const DBio     = styled.p`font-family:${theme.fonts.body}; font-size:0.9rem; line-height:1.75; color:${theme.colors.text};`;
const CloseBtn = styled.button`
  align-self:flex-end; font-size:0.78rem; color:${theme.colors.textMuted};
  border:1px solid ${theme.colors.borderLight}; border-radius:${theme.radii.sm};
  padding:2px ${theme.spacing.sm}; transition:all 0.15s;
  &:hover { color:${theme.colors.primary}; border-color:${theme.colors.primary}; }
`;

interface Props { rabbis: Rabbi[]; }

export default function RabbisTimeline({ rabbis }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() =>
    [...rabbis].sort((a, b) => a.sortYear - b.sortYear), [rabbis]);

  const selected = useMemo(() =>
    sorted.find(r => r.id === selectedId) ?? null, [sorted, selectedId]);

  const toggle = (id: string) =>
    setSelectedId(prev => prev === id ? null : id);

  return (
    <Wrap>
      <Hint>← גלול לחקירת ציר הזמן — לחץ על נקודה לפרטים →</Hint>
      <ScrollBox>
        <Track>
          {ERA_BANDS.map(b => (
            <Band key={b.label} $l={px(b.start)} $w={px(b.end)-px(b.start)} $c={b.color} />
          ))}
          {ERA_BANDS.map(b => (
            <EraLabel key={b.label} $l={px(b.start)} $c={b.color}>{b.label}</EraLabel>
          ))}
          <Line />
          {TICKS.map(y => (
            <Tick key={y} $l={px(y)}>
              <TickMark /><TickLabel>{y < 0 ? `${Math.abs(y)} לפנה״ס` : `${y} לסה״נ`}</TickLabel>
            </Tick>
          ))}
          {sorted.map(r => {
            const color = CATEGORY_COLORS[r.category as RabbiCategory] ?? '#888';
            return (
              <Node
                key={r.id}
                $c={color}
                $active={selectedId === r.id}
                style={{ left: px(r.sortYear) }}
                onClick={() => toggle(r.id)}
                title={r.name}
              />
            );
          })}
        </Track>
      </ScrollBox>

      {selected && (() => {
        const color = CATEGORY_COLORS[selected.category as RabbiCategory] ?? theme.colors.primaryLight;
        return (
          <Detail>
            <CloseBtn onClick={() => setSelectedId(null)}>✕ סגור</CloseBtn>
            <DName>{selected.name}</DName>
            {selected.fullName && <DFull>{selected.fullName}</DFull>}
            <DRow>
              <DCat $c={color}>{CATEGORY_LABELS[selected.category as RabbiCategory] ?? selected.category}</DCat>
              <DDate>{selected.datePeriod}</DDate>
            </DRow>
            <DBio>{selected.bio}</DBio>
          </Detail>
        );
      })()}
    </Wrap>
  );
}
