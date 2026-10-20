'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import type { KnowledgeQuestion } from '@/types/quizModes';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import { buildKnowledgeQuestion } from '@/lib/knowledgeQuiz';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, popIn,
} from './quizChrome';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; }
`;
const Kind = styled.span`
  align-self: flex-start; font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 12px;
  background: ${theme.colors.surfaceAlt}; color: ${theme.colors.primaryLight}; border: 1px solid ${theme.colors.borderLight};
`;
const Prompt = styled.h3`
  margin: 0; font-family: ${theme.fonts.body}; font-size: 1.25rem; line-height: 1.6; color: ${theme.colors.text};
`;
const Options = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.sm};
  ${theme.media.xs} { grid-template-columns: 1fr; }
`;
type BtnState = 'idle' | 'correct' | 'wrong' | 'dim';
const Option = styled.button<{ $state: BtnState }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md}; min-height: 56px;
  font-family: ${theme.fonts.body}; font-size: 0.98rem; font-weight: 600; text-align: center;
  border: 2px solid ${({ $state }) => ($state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : theme.colors.border)};
  background: ${({ $state }) => ($state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : theme.colors.surface)};
  color: ${({ $state }) => ($state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : theme.colors.text)};
  opacity: ${({ $state }) => ($state === 'dim' ? 0.45 : 1)};
  pointer-events: ${({ $state }) => ($state === 'idle' ? 'auto' : 'none')};
  @media (hover: hover) { &:hover { border-color: ${theme.colors.primaryLight}; transform: translateY(-2px); box-shadow: ${theme.shadows.sm}; } }
`;
const Banner = styled(ResultBanner)`text-align: center;`;
const Reveal = styled.div<{ $color: string }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $color }) => $color + '10'}; border: 2px solid ${({ $color }) => $color + '40'};
  display: flex; flex-direction: column; gap: ${theme.spacing.xs}; animation: ${popIn} 0.3s ${theme.motion.spring};
`;
const RevealName = styled.div`font-size: 1.05rem; font-weight: 700; color: ${theme.colors.text}; font-family: ${theme.fonts.body};`;
const RevealMeta = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted};`;
const RevealBio = styled.p`margin: 0; font-size: 0.9rem; line-height: 1.75; color: ${theme.colors.text}; font-family: ${theme.fonts.body};`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

const RECENT = 40;

interface Props { onAnswered: () => void; }

export default function KnowledgeQuiz({ onAnswered }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState<KnowledgeQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const recent = useRef<string[]>([]);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback((list: Rabbi[]) => {
    const question = buildKnowledgeQuestion(list, Math.random, new Set(recent.current));
    if (question) recent.current = [...recent.current, question.id].slice(-RECENT);
    setQ(question);
    setSelected(null);
  }, []);

  useEffect(() => { if (all.length) next(all); }, [all, next]);

  const pick = (i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    const ok = i === q.answer;
    answerFeedback(ok);
    addStat({ score: ok ? 1 : 0, content: q.prompt.slice(0, 80), mode: 'knowledge' });
    setStreak(s => (ok ? s + 1 : 0));
    onAnswered();
  };

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (!q) return <Wrapper><Empty>{HE.QUIZ_KNOWLEDGE_NOT_ENOUGH}</Empty></Wrapper>;

  const answered = selected !== null;
  const ok = selected === q.answer;
  const about = all.find(r => r.name === q.about);
  const color = about ? CATEGORY_COLORS[about.category as RabbiCategory] ?? theme.colors.primary : theme.colors.primary;
  const stateOf = (i: number): BtnState => (!answered ? 'idle' : i === q.answer ? 'correct' : i === selected ? 'wrong' : 'dim');

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_MODE_KNOWLEDGE}</QuestionLabel>
        {streak > 0 && <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>
      <QuestionBlock key={q.id}>
        <Kind>{HE.KQ_KIND[q.kind]}</Kind>
        <Prompt>{q.prompt}</Prompt>
        <Options>
          {q.options.map((o, i) => (
            <Option key={o} type="button" $state={stateOf(i)} onClick={() => pick(i)}>{o}</Option>
          ))}
        </Options>
        {answered && (
          <>
            <Banner $correct={ok}>{ok ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG} — ${q.options[q.answer]}`}</Banner>
            {about && (
              <Reveal $color={color}>
                <RevealName>{about.name}{about.fullName && about.fullName !== about.name ? ` — ${about.fullName}` : ''}</RevealName>
                <RevealMeta>{CATEGORY_LABELS[about.category as RabbiCategory]} · {about.datePeriod}{about.deathDate ? ` · ${HE.KQ_KIND.yahrzeit}: ${about.deathDate}` : ''}</RevealMeta>
                <RevealBio>{about.bio}</RevealBio>
              </Reveal>
            )}
          </>
        )}
      </QuestionBlock>
      {answered
        ? <NextBtn type="button" onClick={() => next(all)} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn type="button" onClick={() => next(all)}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>}
    </Wrapper>
  );
}
