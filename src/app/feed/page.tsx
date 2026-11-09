import type { Metadata } from 'next';
import FeedView from '@/components/FeedView/FeedView';
import SectionPing from '@/components/common/SectionPing';
import { shareMeta } from '@/lib/og/meta';
import { feedSpec, specText } from '@/lib/og/dynamic';
import { parseFeedLink } from '@/lib/feedLink';

const TITLE = 'רגע של תורה';
const DESC = 'פיד תורני קצר לגלילה — ציטוטים מהתלמוד, חידושי תורה, גימטריות וסרטונים קצרים, במנות קטנות של לימוד לכל רגע פנוי ביום. אפשר לשמור פריטים ולהתאים תוכן.';
const PATH = '/feed';

interface Props { searchParams: { i?: string } }

/** A shared post (`?i=<type>.<id>`) previews as itself; the plain feed gets the section card. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const base: Metadata = { title: TITLE, description: DESC, alternates: { canonical: PATH }, ...shareMeta(TITLE, DESC, PATH, { p: 'feed' }) };
  const link = parseFeedLink(searchParams.i);
  if (!link) return base;
  const spec = await feedSpec(link.type, link.id, false).catch(() => null);
  if (!spec) return base;
  const t = specText(spec);
  return { ...base, ...shareMeta(`${t.title} · ${TITLE}`, t.description, `${PATH}?i=${searchParams.i}`, { p: 'feed', t: link.type, id: link.id }) };
}

export default function FeedPage() {
  return (
    <>
      <SectionPing metric="feed" />
      <FeedView />
    </>
  );
}
