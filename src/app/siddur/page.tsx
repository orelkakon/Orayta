import type { Metadata } from 'next';
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
    <>
      <SectionPing metric="content" />
      <SiddurHome />
    </>
  );
}
