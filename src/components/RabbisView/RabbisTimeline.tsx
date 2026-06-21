'use client';

import { useState, useMemo, Fragment } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';

const reveal = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Outer wrapper ─────────────────────────────── */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

/* ── Generic row: flex, RTL → first child is on the RIGHT ── */
const Row = styled.div`
  display: flex;
  align-items: stretch;
`;

/* ── Dot column (RIGHT side in RTL, 28px wide) ── */
const DotCol = styled.div`
  width: 28px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* Thin line segment that fills space between dots */
const Seg = styled.div<{ $flex?: boolean; $h?: string }>`
  width: 2px;
  background: ${theme.colors.border};
  opacity: 0.5;
  ${p => p.$flex ? 'flex: 1; min-height: 4px;' : `height: ${p.$h ?? '8px'};`}
`;

/* Circle dot for each rabbi */
const Dot = styled.div<{ $c: string; $on: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => (p.$on ? p.$c : theme.colors.surface)};
  border: 2.5px solid ${p => p.$c};
  box-shadow: 0 0 0 3px ${theme.colors.background};
  transition: background 0.15s;
  z-index: 1;
`;

/* Diamond for era section headers */
const Diamond = styled.div<{ $c: string }>`
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  transform: rotate(45deg);
  background: ${p => p.$c};
  box-shadow: 0 0 0 3px ${theme.colors.background};
  z-index: 1;
`;

/* ── Section header ─────────────────────────────── */
const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: ${theme.spacing.lg} ${theme.spacing.sm} ${theme.spacing.xs};
`;

const EraChip = styled.span<{ $c: string }>`
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${p => p.$c};
  background: ${p => p.$c}14;
  border: 1px solid ${p => p.$c}44;
  padding: 3px ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
`;

/* ── Entry row ──────────────────────────────────── */
const EntryRow = styled.div<{ $on: boolean }>`
  display: flex;
  align-items: stretch;
  cursor: pointer;
  border-radius: ${theme.radii.sm};
  transition: background 0.12s;
  background: ${p => (p.$on ? theme.colors.surfaceAlt : 'transparent')};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const EntryContent = styled.div`
  flex: 1;
  min-width: 0;
  padding: 8px ${theme.spacing.sm} 8px 0;
`;

const EntryTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const EntryName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.97rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  line-height: 1.3;
`;

const EntryDate = styled.span`
  font-size: 0.72rem;
  color: ${theme.colors.textMuted};
  direction: ltr;
  flex-shrink: 0;
  white-space: nowrap;
`;

const EntryDetail = styled.div`
  margin-top: ${theme.spacing.xs};
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: ${reveal} 0.2s ease;
`;

const FullName = styled.div`
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  font-style: italic;
`;

const AliveBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${theme.colors.success};
  background: ${theme.colors.bgSuccess};
  border-radius: ${theme.radii.sm};
  padding: 1px ${theme.spacing.sm};
  align-self: flex-start;
`;

const BioParagraph = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 0.88rem;
  line-height: 1.75;
  color: ${theme.colors.text};
  border-right: 2px solid ${theme.colors.borderLight};
  padding-right: ${theme.spacing.sm};
`;

const Hint = styled.div`
  font-size: 0.74rem;
  color: ${theme.colors.textLight};
  text-align: center;
  margin-bottom: ${theme.spacing.xs};
`;

const Empty = styled.div`
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
`;

/* ── Component ────────────────────────────────── */
interface Props { rabbis: Rabbi[]; }

export default function RabbisTimeline({ rabbis }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Rabbi[]>();
    for (const r of rabbis) {
      const arr = map.get(r.category) ?? [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return CATEGORY_ORDER
      .filter(cat => map.has(cat))
      .map(cat => ({
        cat: cat as RabbiCategory,
        items: (map.get(cat) ?? []).sort((a, b) => a.sortYear - b.sortYear),
      }));
  }, [rabbis]);

  if (rabbis.length === 0) return <Empty>אין תוצאות</Empty>;

  const lastGroupIdx = groups.length - 1;

  return (
    <>
      <Hint>לחץ על שם לפרטים נוספים</Hint>
      <Wrap>
        {groups.map(({ cat, items }, gi) => {
          const color = CATEGORY_COLORS[cat];
          const lastItemIdx = items.length - 1;

          return (
            <Fragment key={cat}>
              {/* Era section header */}
              <Row>
                <DotCol>
                  {gi > 0 && <Seg $flex />}
                  <Diamond $c={color} />
                  <Seg $h="12px" />
                </DotCol>
                <HeaderContent>
                  <EraChip $c={color}>{CATEGORY_LABELS[cat]}</EraChip>
                </HeaderContent>
              </Row>

              {/* Rabbi entries */}
              {items.map((r, ri) => {
                const isOn = expandedId === r.id;
                const needLineBelow = ri < lastItemIdx || gi < lastGroupIdx;

                return (
                  <EntryRow
                    key={r.id}
                    $on={isOn}
                    onClick={() => setExpandedId(p => (p === r.id ? null : r.id))}
                  >
                    <DotCol>
                      <Seg $h="9px" />
                      <Dot $c={color} $on={isOn} />
                      {needLineBelow && <Seg $flex />}
                    </DotCol>

                    <EntryContent>
                      <EntryTop>
                        <EntryName>{r.name}</EntryName>
                        <EntryDate>{r.datePeriod}</EntryDate>
                      </EntryTop>
                      {isOn && (
                        <EntryDetail>
                          {r.fullName && <FullName>{r.fullName}</FullName>}
                          {r.isAlive && <AliveBadge>⬤ חי ופועל</AliveBadge>}
                          <BioParagraph>{r.bio}</BioParagraph>
                        </EntryDetail>
                      )}
                    </EntryContent>
                  </EntryRow>
                );
              })}
            </Fragment>
          );
        })}
      </Wrap>
    </>
  );
}
