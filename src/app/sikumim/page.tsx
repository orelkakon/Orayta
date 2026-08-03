import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SectionPing from '@/components/common/SectionPing';
import SikumimView from '@/components/SikumimView/SikumimView';

const TITLE = 'סיכומים';
const DESC = 'סיכומי לימוד יומיים מסודרים לפי ספר ולפי נושא — לחזרה מהירה על החומר, השלמת פערים ומעקב אחר סדר הלימוד, עם חיפוש חופשי בכל הסיכומים שבאתר.';
const PATH = '/sikumim';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

interface Props { searchParams: { q?: string } }

export default function SikumimPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <SectionPing metric="sikumim" />
      <SikumimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
