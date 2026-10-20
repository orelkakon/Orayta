import type { Metadata } from 'next';
import HostSetup from '@/components/PlayView/HostSetup';

export const metadata: Metadata = { title: 'משחק חדש · חידון קבוצתי', alternates: { canonical: '/play/new' } };

export default function PlayNewPage() {
  return <HostSetup />;
}
