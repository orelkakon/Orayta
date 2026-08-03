import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SectionPing from '@/components/common/SectionPing';
import TalmudView from '@/components/TalmudView/TalmudView';

const TITLE = 'תלמוד';
const DESC = 'עיון ולימוד בציטוטים מהתלמוד הבבלי, מסודרים לפי סדר, מסכת, דף ועמוד — עם חיפוש חופשי בכל המקורות, סינון לפי מסכת והגרלת ציטוט אקראי ללימוד יומי.';
const PATH = '/study';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

interface Props { searchParams: { masechet?: string } }

export default function StudyPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <SectionPing metric="study" />
      <TalmudView initialMasechet={searchParams.masechet ?? ''} />
    </AppLayout>
  );
}
