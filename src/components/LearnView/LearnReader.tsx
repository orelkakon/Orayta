'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { LearnKind } from '@/types/dailyLearning';
import { learnKind } from '@/lib/dailyLearning/kinds';
import { useSiddurFont } from '@/components/SiddurView/useSiddurFont';
import { useLearnText, useLearnToday } from './useLearnData';
import { useLearnLog } from './useLearnLog';
import LearnHeader from './LearnHeader';
import LearnTextView from './LearnTextView';
import LearnFooter from './LearnFooter';

const EXPLAIN_KEY = 'orayta_learn_explain';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const shimmer = keyframes`0%, 100% { opacity: 0.5; } 50% { opacity: 1; }`;
const Skeleton = styled.div`
  max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 14px;
  span { height: 16px; border-radius: 8px; background: ${theme.colors.surfaceAlt}; animation: ${shimmer} 1.4s ease-in-out infinite; }
  span:nth-child(3n) { width: 78%; } span:nth-child(4n) { width: 90%; }
  @media (prefers-reduced-motion: reduce) { span { animation: none; } }
`;

const ErrorBox = styled.div`
  max-width: 720px; margin: 0 auto; width: 100%; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.md}; color: ${theme.colors.textMuted};
  border-radius: ${theme.radii.lg}; border: 1px dashed ${theme.colors.border};
`;

const RetryBtn = styled.button`
  min-height: 40px; padding: 0 20px; border-radius: 999px; font-weight: 700;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.primary};
`;

/** /today/learn/[kind] — today's portion of a learning cycle, read in-app. */
export default function LearnReader({ kind }: { kind: LearnKind }) {
  const def = learnKind(kind);
  const font = useSiddurFont();
  const [explain, setExplain] = useState(false);
  const { load: today } = useLearnToday();
  const { load, retry } = useLearnText(kind, def.explain && explain);
  const log = useLearnLog();

  useEffect(() => { try { setExplain(localStorage.getItem(EXPLAIN_KEY) === '1'); } catch {} }, []);
  const toggleExplain = () => setExplain(v => {
    try { localStorage.setItem(EXPLAIN_KEY, v ? '0' : '1'); } catch {}
    return !v;
  });

  const items = today.state === 'ready' ? today.data.items : [];
  const heRef = load.state === 'ready' ? load.data.heRef : items.find(i => i.kind === kind)?.he ?? null;

  return (
    <Page style={{ '--siddur-scale': font.scale } as React.CSSProperties}>
      <LearnHeader def={def} heRef={heRef} items={items} isDone={log.isDone}
        explain={explain} onExplain={toggleExplain} font={font} />
      {load.state === 'loading' && <Skeleton aria-busy aria-label={HE.LOADING}>{Array.from({ length: 12 }, (_, i) => <span key={i} />)}</Skeleton>}
      {load.state === 'error' && (
        <ErrorBox role="alert">
          {load.notToday ? HE.LEARN_NOT_TODAY : HE.LEARN_ERROR}
          {!load.notToday && <RetryBtn onClick={retry}>{HE.LEARN_RETRY}</RetryBtn>}
        </ErrorBox>
      )}
      {load.state === 'ready' && (
        <>
          <LearnTextView text={load.data} />
          <LearnFooter done={log.isDone(kind)} streak={log.streak(kind)} onToggle={() => log.toggle(kind)}
            version={load.data.version} license={load.data.license} url={load.data.url} />
        </>
      )}
    </Page>
  );
}
