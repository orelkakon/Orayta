import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import ContentsView from '@/components/ContentsView/ContentsView';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'תפילות ותנ״ך';
const DESC = 'סידור תפילה, תהילים ותנ״ך מלא — תורה, נביאים וכתובים — לצד קדיש, תפילת הדרך, ברכות הנהנין, ברכות אחרונות, אשר יצר וברכות הראייה, בממשק קריאה נוח.';
const PATH = '/content';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function ContentPage() {
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <ContentsView />
    </AppLayout>
  );
}
