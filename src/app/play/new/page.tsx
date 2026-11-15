import type { Metadata } from 'next';
import HostSetup from '@/components/PlayView/HostSetup';
import SectionPing from '@/components/common/SectionPing';

export const metadata: Metadata = { title: 'משחק חדש · חידון קבוצתי', alternates: { canonical: '/play/new' } };

export default function PlayNewPage() {
  return (
    <>
      <SectionPing metric="play" />
      <HostSetup />
    </>
  );
}
