'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi } from '@/types';
import { addStat } from '@/lib/statsStorage';
import { haptics } from '@/lib/haptics';
import { pickChronoSet, scoreOrder, chronoSorted, moveItem } from '@/lib/chronoQuiz';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn, HintBtn,
  QuestionBlock, answerFeedback, isMilestone,
} from '../quizChrome';
import ChronoList from './ChronoList';
import { useDragReorder } from './useDragReorder';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; }
`;
const Prompt = styled.p`margin: 0; font-size: 0.92rem; color: ${theme.colors.textMuted};`;
const CheckBtn = styled(NextBtn)`align-self: stretch;`;
const Banner = styled(ResultBanner)`text-align: center;`;
const SrOnly = styled.div`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

type Phase = 'arrange' | 'checked';

interface Props { onAnswered: () => void; }

export default function ChronoQuiz({ onAnswered }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<Rabbi[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('arrange');
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [live, setLive] = useState('');
  const focusId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef(0);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
    return () => window.clearTimeout(revealTimer.current);
  }, []);

  const deal = useCallback((list: Rabbi[], s: number) => {
    const size = s >= 3 ? 5 : 4;
    const level = Math.random() < 0.3 + 0.1 * Math.min(s, 4) ? 'hard' : 'easy';
    const set = pickChronoSet(list, size, level);
    window.clearTimeout(revealTimer.current);
    setItems(set ?? []);
    setOrder(set ? set.map(r => r.id) : []);
    setPhase('arrange'); setMarks(null); setHint(false); setSelected(null); setLive('');
  }, []);

  useEffect(() => { if (all.length) deal(all, 0); }, [all, deal]);

  const byId = new Map(items.map(r => [r.id, r]));
  const nameOf = (id: string) => byId.get(id)?.name ?? '';
  const announce = (id: string, next: string[]) => setLive(HE.QUIZ_CHRONO_MOVED(nameOf(id), next.indexOf(id) + 1, next.length));

  const onTap = (id: string) => {
    if (phase !== 'arrange') return;
    if (!selected || selected === id) {
      setSelected(selected === id ? null : id);
      if (selected !== id) setLive(HE.QUIZ_CHRONO_SELECTED(nameOf(id)));
      haptics.tap();
      return;
    }
    const a = order.indexOf(selected), b = order.indexOf(id);
    const next = [...order];
    [next[a], next[b]] = [next[b], next[a]];
    setSelected(null);
    drag.reorder(next);
    announce(id, next);
    haptics.tap();
  };

  const drag = useDragReorder(order, (next) => { setSelected(null); setOrder(next); }, onTap, phase !== 'arrange');

  const onKey = (id: string, e: React.KeyboardEvent) => {
    if (phase !== 'arrange') return;
    const i = order.indexOf(id);
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? order.length - 1 : null;
    if (to === null) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onTap(id); }
      return;
    }
    e.preventDefault();
    if (to < 0 || to >= order.length || to === i) return;
    const next = moveItem(order, i, to);
    focusId.current = id;
    drag.reorder(next);
    announce(id, next);
  };

  useEffect(() => {
    // React moves the focused node when reordering; put focus back on it.
    const id = focusId.current;
    focusId.current = null;
    if (id) listRef.current?.querySelector<HTMLElement>(`[data-chrono-id="${id}"]`)?.focus({ preventScroll: true });
  }, [order]);

  const check = () => {
    if (phase !== 'arrange') return;
    const current = order.map(id => byId.get(id)!).filter(Boolean);
    const { correct, score: s } = scoreOrder(current);
    const m: Record<string, boolean> = {};
    current.forEach((r, i) => { m[r.id] = correct[i]; });
    setMarks(m); setScore(s); setPhase('checked'); setSelected(null);
    answerFeedback(s === 1);
    addStat({ score: s, content: current.map(r => r.name).join(' · ').slice(0, 80), mode: 'chrono' });
    setStreak(v => (s === 1 ? v + 1 : 0));
    onAnswered();
    if (s < 1) {
      // Let the ✓/✗ register, then glide everything into the true order.
      revealTimer.current = window.setTimeout(() => drag.reorder(chronoSorted(current).map(r => r.id)), 750);
    }
  };

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (!items.length) return <Wrapper><Empty>{HE.QUIZ_CHRONO_NOT_ENOUGH}</Empty></Wrapper>;

  const ok = Math.round(score * items.length);
  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_CHRONO_QUESTION}</QuestionLabel>
        {streak > 0 && <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>
      <QuestionBlock key={items.map(r => r.id).join()} ref={listRef}>
        {phase === 'arrange' && <Prompt>{HE.QUIZ_CHRONO_PROMPT}</Prompt>}
        <ChronoList
          items={items} order={order} itemProps={drag.itemProps} draggingId={drag.draggingId}
          onKey={onKey} marks={marks} selectedId={selected} locked={phase !== 'arrange'}
          showCategory={hint || phase === 'checked'} showDates={phase === 'checked'}
        />
        {phase === 'checked' && (
          <Banner $correct={score === 1}>
            {score === 1 ? `✓ ${HE.QUIZ_CHRONO_PERFECT}` : HE.QUIZ_CHRONO_RESULT(ok, items.length)}
          </Banner>
        )}
      </QuestionBlock>
      {phase === 'arrange' ? (
        <>
          {!hint && <HintBtn type="button" onClick={() => setHint(true)}>{HE.QUIZ_CHRONO_HINT}</HintBtn>}
          <CheckBtn type="button" onClick={check}>{HE.QUIZ_CHRONO_CHECK}</CheckBtn>
          <BtnRow><SkipBtn type="button" onClick={() => deal(all, streak)}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>
        </>
      ) : (
        <NextBtn type="button" autoFocus onClick={() => deal(all, streak)}>{HE.QUIZ_NEXT}</NextBtn>
      )}
      <SrOnly aria-live="polite">{live}</SrOnly>
    </Wrapper>
  );
}
