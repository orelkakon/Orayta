import type { Metadata } from 'next';
import SectionPing from '@/components/common/SectionPing';
import RabbisAndBooksView from '@/components/RabbisAndBooksView/RabbisAndBooksView';
import { shareMeta } from '@/lib/og/meta';
import { rabbiByName, rabbiSpec, specText } from '@/lib/og/dynamic';

const TITLE = 'רבנים וספרים';
const DESC = 'מדריך כרונולוגי לגדולי ישראל — מדורות התורה, הנביאים, התנאים והאמוראים ועד אחרוני הדורות — לצד ספרי היסוד שכתבו, עם חיפוש וסינון לפי תקופה.';
const PATH = '/rabbis';

interface Props {
  searchParams: { q?: string; tab?: string };
}

/** `?q=<exact name>` (links from רבי־בוט, kivrei, hilula) previews as that rabbi, with the portrait. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const base: Metadata = { title: TITLE, description: DESC, alternates: { canonical: PATH }, ...shareMeta(TITLE, DESC, PATH, { p: 'rabbis' }) };
  const q = (searchParams.q ?? '').trim().slice(0, 80);
  if (!q) return base;
  const id = await rabbiByName(q).catch(() => null);
  const spec = id ? await rabbiSpec(id, false).catch(() => null) : null;
  if (!id || !spec) return base;
  const t = specText(spec);
  return { ...base, ...shareMeta(`${t.title} · ${TITLE}`, t.description, `${PATH}?q=${encodeURIComponent(q)}`, { p: 'rabbi', id }) };
}

export default function RabbisPage({ searchParams }: Props) {
  const initialTab = searchParams.tab === 'books' ? 'books' : 'rabbis';
  return (
    <>
      <SectionPing metric="rabbis" />
      <RabbisAndBooksView initialTab={initialTab} initialSearch={searchParams.q ?? ''} />
    </>
  );
}
