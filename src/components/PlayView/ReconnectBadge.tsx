'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Pill, pulse, reduced } from './playStyles';

const Badge = styled(Pill)`
  color: ${theme.game.gold};
  border-color: ${theme.game.goldDeep};
  animation: ${pulse} 1.6s ease-in-out infinite;
  ${reduced};
`;

/** Shown after two failed polls in a row — the game keeps retrying. */
export default function ReconnectBadge({ show }: { show: boolean }) {
  return show ? <Badge role="status">{HE.PLAY_RECONNECTING}</Badge> : null;
}
