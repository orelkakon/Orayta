import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SiddurHome from '@/components/SiddurView/SiddurHome';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'סידור — נוסח עדות המזרח';
const DESC = 'סידור תפילה לימות החול בנוסח עדות המזרח: שחרית, מנחה וערבית, עם ניווט מהיר לקריאת שמע, פסוקי דזמרה, עמידה, אשרי ועוד.';
const PATH = '/siddur';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function SiddurPage() {
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <SiddurHome />
    </AppLayout>
  );
}
