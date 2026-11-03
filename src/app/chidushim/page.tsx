import type { Metadata } from 'next';
import SectionPing from '@/components/common/SectionPing';
import ChidushimView from '@/components/ChidushimView/ChidushimView';

const TITLE = 'חידושים';
const DESC = 'אוסף חידושי תורה ומחשבה על סוגיות הגמרא, פרשת השבוע ומועדי השנה — רעיונות קצרים לעיון, לדרשה ולשולחן שבת, עם חיפוש חופשי בכל החידושים.';
const PATH = '/chidushim';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

interface Props { searchParams: { q?: string } }

export default function ChidushimPage({ searchParams }: Props) {
  return (
    <>
      <SectionPing metric="chidushim" />
      <ChidushimView initialSearch={searchParams.q ?? ''} />
    </>
  );
}
