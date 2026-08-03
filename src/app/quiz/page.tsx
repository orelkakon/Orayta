import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SectionPing from '@/components/common/SectionPing';
import QuizView from '@/components/QuizView/QuizView';

const TITLE = 'תרגול';
const DESC = 'חידונים אינטראקטיביים על מקורות התלמוד וגדולי ישראל — חידון אמריקאי, השלמת ציטוט, ניחוש רב, גימטריות וסדרי המשנה, עם רמזים ומעקב סטטיסטיקות אישי.';
const PATH = '/quiz';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function QuizPage() {
  return (
    <AppLayout>
      <SectionPing metric="quiz" />
      <QuizView />
    </AppLayout>
  );
}
