import type { Metadata } from 'next';
import FeedView from '@/components/FeedView/FeedView';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'רגע של תורה';
const DESC = 'פיד תורני קצר לגלילה — ציטוטים מהתלמוד, חידושי תורה, גימטריות וסרטונים קצרים, במנות קטנות של לימוד לכל רגע פנוי ביום. אפשר לשמור פריטים ולהתאים תוכן.';
const PATH = '/feed';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function FeedPage() {
  return (
    <>
      <SectionPing metric="feed" />
      <FeedView />
    </>
  );
}
