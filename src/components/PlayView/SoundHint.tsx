'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Pill, pulse, reduced } from './playStyles';

/** Browsers won't play sound before a tap — invite the first one on the projector. */
const Hint = styled(Pill)`
  color: ${theme.game.gold};
  border-color: ${theme.game.goldDeep};
  animation: ${pulse} 2s ease-in-out infinite;
  ${reduced};
`;

export default function SoundHint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const off = () => setShow(false);
    window.addEventListener('pointerdown', off, { once: true });
    window.addEventListener('keydown', off, { once: true });
    return () => { window.removeEventListener('pointerdown', off); window.removeEventListener('keydown', off); };
  }, []);
  return show ? <Hint role="status">{HE.PLAY_SOUND_HINT}</Hint> : null;
}
