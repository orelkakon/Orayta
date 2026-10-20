'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { learnKind } from '@/lib/dailyLearning/kinds';
import { useLearnToday } from '@/components/LearnView/useLearnData';
import { useLearnLog } from '@/components/LearnView/useLearnLog';
import type { LearnItem } from '@/types/dailyLearning';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;
const CardHeader = styled.div`
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-weight: 700;
  font-size: 1rem;
  font-family: ${theme.fonts.body};
`;
const Body = styled.div`display: flex; flex-direction: column;`;
const Row = styled.div`
  display: flex; align-items: center;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const Item = styled(Link)`
  flex: 1; min-width: 0;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-decoration: none;
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast} ease;
  &:hover { background: ${theme.colors.surfaceAlt}; }
  &:active { transform: scale(0.98); background: ${theme.colors.surfaceAlt}; }
`;
const Texts = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
const ItemType = styled.span`font-size: 0.75rem; color: ${theme.colors.textMuted}; font-weight: 600;`;
const ItemValue = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;
const Done = styled.span`
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.success};
`;
const Chevron = styled.span`color: ${theme.colors.textLight}; font-size: 1.1rem; line-height: 1;`;
const External = styled.a`
  align-self: stretch; display: flex; align-items: center; padding: 0 ${theme.spacing.md};
  font-size: 0.85rem; color: ${theme.colors.textLight};
  border-inline-start: 1px solid ${theme.colors.borderLight};
  &:hover { color: ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt}; }
`;
const MoreBtn = styled.button`
  width: 100%; min-height: 44px; font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};
  border-top: 1px solid ${theme.colors.borderLight};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;
const ParashaRow = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ParashaLabel = styled.span`font-size: 0.85rem; color: ${theme.colors.textMuted};`;
const ParashaVal = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.secondary};
`;
const Placeholder = styled.div`
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
  button { color: ${theme.colors.secondary}; font-weight: 700; min-height: 36px; }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const Spinner = styled.span`
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation-duration: 2.4s; }
`;
const LoadingBox = styled.div`
  min-height: 120px;
  display: flex; align-items: center; justify-content: center;
`;

/** Today's learning cycles — each opens the in-app reader; ✓ marks what was learned today. */
export default function DafYomiCard() {
  const { load, retry } = useLearnToday();
  const log = useLearnLog();
  const [more, setMore] = useState(false);

  const items = load.state === 'ready' ? load.data.items : [];
  const primary = items.filter(i => learnKind(i.kind).primary);
  const rest = items.filter(i => !learnKind(i.kind).primary);
  const shown = more ? [...primary, ...rest] : primary;

  const row = (it: LearnItem) => {
    const label = learnKind(it.kind).label;
    const done = log.isDone(it.kind);
    return (
      <Row key={it.kind}>
        <Item href={`/today/learn/${it.kind}`}>
          <Texts><ItemType>{label}</ItemType><ItemValue>{it.he}</ItemValue></Texts>
          {done
            ? <Done aria-label={HE.LEARN_DONE_ARIA}><LineIcon name="check" size={15} strokeWidth={2.6} /></Done>
            : <Chevron aria-hidden>‹</Chevron>}
        </Item>
        <External href={it.url} target="_blank" rel="noopener noreferrer" aria-label={HE.LEARN_EXTERNAL_ARIA(label)}>↗</External>
      </Row>
    );
  };

  return (
    <Card>
      <CardHeader>{HE.TODAY_DAF_TITLE}</CardHeader>
      <Body>
        {load.state === 'loading' && <LoadingBox role="status" aria-label={HE.LOADING}><Spinner aria-hidden="true" /></LoadingBox>}
        {load.state === 'error' && <Placeholder>{HE.TODAY_ERROR}<button onClick={retry}>{HE.LEARN_RETRY}</button></Placeholder>}
        {shown.map(row)}
        {rest.length > 0 && (
          <MoreBtn onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? HE.LEARN_LESS : HE.LEARN_MORE}</MoreBtn>
        )}
        {load.state === 'ready' && load.data.parasha && (
          <ParashaRow>
            <ParashaLabel>{HE.TODAY_PARASHA}</ParashaLabel>
            <ParashaVal>{load.data.parasha}</ParashaVal>
          </ParashaRow>
        )}
      </Body>
    </Card>
  );
}
