import type { Metadata } from 'next';
import SectionPing from '@/components/common/SectionPing';
import GematriaView from '@/components/GematriaView/GematriaView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'גימטריות';
const DESC = 'חישוב ערכי אותיות במילים, בשמות ובביטויים, לצד אוסף גימטריות וקשרים מספריים בין מושגים בתורה — עם חיפוש חופשי בכל הגימטריות שנאספו באתר.';
const PATH = '/gematria';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'gematria' }),
};

interface Props { searchParams: { q?: string } }

export default function GematriaPage({ searchParams }: Props) {
  return (
    <>
      <SectionPing metric="gematria" />
      <GematriaView initialSearch={searchParams.q ?? ''} />
    </>
  );
}
