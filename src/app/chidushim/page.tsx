import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
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
    <AppLayout>
      <SectionPing metric="chidushim" />
      <ChidushimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
