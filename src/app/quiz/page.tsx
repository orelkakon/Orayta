import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import QuizView from '@/components/QuizView/QuizView';

export const metadata: Metadata = {
  title: 'תרגול',
  description: 'חידונים אינטראקטיביים על מקורות התלמוד וגדולי ישראל — חידון אמריקאי, השלמת ציטוט, ניחוש רב, גימטריות וסדרי המשנה, עם רמזים ומעקב סטטיסטיקות אישי.',
  alternates: { canonical: '/quiz' },
};

export default function QuizPage() {
  return (
    <AppLayout>
      <QuizView />
    </AppLayout>
  );
}
