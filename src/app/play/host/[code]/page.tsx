import type { Metadata } from 'next';
import HostView from '@/components/PlayView/HostView';

export const metadata: Metadata = { title: 'ניהול משחק · חידון קבוצתי', robots: { index: false } };

export default function PlayHostPage({ params }: { params: { code: string } }) {
  return <HostView code={params.code} />;
}
