'use client';

import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { RabbiBotAnswer, RabbiBotView } from '@/types/rabbiBot';
import SourceCard from './SourceCard';
import { Card, CardTitle, Stack } from './styles';

const Short = styled.p`
  margin: 0; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 600;
  line-height: 1.7; color: ${theme.colors.text};
`;

const Badges = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;
const Badge = styled.span<{ $warn?: boolean }>`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; padding: 3px 10px; border-radius: 999px;
  color: ${p => (p.$warn ? theme.colors.text : theme.colors.success)};
  background: ${p => (p.$warn ? theme.colors.bgWarning : theme.colors.bgSuccess)};
`;

const Group = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const GroupTitle = styled.h3<{ $view: RabbiBotView }>`
  margin: 0; font-size: ${theme.fontSizes.sm}; font-weight: 800;
  color: ${p => (p.$view === 'main' ? theme.colors.primary : theme.colors.textMuted)};
`;
const Points = styled.ul`margin: 0; padding-inline-start: 18px; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const arrive = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;
const Point = styled.li<{ $active?: boolean; $fresh?: boolean }>`
  ${p => p.$fresh && css`animation: ${arrive} ${theme.motion.slow} ${theme.motion.outStrong} both;`}
  @media (prefers-reduced-motion: reduce) { animation: none; }
  font-size: ${theme.fontSizes.md}; line-height: 1.65; color: ${theme.colors.text};
  margin-inline-start: -8px; padding: 2px 8px; border-radius: ${theme.radii.sm};
  background: ${p => (p.$active ? theme.colors.bgWarning : 'transparent')};
  transition: background ${theme.motion.base} ${theme.motion.out};
`;
const Cite = styled.a`
  display: inline-flex; align-items: center; justify-content: center; vertical-align: super;
  min-width: 18px; height: 18px; margin-inline-start: 3px; padding: 0 4px; border-radius: 999px;
  font-size: 11px; font-weight: 800; text-decoration: none;
  background: ${theme.colors.surfaceAlt}; color: ${theme.colors.primary}; border: 1px solid ${theme.colors.border};
`;

const Derived = styled.span`
  display: inline-block; margin-inline-end: 6px; padding: 0 8px; border-radius: 999px; vertical-align: 1px;
  font-size: ${theme.fontSizes.xs}; font-weight: 800; line-height: 1.7;
  color: ${theme.colors.text}; background: ${theme.colors.bgWarning}; border: 1px dashed ${theme.colors.secondary};
`;

const Understood = styled.p`
  margin: 0; font-size: ${theme.fontSizes.sm}; line-height: 1.55; color: ${theme.colors.textMuted};
  & > b { font-weight: 700; margin-inline-end: 4px; }
  & > span { font-family: ${theme.fonts.body}; color: ${theme.colors.text}; }
`;

const RuleNote = styled.div`
  display: flex; flex-direction: column; gap: 2px; padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md}; border: 1px dashed ${theme.colors.secondary}; background: ${theme.colors.bgWarning};
  font-size: ${theme.fontSizes.sm}; line-height: 1.55; color: ${theme.colors.text};
  & > b { font-weight: 800; }
`;

const VIEWS: RabbiBotView[] = ['main', 'ashkenaz', 'note'];

function UnderstoodLine({ text }: { text?: string }) {
  if (!text) return null;
  return <Understood><b>{HE.RB_UNDERSTOOD}</b><span>{text}</span></Understood>;
}

interface Props {
  answer: RabbiBotAnswer;
  idPrefix: string;
  /** Index (in answer.points) of the point being read aloud. */
  activePoint?: number;
  /** Still being written: each point eases in as it arrives. */
  streaming?: boolean;
}

/** The verified answer: short ruling, points by view with numbered cites, then the sources. */
export default function AnswerView({ answer, idPrefix, activePoint, streaming }: Props) {
  if (answer.status !== 'answered') {
    const [title, text] = answer.status === 'sensitive' ? [HE.RB_SENSITIVE_TITLE, HE.RB_SENSITIVE_TEXT]
      : answer.status === 'other' ? [HE.RB_OTHER_TITLE, HE.RB_OTHER_TEXT]
      : [HE.RB_NOT_FOUND_TITLE, answer.searched ? HE.RB_NOT_FOUND_SEARCHED(answer.searched) : HE.RB_NOT_FOUND_TEXT];
    return (
      <Stack>
        {answer.status === 'not_found' && <UnderstoodLine text={answer.understood} />}
        <Card><CardTitle>{title}</CardTitle>{text}</Card>
      </Stack>
    );
  }

  const domId = (i: number) => `${idPrefix}-src-${i}`;
  const viewLabels = answer.kind === 'torah' ? HE.RB_VIEW_TORAH : HE.RB_VIEW;
  const jump = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(domId(i));
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.dataset.flash = '1';
    window.setTimeout(() => { delete el.dataset.flash; }, 1600);
  };
  const quotesOf = (i: number) => answer.points.flatMap(p => p.cites.filter(c => c.source === i).map(c => c.quote));

  return (
    <Stack>
      <UnderstoodLine text={answer.understood} />
      {answer.byRule && <RuleNote><b>{HE.RB_BY_RULE_TITLE}</b>{HE.RB_BY_RULE_TEXT}</RuleNote>}
      {answer.short && <Short>{answer.short}</Short>}
      <Badges>
        <Badge>✓ {HE.RB_VERIFIED_BADGE}</Badge>
        {answer.points.some(p => p.derived) && <Badge $warn>🧩 {HE.RB_DERIVED_BADGE}</Badge>}
        {!answer.byRule && answer.points.some(p => p.rule) && <Badge $warn>🧩 {HE.RB_RULE_BADGE}</Badge>}
        {answer.dispute && <Badge $warn>⚖ {HE.RB_DISPUTE}</Badge>}
      </Badges>
      {VIEWS.map(view => {
        const pts = answer.points.map((p, gi) => ({ p, gi })).filter(x => x.p.view === view);
        if (pts.length === 0) return null;
        return (
          <Group key={view}>
            <GroupTitle $view={view}>{viewLabels[view]}</GroupTitle>
            <Points>
              {pts.map(({ p, gi }) => (
                <Point key={gi} $active={gi === activePoint} $fresh={streaming}>
                  {p.derived && <Derived title={HE.RB_DERIVED_HINT}>{HE.RB_DERIVED_TAG}</Derived>}
                  {p.rule && <Derived title={HE.RB_RULE_HINT}>{HE.RB_RULE_TAG}</Derived>}
                  {p.text}
                  {Array.from(new Set(p.cites.map(c => c.source))).map(s => (
                    <Cite key={s} href={`#${domId(s)}`} onClick={jump(s)} aria-label={HE.RB_CITE_ARIA(s + 1)}>{s + 1}</Cite>
                  ))}
                </Point>
              ))}
            </Points>
          </Group>
        );
      })}
      <Group>
        <GroupTitle $view="main">{HE.RB_SOURCES}</GroupTitle>
        {answer.sources.map((s, i) => (
          <SourceCard key={i} index={i} source={s} quotes={quotesOf(i)} domId={domId(i)} />
        ))}
      </Group>
    </Stack>
  );
}
