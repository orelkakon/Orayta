'use client';

import type { PlayState } from '@/types/play';
import StageLobby from './StageLobby';
import StageQuestion from './StageQuestion';
import StageBoard from './StageBoard';
import StagePodium from './StagePodium';

/** What the big screen shows for each phase — shared by host and screen. */
interface Props {
  state: PlayState;
  now: () => number;
  onKick?: (id: string, name: string) => void;
}

export default function Stage({ state, now, onKick }: Props) {
  switch (state.status) {
    case 'lobby': return <StageLobby state={state} onKick={onKick} />;
    case 'question':
    case 'reveal': return <StageQuestion state={state} now={now} />;
    case 'board': return <StageBoard board={state.board} />;
    case 'ended': return <StagePodium board={state.board} />;
  }
}
