'use client';

import { useState, useMemo, Fragment } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* The outer wrapper draws the vertical guide line via ::before.
   padding-right: 28px reserves space for the line + dots on the RIGHT (RTL). */
const Wrap = styled.div`
  position: relative;
  padding-right: 28px;
  &::before {
    content: '';
    position: absolute;
    right: 13px; top: 0; bottom: 0; width: 2px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${theme.colors.border} 4%,
      ${theme.colors.border} 96%,
      transparent 100%
    );
  }
`;

/* Each row is position:relative so the dot/diamond can be placed on the line */
const Row = styled.div<{ $click?: boolean; $active?: boolean }>`
  position: relative;
  padding: 7px 0;
  border-radius: ${theme.radii.sm};
  transition: background 0.12s;
  cursor: ${p => (p.$click ? 'pointer' : 'default')};
  background: ${p => (p.$active ? theme.colors.surfaceAlt : 'transparent')};
  ${p => p.$click && `&:hover { background: ${theme.colors.surfaceAlt}; }`}
`;

/* Circle dot for each rabbi — centered on the line (right:7px → center at 13px from right) */
const Dot = styled.div<{ $c: string; $on: boolean }>`
  position: absolute;
  right: 7px; top: 10px;
  width: 12px; height: 12px; border-radius: 50%;
  background: ${p => (p.$on ? p.$c : theme.colors.surface)};
  border: 2px solid ${p => p.$c};
  box-shadow: 0 0 0 2px ${theme.colors.background};
  z-index: 1;
  transition: background 0.15s, box-shadow 0.15s;
  ${p => p.$on && `box-shadow: 0 0 0 3px ${p.$c}33, 0 0 0 2px ${theme.colors.background};`}
`;

/* Diamond marker for era section headers */
const Diamond = styled.div<{ $c: string }>`
  position: absolute;
  right: 7px; top: 10px;
  width: 12px; height: 12px;
  transform: rotate(45deg);
  background: ${p => p.$c};
  box-shadow: 0 0 0 2px ${theme.colors.background};
  z-index: 1;
`;

const EraChip = styled.span<{ $c: string }>`
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  color: ${p => p.$c};
  background: ${p => p.$c}12;
  border: 1px solid ${p => p.$c}33;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
`;

const EntryTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const EntryName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.95rem; font-weight: 600;
  color: ${theme.colors.primary};
`;

const EntryDate = styled.span`
  font-size: 0.72rem;
  color: ${theme.colors.textMuted};
  direction: ltr;
  flex-shrink: 0;
`;

const EntryBio = styled.p`
  margin-top: ${theme.spacing.xs};
  font-family: ${theme.fonts.body};
  font-size: 0.88rem; line-height: 1.75;
  color: ${theme.colors.text};
  border-right: 2px solid ${theme.colors.borderLight};
  padding-right: ${theme.spacing.sm};
  animation: ${fadeIn} 0.2s ease;
`;

const Empty = styled.div`
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.textLight};
  text-align: center;
  margin-bottom: ${theme.spacing.sm};
`;

interface Props { rabbis: Rabbi[]; }

export default function RabbisTimeline({ rabbis }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Rabbi[]>();
    for (const r of rabbis) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return CATEGORY_ORDER
      .filter(cat => map.has(cat))
      .map(cat => ({
        cat: cat as RabbiCategory,
        items: (map.get(cat) ?? []).sort((a, b) => a.sortYear - b.sortYear),
      }));
  }, [rabbis]);

  if (rabbis.length === 0) return <Empty>אין תוצאות</Empty>;

  return (
    <>
      <Hint>לחץ על שם לפרטים</Hint>
      <Wrap>
        {groups.map(({ cat, items }) => {
          const color = CATEGORY_COLORS[cat];
          return (
            <Fragment key={cat}>
              <Row style={{ marginTop: theme.spacing.md }}>
                <Diamond $c={color} />
                <EraChip $c={color}>{CATEGORY_LABELS[cat]}</EraChip>
              </Row>

              {items.map(r => {
                const isOn = expandedId === r.id;
                return (
                  <Row
                    key={r.id}
                    $click
                    $active={isOn}
                    onClick={() => setExpandedId(p => (p === r.id ? null : r.id))}
                  >
                    <Dot $c={color} $on={isOn} />
                    <EntryTop>
                      <EntryName>{r.name}</EntryName>
                      <EntryDate>{r.datePeriod}</EntryDate>
                    </EntryTop>
                    {isOn && <EntryBio>{r.bio}</EntryBio>}
                  </Row>
                );
              })}
            </Fragment>
          );
        })}
      </Wrap>
    </>
  );
}
