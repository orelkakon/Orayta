'use client';

import WhatsNewModal from './WhatsNewModal';
import { CURRENT_FEATURE } from './features';

/** Lazy entry point: binds the modal to the current feature. */
export default function Announcement({ closing, onClose }: { closing: boolean; onClose: () => void }) {
  return <WhatsNewModal feature={CURRENT_FEATURE} closing={closing} onClose={onClose} />;
}
