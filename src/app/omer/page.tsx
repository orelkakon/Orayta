import type { Metadata } from 'next';
import OmerView from '@/components/OmerView/OmerView';
import SectionPing from '@/components/common/SectionPing';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'ספירת העומר';
const DESC = 'ספירת העומר בנוסח עדות המזרח: הספירה של הלילה, הברכה והנוסח, ספירת היום (חסד שבחסד…), מפת 49 הימים וסימון "ספרתי".';
const PATH = '/omer';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'omer' }),
};

export default function OmerPage() {
  return (
    <>
      <SectionPing metric="content" />
      <OmerView />
    </>
  );
}
