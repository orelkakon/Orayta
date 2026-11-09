import type { Metadata } from 'next';
import SectionPing from '@/components/common/SectionPing';
import QuizView from '@/components/QuizView/QuizView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'תרגול';
const DESC = 'חידונים אינטראקטיביים על מקורות התלמוד וגדולי ישראל — חידון אמריקאי, השלמת ציטוט, ניחוש רב, גימטריות וסדרי המשנה, עם רמזים ומעקב סטטיסטיקות אישי.';
const PATH = '/quiz';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'quiz' }),
};

export default function QuizPage() {
  return (
    <>
      <SectionPing metric="quiz" />
      <QuizView />
    </>
  );
}
