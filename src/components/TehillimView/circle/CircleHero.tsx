'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { TehillimState } from '@/types/tehillim';
import { headingOf } from '@/lib/tehillim/client';
import { LineIcon } from '@/components/common/LineIcons';
import { Night, Kicker, Dedication, NightText, NightTag } from '../styles';
import ProgressRing from './ProgressRing';

/**
 * The top of a reading: what it is for, the organizer's note, and how far it
 * got — the ring for the open book, four live numbers beside it. `children`
 * is the call to action, which sits inside the card.
 */
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.3; }`;

const Body = styled.div`display: flex; align-items: center; gap: ${theme.spacing.md}; margin-top: ${theme.spacing.lg}; ${theme.up.sm} { gap: ${theme.spacing.xl}; }`;
const Grid = styled.dl`
  flex: 1; min-width: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.ms} ${theme.spacing.sm};
`;
const Stat = styled.div`
  display: flex; flex-direction: column; gap: 2px; min-width: 0;
  & > dd { margin: 0; font-size: 1.2rem; ${theme.up.sm} { font-size: 1.45rem; } font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; color: ${theme.gilded.nightInk}; display: flex; align-items: center; gap: 6px; }
  & > dt { font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.gilded.nightMuted}; }
`;
const LiveDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%; background: ${theme.brand.whatsapp};
  animation: ${pulse} 1.6s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Tags = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-top: ${theme.spacing.md};`;
const Goal = styled.p`
  margin: ${theme.spacing.md} 0 0; padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.game.goldInk};
  background: ${theme.gilded.nightTag}; border: 1px solid ${theme.gilded.nightLine};
`;
const Action = styled.div`margin-top: ${theme.spacing.lg}; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;

function daysLeft(endsAt: string): number {
  const day = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date(t));
  return Math.round((Date.parse(day(Date.parse(endsAt))) - Date.parse(day(Date.now()))) / 86_400_000);
}

export default function CircleHero({ state, children }: { state: TehillimState; children: React.ReactNode }) {
  const done = state.cells.filter(c => c === 'done').length;
  const held = state.cells.filter(c => c === 'held').length;
  const goalDone = state.goal > 0 && state.books >= state.goal;
  return (
    <Night>
      <Kicker><LineIcon name="scroll" size={16} /> {state.title ?? `${HE.TH_PAGE_TITLE} · ${HE.TH_PURPOSES[state.purpose].label}`}</Kicker>
      <Dedication>{headingOf(state.purpose, state.names)}</Dedication>
      {state.note && <NightText>{state.note}</NightText>}
      {(state.endsAt || state.closed) && (
        <Tags>
          {state.closed ? <NightTag>{HE.TH_CLOSED}</NightTag>
            : state.endsAt && <NightTag><LineIcon name="clock" size={13} /> {HE.TH_ENDS_IN(daysLeft(state.endsAt))}</NightTag>}
        </Tags>
      )}
      <Body>
        <ProgressRing done={done} held={held} total={state.units} round={state.round} />
        <Grid>
          <Stat><dt>{HE.TH_STAT_BOOKS}</dt><dd>{HE.TH_STAT_BOOKS_OF(state.books, state.goal)}</dd></Stat>
          <Stat><dt>{HE.TH_STAT_CHAPTERS}</dt><dd>{state.stats.chapters.toLocaleString('he-IL')}</dd></Stat>
          <Stat><dt>{HE.TH_STAT_READERS}</dt><dd>{state.stats.readers.toLocaleString('he-IL')}</dd></Stat>
          <Stat><dt>{HE.TH_STAT_LIVE}</dt><dd>{state.stats.live > 0 && <LiveDot aria-hidden="true" />}{state.stats.live}</dd></Stat>
        </Grid>
      </Body>
      {goalDone && <Goal>🎉 {HE.TH_GOAL_DONE}</Goal>}
      <Action>{children}</Action>
    </Night>
  );
}
