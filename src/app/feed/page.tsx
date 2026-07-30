import type { Metadata } from 'next';
import FeedView from '@/components/FeedView/FeedView';
import SectionPing from '@/components/common/SectionPing';

export const metadata: Metadata = {
  title: 'רגע של תורה',
  description: 'פיד תורני קצר לגלילה — ציטוטים מהתלמוד, חידושי תורה, גימטריות וסרטונים קצרים, במנות קטנות של לימוד לכל רגע פנוי ביום. אפשר לשמור פריטים ולהתאים תוכן.',
  alternates: { canonical: '/feed' },
};

export default function FeedPage() {
  return (
    <>
      <SectionPing metric="feed" />
      <FeedView />
    </>
  );
}
