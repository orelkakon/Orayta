import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SectionPing from '@/components/common/SectionPing';
import GematriaView from '@/components/GematriaView/GematriaView';

const TITLE = 'גימטריות';
const DESC = 'חישוב ערכי אותיות במילים, בשמות ובביטויים, לצד אוסף גימטריות וקשרים מספריים בין מושגים בתורה — עם חיפוש חופשי בכל הגימטריות שנאספו באתר.';
const PATH = '/gematria';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

interface Props { searchParams: { q?: string } }

export default function GematriaPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <SectionPing metric="gematria" />
      <GematriaView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
