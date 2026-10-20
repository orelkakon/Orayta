'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayMe, PlayState } from '@/types/play';
import { Center, Pill, Sub, Title, popIn, pulse, reduced } from '../playStyles';

const Avatar = styled.div`
  font-size: 5.5rem;
  line-height: 1;
  animation: ${popIn} 0.6s ${theme.motion.spring} both;
  ${reduced};
`;
const Name = styled.div`font-size: ${theme.fontSizes.h2}; font-weight: 800; color: ${theme.game.gold};`;
const Wait = styled(Sub)`animation: ${pulse} 2.2s ease-in-out infinite; ${reduced};`;

/** "You're in" — shown on the phone until the host starts. */
export default function PlayerLobby({ state, me }: { state: PlayState; me: PlayMe }) {
  return (
    <Center>
      <Avatar aria-hidden>{me.avatar}</Avatar>
      <Name>{me.name}</Name>
      <Title>{HE.PLAY_YOU_IN}</Title>
      <Sub>{HE.PLAY_SEE_SCREEN}</Sub>
      <Wait role="status">{HE.PLAY_WAIT_HOST}</Wait>
      <Pill>{HE.PLAY_PLAYERS(state.playerCount)}</Pill>
    </Center>
  );
}
