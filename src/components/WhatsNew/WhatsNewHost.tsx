'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { WHATS_NEW_ID, isQuietPath, markWhatsNewSeen, whatsNewDue } from '@/lib/whatsNew';
import { EXIT_MS } from './whatsNewStyles';

// The card (and its hero) is only downloaded for visitors who haven't seen it.
const Announcement = dynamic(() => import('./Announcement'), { ssr: false });

const SHOW_AFTER_MS = 1400;

/** Mounted once in ClientProviders: shows the current announcement once per device. */
export default function WhatsNewHost() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open || isQuietPath(pathname) || !whatsNewDue()) return;
    const t = window.setTimeout(() => {
      // "Once" means once: remembered as soon as it appears, however it is closed.
      markWhatsNewSeen(WHATS_NEW_ID);
      setOpen(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [pathname, open]);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, EXIT_MS);
  }, []);

  return open ? <Announcement closing={closing} onClose={close} /> : null;
}
