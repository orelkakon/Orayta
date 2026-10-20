import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import OmerView from '@/components/OmerView/OmerView';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'ספירת העומר';
const DESC = 'ספירת העומר בנוסח עדות המזרח: הספירה של הלילה, הברכה והנוסח, ספירת היום (חסד שבחסד…), מפת 49 הימים וסימון "ספרתי".';
const PATH = '/omer';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function OmerPage() {
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <OmerView />
    </AppLayout>
  );
}
