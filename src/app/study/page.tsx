import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import TalmudView from '@/components/TalmudView/TalmudView';

export const metadata: Metadata = {
  title: 'תלמוד',
  description: 'עיון ולימוד בציטוטים מהתלמוד הבבלי, מסודרים לפי סדר, מסכת, דף ועמוד — עם חיפוש חופשי בכל המקורות, סינון לפי מסכת והגרלת ציטוט אקראי ללימוד יומי.',
  alternates: { canonical: '/study' },
};

interface Props { searchParams: { masechet?: string } }

export default function StudyPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <TalmudView initialMasechet={searchParams.masechet ?? ''} />
    </AppLayout>
  );
}
