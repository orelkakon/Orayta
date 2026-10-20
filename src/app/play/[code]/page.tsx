import type { Metadata } from 'next';
import PlayerView from '@/components/PlayView/PlayerView';

export const metadata: Metadata = { title: 'חידון קבוצתי', robots: { index: false } };

export default function PlayGamePage({ params }: { params: { code: string } }) {
  return <PlayerView code={params.code} />;
}
