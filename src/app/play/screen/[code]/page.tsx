import type { Metadata } from 'next';
import ScreenView from '@/components/PlayView/ScreenView';

export const metadata: Metadata = { title: 'מסך הקרנה · חידון קבוצתי', robots: { index: false } };

export default function PlayScreenPage({ params }: { params: { code: string } }) {
  return <ScreenView code={params.code} />;
}
