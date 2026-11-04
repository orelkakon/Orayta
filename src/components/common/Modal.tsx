'use client';

import Sheet from '@/components/ui/Sheet';

/**
 * Legacy dialog API (title + onClose + children), now rendered by the shared
 * Sheet: a draggable bottom sheet on phones, a centred dialog on desktop.
 * Mounted while open — the caller unmounts it to close. `full` / `guarded` /
 * `footer` are passed straight to the Sheet (long-text editors).
 */
interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  full?: boolean;
  guarded?: boolean;
}

export default function Modal({ title, onClose, children, footer, maxWidth = 620, full, guarded }: Props) {
  return (
    <Sheet open onClose={onClose} title={title} maxWidth={maxWidth} footer={footer} full={full} guarded={guarded}>
      {children}
    </Sheet>
  );
}
