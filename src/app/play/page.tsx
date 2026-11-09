import type { Metadata } from 'next';
import { Suspense } from 'react';
import JoinView from '@/components/PlayView/JoinView';
import { shareMeta } from '@/lib/og/meta';
import { isCode } from '@/lib/play/rules';
import { HE } from '@/lib/hebrewTexts';

const TITLE = 'חידון קבוצתי';
const DESC = 'משחק חידון חי לשיעור, לשולחן שבת ולחברותא — המנחה מקרין, וכולם עונים מהטלפון על שאלות בתלמוד, גדולי ישראל וגימטריה.';

interface Props { searchParams: { code?: string } }

/** An invite link (`?code=`) previews as an invitation with the PIN. */
export function generateMetadata({ searchParams }: Props): Metadata {
  const code = isCode(searchParams.code) ? searchParams.code : null;
  const title = code ? `${HE.OG_PLAY_TITLE} · ${TITLE}` : TITLE;
  const desc = code ? HE.OG_PLAY_SUB(code) : DESC;
  return {
    title: TITLE, description: DESC, alternates: { canonical: '/play' },
    ...shareMeta(title, desc, code ? `/play?code=${code}` : '/play', code ? { p: 'play', code } : { p: 'play' }),
  };
}

export default function PlayPage() {
  return <Suspense><JoinView /></Suspense>;
}
