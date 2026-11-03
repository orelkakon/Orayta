'use client';

import Sheet from '@/components/ui/Sheet';

/**
 * Legacy dialog API (title + onClose + children), now rendered by the shared
 * Sheet: a draggable bottom sheet on phones, a centred dialog on desktop.
 * Mounted while open — the caller unmounts it to close.
 */
interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  return (
    <Sheet open onClose={onClose} title={title} maxWidth={620}>
      {children}
    </Sheet>
  );
}
