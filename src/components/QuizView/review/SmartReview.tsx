'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Citation } from '@/types';
import type { SrsGrade, SrsState } from '@/types/quizModes';
import { addStat } from '@/lib/statsStorage';
import { haptics } from '@/lib/haptics';
import { loadSrs, saveSrs, clearSrs, recordReview, buildQueue, summarize, nextStep } from '@/lib/srs';
import { Top, QuestionLabel, QuestionBlock, shuffle, popIn } from '../quizChrome';
import Flashcard from './Flashcard';
import ReviewDone from './ReviewDone';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; }
`;
const Chips = styled.div`display: flex; gap: ${theme.spacing.xs}; flex-wrap: wrap;`;
const Chip = styled.span`
  font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 12px;
  background: ${theme.colors.surfaceAlt}; color: ${theme.colors.textMuted};
`;
const Bar = styled.div`height: 6px; border-radius: 3px; background: ${theme.colors.borderLight}; overflow: hidden;`;
const Fill = styled.div<{ $pct: number }>`
  height: 100%; width: ${({ $pct }) => $pct}%; border-radius: 3px;
  background: linear-gradient(90deg, ${theme.colors.secondary}, ${theme.colors.success});
  transition: width ${theme.motion.slow} ${theme.motion.out};
`;
const Feedback = styled.div`
  align-self: center; font-size: 0.82rem; font-weight: 700; color: ${theme.colors.success};
  padding: 2px 12px; border-radius: 12px; background: ${theme.colors.bgSuccess}; animation: ${popIn} 0.35s ${theme.motion.spring};
`;
const Foot = styled.p`margin: 0; font-size: 0.75rem; color: ${theme.colors.textLight}; text-align: center;
  @media (hover: none) { display: none; }`;
const Info = styled.p`margin: 0; font-size: 0.78rem; color: ${theme.colors.textMuted}; line-height: 1.6;`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

const SCORE: Record<SrsGrade, number> = { again: 0, hard: 0.5, good: 1 };

interface Props { filterSeder: string; filterMasechet: string; onAnswered: () => void; }

export default function SmartReview({ filterSeder, filterMasechet, onAnswered }: Props) {
  const [citations, setCitations] = useState<Citation[] | null>(null);
  const [srs, setSrs] = useState<SrsState>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState({ n: 0, knew: 0, total: 0 });
  const [extra, setExtra] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; k: number } | null>(null);
  const order = useRef<string[]>([]);

  useEffect(() => {
    setSrs(loadSrs());
    fetch('/api/citations')
      .then(r => r.json())
      .then((d: Citation[]) => { order.current = shuffle(d.map(c => c.id)); setCitations(d); })
      .catch(() => setCitations([]));
  }, []);

  const pool = useMemo(() => {
    const ok = new Set((citations ?? []).filter(c => c.locations.some(l =>
      (!filterMasechet || l.masechet === filterMasechet) && (!filterSeder || l.seder === filterSeder))).map(c => c.id));
    return order.current.filter(id => ok.has(id));
  }, [citations, filterSeder, filterMasechet]);

  const byId = useMemo(() => new Map((citations ?? []).map(c => [c.id, c])), [citations]);

  // Rebuild the session when the filter or the new-card allowance changes.
  useEffect(() => {
    if (!citations) return;
    const q = buildQueue(loadSrs(), pool, Date.now(), extra);
    setQueue(q); setFlipped(false); setDone(d => ({ ...d, total: d.n + q.length }));
  }, [citations, pool, extra, epoch]);

  const grade = useCallback((g: SrsGrade) => {
    const id = queue[0];
    if (!id || !flipped) return;
    const now = Date.now();
    const before = srs[id];
    const next = recordReview(srs, id, g, now);
    setSrs(next); saveSrs(next);
    const rest = queue.slice(1);
    setQueue(g === 'again' ? [...rest, id] : rest);
    setDone(d => ({ n: d.n + 1, knew: d.knew + (g === 'good' ? 1 : 0), total: d.total + (g === 'again' ? 1 : 0) }));
    setFlipped(false);
    setFeedback({ text: HE.QUIZ_REVIEW_NEXT_IN(HE.QUIZ_REVIEW_IN(nextStep(before, g).days)), k: now });
    if (g === 'again') haptics.error(); else haptics.success();
    const c = byId.get(id);
    addStat({ score: SCORE[g], content: (c?.content ?? '').slice(0, 80), mode: 'review' });
    onAnswered();
  }, [queue, flipped, srs, byId, onAnswered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!queue.length) return;
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setFlipped(true); return; }
      const g = flipped ? ({ '1': 'again', '2': 'hard', '3': 'good' } as Record<string, SrsGrade>)[e.key] : undefined;
      if (g) { e.preventDefault(); grade(g); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [queue, flipped, grade]);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 1600);
    return () => window.clearTimeout(t);
  }, [feedback]);

  if (!citations) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (!pool.length) return <Wrapper><Empty>{HE.QUIZ_REVIEW_EMPTY}</Empty></Wrapper>;

  const now = Date.now();
  const sum = summarize(srs, now, pool);
  const fresh = queue.filter(id => !srs[id]).length;
  const current = queue[0] ? byId.get(queue[0]) : undefined;
  const pct = done.total ? Math.round((done.n / Math.max(done.total, 1)) * 100) : 0;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_REVIEW_TITLE}</QuestionLabel>
        <Chips>
          <Chip>{HE.QUIZ_REVIEW_DUE(queue.length - fresh)}</Chip>
          <Chip>{HE.QUIZ_REVIEW_NEW(fresh)}</Chip>
        </Chips>
      </Top>
      {queue.length > 0 && (
        <Bar role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={HE.QUIZ_REVIEW_PROGRESS_ARIA(done.n, done.total)}>
          <Fill $pct={pct} />
        </Bar>
      )}
      {feedback && <Feedback key={feedback.k} role="status">{feedback.text}</Feedback>}
      {current ? (
        <QuestionBlock key={`${current.id}-${done.n}`}>
          <Flashcard citation={current} card={srs[current.id]} flipped={flipped} onFlip={() => setFlipped(true)} onGrade={grade} />
          <Foot>{HE.QUIZ_REVIEW_KEYS}</Foot>
        </QuestionBlock>
      ) : (
        <ReviewDone
          summary={sum} total={pool.length} reviewed={done.n}
          knewPct={done.n ? Math.round((done.knew / done.n) * 100) : 0}
          canAddMore={pool.some(id => !srs[id])}
          onMore={() => setExtra(x => x + 5)}
          onReset={() => { clearSrs(); setSrs({}); setDone({ n: 0, knew: 0, total: 0 }); setEpoch(e => e + 1); }}
        />
      )}
      <Info>{HE.QUIZ_REVIEW_INFO}</Info>
    </Wrapper>
  );
}
