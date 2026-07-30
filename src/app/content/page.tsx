import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import ContentsView from '@/components/ContentsView/ContentsView';
import SectionPing from '@/components/common/SectionPing';

export const metadata: Metadata = {
  title: 'תפילות ותנ״ך',
  description: 'סידור תפילה, תהילים ותנ״ך מלא — תורה, נביאים וכתובים — לצד קדיש, תפילת הדרך, ברכות הנהנין, ברכות אחרונות, אשר יצר וברכות הראייה, בממשק קריאה נוח.',
  alternates: { canonical: '/content' },
};

export default function ContentPage() {
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <ContentsView />
    </AppLayout>
  );
}
