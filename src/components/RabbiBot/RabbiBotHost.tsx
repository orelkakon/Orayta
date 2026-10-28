'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { onOpenRabbiBot } from '@/lib/rabbiBot/client';
import {
  Backdrop, Sheet, Grip, Head, Medallion, TitleBox, Title, Sub, CloseBtn, EXIT_MS,
} from '@/components/Notifications/sheetStyles';

// Loaded on first open — the button alone ships with every page.
const RabbiBotPanel = dynamic(() => import('./RabbiBotPanel'), { ssr: false });

/* Bottom-left: the accessibility button owns bottom-right. Same z-layer, so
   the drawer, the feed overlay and modals all cover it. */
const Fab = styled.button`
  position: fixed; bottom: 18px; left: 18px; z-index: ${theme.z.fab};
  height: 46px; padding: 0 16px 0 12px; border-radius: 999px;
  display: flex; align-items: center; gap: 6px;
  background: ${theme.colors.secondary}; color: ${theme.colors.onPrimary};
  font-weight: 800; font-size: ${theme.fontSizes.sm};
  box-shadow: ${theme.shadows.lg}; border: 2px solid rgba(255, 255, 255, 0.35);
  transition: transform ${theme.motion.fast} ${theme.motion.out};
  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.95); }
  @media (max-width: 768px) {
    bottom: calc(84px + env(safe-area-inset-bottom));
    width: 46px; padding: 0; justify-content: center;
    & > span { display: none; }
  }
`;

const WideSheet = styled(Sheet)`max-width: 640px; height: 88dvh;`;

/* Full-screen experiences where a floating button would sit on content. */
const HIDDEN = ['/play', '/ask', '/login', '/feed'];

/** Floating רבי־בוט button + its sheet, mounted once in ClientProviders. */
export default function RabbiBotHost() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => onOpenRabbiBot(() => setOpen(true)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const close = () => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, EXIT_MS);
  };

  const hidden = HIDDEN.some(p => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {!hidden && !open && (
        <Fab type="button" onClick={() => setOpen(true)} aria-label={HE.RB_FAB} aria-haspopup="dialog">
          <LineIcon name="ask" size={22} strokeWidth={1.9} />
          <span>{HE.RB_NAME}</span>
        </Fab>
      )}
      {open && (
        <>
          <Backdrop $out={closing} onClick={close} />
          <WideSheet $out={closing} role="dialog" aria-modal="true" aria-label={HE.RB_NAME}>
            <Grip />
            <Head>
              <Medallion><span><LineIcon name="ask" size={24} /></span></Medallion>
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
