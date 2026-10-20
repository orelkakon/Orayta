import type { Metadata } from 'next';
import { Suspense } from 'react';
import JoinView from '@/components/PlayView/JoinView';

const TITLE = 'חידון קבוצתי';
const DESC = 'משחק חידון חי לשיעור, לשולחן שבת ולחברותא — המנחה מקרין, וכולם עונים מהטלפון על שאלות בתלמוד, גדולי ישראל וגימטריה.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/play' },
  openGraph: { title: TITLE, description: DESC, url: '/play' },
};

export default function PlayPage() {
  return <Suspense><JoinView /></Suspense>;
}
