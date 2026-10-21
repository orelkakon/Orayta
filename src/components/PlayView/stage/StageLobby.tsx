'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayState } from '@/types/play';
import QrCode from '../QrCode';
import InviteActions from '../InviteActions';
import { Glass, Pill, popIn, pulse, reduced, rise } from '../playStyles';
import { displayHost, joinUrl } from '../playClient';

/** Lobby on the big screen: how to join (URL + PIN + QR) and who's here. */
const Grid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
  ${theme.media.md} { grid-template-columns: 1fr; }
`;
const JoinCard = styled(Glass)`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.ms};
  text-align: center;
  animation: ${rise} 0.5s ${theme.motion.out} both;
  ${reduced};
`;
const Small = styled.div`color: ${theme.game.inkMuted}; font-size: ${theme.fontSizes.sm};`;
const Url = styled.div`
  font-size: clamp(1.05rem, 2.2vw, 1.4rem);
  font-weight: 700;
  direction: ltr;
  color: ${theme.game.ink};
`;
const Pin = styled.div`
  font-size: clamp(3rem, 9vw, 5.4rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  direction: ltr;
  font-variant-numeric: tabular-nums;
  color: ${theme.game.gold};
  line-height: 1;
  text-shadow: 0 6px 30px ${theme.game.goldGlow};
`;
const RosterCard = styled(Glass)`
  padding: ${theme.spacing.lg};
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;
const RosterHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
`;
const Waiting = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.game.inkMuted};
  text-align: center;
  animation: ${pulse} 2.4s ease-in-out infinite;
  ${reduced};
`;
const Chips = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;
const Chip = styled.li`
  animation: ${popIn} 0.4s ${theme.motion.spring} both;
  ${reduced};
  button, span.chip {
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: 6px 14px 6px 10px;
    border-radius: 999px;
    background: ${theme.game.glassHi};
    border: 1px solid ${theme.game.glassLine};
    color: ${theme.game.ink};
    font-size: ${theme.fontSizes.md};
    font-weight: 600;
    font-family: ${theme.fonts.ui};
  }
  button { cursor: pointer; }
  button:hover { border-color: ${theme.game.wrong}; }
`;
const Avatar = styled.span`font-size: 1.25rem; line-height: 1;`;

interface Props { state: PlayState; onKick?: (id: string, name: string) => void; }

export default function StageLobby({ state, onKick }: Props) {
  const spaced = `${state.code.slice(0, 3)} ${state.code.slice(3)}`;
  return (
    <Grid>
      <JoinCard>
        <Small>{HE.PLAY_LOBBY_JOIN_AT}</Small>
        <Url>{displayHost()}/play</Url>
        <Small>{HE.PLAY_LOBBY_AND_CODE}</Small>
        <Pin aria-label={`${HE.PLAY_PIN_LABEL} ${state.code}`}>{spaced}</Pin>
        <Small>{HE.PLAY_LOBBY_SCAN}</Small>
        <QrCode value={joinUrl(state.code)} size={190} label={HE.PLAY_ARIA_QR} />
        <Pill>{HE.PLAY_LOBBY_SUMMARY(state.total, state.settings.seconds)}</Pill>
        {state.isHost && <InviteActions code={state.code} total={state.total} seconds={state.settings.seconds} />}
      </JoinCard>
      <RosterCard>
        <RosterHead>
          <strong>{HE.PLAY_PLAYERS_SHEET}</strong>
          <Pill aria-live="polite">{HE.PLAY_PLAYERS(state.playerCount)}</Pill>
        </RosterHead>
        {state.roster.length === 0 ? (
          <Waiting>{HE.PLAY_NO_PLAYERS_YET}</Waiting>
        ) : (
          <Chips>
            {state.roster.map(p => (
              <Chip key={p.id}>
                {onKick ? (
                  <button type="button" onClick={() => onKick(p.id, p.name)} title={HE.PLAY_KICK}>
                    <Avatar aria-hidden>{p.avatar}</Avatar>{p.name}
                  </button>
                ) : (
                  <span className="chip"><Avatar aria-hidden>{p.avatar}</Avatar>{p.name}</span>
                )}
              </Chip>
            ))}
          </Chips>
        )}
      </RosterCard>
    </Grid>
  );
}
