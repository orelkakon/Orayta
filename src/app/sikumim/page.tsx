import type { Metadata } from 'next';
import SectionPing from '@/components/common/SectionPing';
import SikumimView from '@/components/SikumimView/SikumimView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'סיכומים';
const DESC = 'סיכומי לימוד יומיים מסודרים לפי ספר ולפי נושא — לחזרה מהירה על החומר, השלמת פערים ומעקב אחר סדר הלימוד, עם חיפוש חופשי בכל הסיכומים שבאתר.';
const PATH = '/sikumim';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'sikumim' }),
};

interface Props { searchParams: { q?: string; book?: string; entry?: string } }

export default function SikumimPage({ searchParams }: Props) {
  return (
    <>
      <SectionPing metric="sikumim" />
      <SikumimView initialSearch={searchParams.q ?? ''} initialBookId={searchParams.book} initialEntryId={searchParams.entry} />
    </>
  );
}
