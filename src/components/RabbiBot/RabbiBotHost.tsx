'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useBodyScrollLock } from '@/components/common/useBodyScrollLock';
import { onOpenRabbiBot } from '@/lib/rabbiBot/client';
import {
  Backdrop, Sheet, Grip, Head, TitleBox, Title, Sub, CloseBtn, EXIT_MS,
} from '@/components/Notifications/sheetStyles';
import RabbiBotFab from './RabbiBotFab';
import RabbiBotAvatar from './RabbiBotAvatar';

// Loaded on first open — the button alone ships with every page.
const RabbiBotPanel = dynamic(() => import('./RabbiBotPanel'), { ssr: false });

const WideSheet = styled(Sheet)`max-width: 640px; height: 88dvh;`;

/* Full-screen experiences where a floating button would sit on content. */
const HIDDEN = ['/play', '/ask', '/login', '/feed'];

/** Floating רבי־בוט button + its sheet, mounted once in ClientProviders. */
export default function RabbiBotHost() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  useBodyScrollLock(open);

  useEffect(() => onOpenRabbiBot(() => setOpen(true)), []);

  const close = () => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, EXIT_MS);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const hidden = HIDDEN.some(p => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {!hidden && !open && <RabbiBotFab onOpen={() => setOpen(true)} />}
      {open && (
        <>
          <Backdrop $out={closing} onClick={close} />
          <WideSheet $out={closing} role="dialog" aria-modal="true" aria-label={HE.RB_NAME}>
            <Grip />
            <Head>
              <RabbiBotAvatar size={52} />
              <TitleBox>
                <Title>{HE.RB_NAME}</Title>
                <Sub>{HE.RB_TAGLINE}</Sub>
              </TitleBox>
              <CloseBtn type="button" onClick={close} aria-label={HE.RB_CLOSE}><LineIcon name="close" size={20} /></CloseBtn>
            </Head>
            <RabbiBotPanel idPrefix="rb-sheet" />
          </WideSheet>
        </>
      )}
    </>
  );
}
