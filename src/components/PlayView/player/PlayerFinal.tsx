'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { shareTextSmart } from '@/lib/siteUrl';
import type { PlayMe } from '@/types/play';
import Confetti from '../Confetti';
import { Center, GhostButton, GoldButton, Pill, Sub, Title, popIn, reduced } from '../playStyles';

const Medal = styled.div`
  font-size: 6rem;
  line-height: 1;
  animation: ${popIn} 0.7s ${theme.motion.spring} both;
  ${reduced};
`;
const Row = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap; justify-content: center;`;
const MEDALS = ['🥇', '🥈', '🥉'];

/** The phone at the end: your place, your score, share it. */
export default function PlayerFinal({ me }: { me: PlayMe }) {
  const top = me.rank <= 3;
  return (
    <Center>
      {top && <Confetti count={50} />}
      <Medal aria-hidden>{top ? MEDALS[me.rank - 1] : me.avatar}</Medal>
      <Title>{HE.PLAY_FINAL_RANK(me.rank)}</Title>
      <Pill>{HE.PLAY_POINTS(me.score)}</Pill>
      <Sub>{HE.PLAY_THANKS}</Sub>
      <Row>
        <GoldButton type="button" onClick={() => { void shareTextSmart(`${HE.PLAY_SHARE_TEXT(me.rank, me.score)}\n${window.location.origin}/play`); }}>
          {HE.PLAY_SHARE}
        </GoldButton>
        <Link href="/play"><GhostButton as="span">{HE.PLAY_JOIN_TITLE}</GhostButton></Link>
      </Row>
    </Center>
  );
}
