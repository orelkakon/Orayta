import type { Metadata } from 'next';
import RabbiBotPage from '@/components/RabbiBot/RabbiBotPage';
import { HE } from '@/lib/hebrewTexts';
import { shareMeta } from '@/lib/og/meta';

const PATH = '/ask';

interface Props { searchParams: { q?: string } }

const sharedQuestion = (q: string | undefined) => {
  const text = (q ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
  return text.length >= 3 ? text : null;
};

/** A shared question (`?q=`) previews as that question and is asked on arrival. */
export function generateMetadata({ searchParams }: Props): Metadata {
  const q = sharedQuestion(searchParams.q);
  const base: Metadata = { title: HE.RB_PAGE_TITLE, description: HE.RB_PAGE_DESC, alternates: { canonical: PATH } };
  if (!q) return { ...base, ...shareMeta(HE.RB_PAGE_TITLE, HE.RB_PAGE_DESC, PATH, { p: 'ask' }) };
  return { ...base, ...shareMeta(`${HE.OG_ASK_EYEBROW}: ${q}`, HE.OG_ASK_SUB, `${PATH}?q=${encodeURIComponent(q)}`, { p: 'ask', q }) };
}

export default function AskPage({ searchParams }: Props) {
  return <RabbiBotPage sharedQuestion={sharedQuestion(searchParams.q)} />;
}
