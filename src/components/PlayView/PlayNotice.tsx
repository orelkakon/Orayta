'use client';

import Link from 'next/link';
import { HE } from '@/lib/hebrewTexts';
import { Center, GhostButton, Stage, Sub, Title } from './playStyles';

/** Full-screen message for dead ends: game gone, not the host, kicked. */
export default function PlayNotice({ title, sub, screenCode }: { title: string; sub?: string; screenCode?: string }) {
  return (
    <Stage>
      <Center>
        <Title>{title}</Title>
        {sub && <Sub>{sub}</Sub>}
        {screenCode && <Link href={`/play/screen/${screenCode}`}><GhostButton as="span">{HE.PLAY_OPEN_SCREEN}</GhostButton></Link>}
        <Link href="/play"><GhostButton as="span">{HE.PLAY_JOIN_TITLE}</GhostButton></Link>
        <Link href="/"><GhostButton as="span">{HE.PLAY_BACK_HOME}</GhostButton></Link>
      </Center>
    </Stage>
  );
}
