import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import RabbisAndBooksView from '@/components/RabbisAndBooksView/RabbisAndBooksView';

export const metadata: Metadata = {
  title: 'רבנים וספרים',
  description: 'מדריך כרונולוגי לגדולי ישראל — מדורות התורה, הנביאים, התנאים והאמוראים ועד אחרוני הדורות — לצד ספרי היסוד שכתבו, עם חיפוש וסינון לפי תקופה.',
  alternates: { canonical: '/rabbis' },
};

interface Props {
  searchParams: { q?: string; tab?: string };
}

export default function RabbisPage({ searchParams }: Props) {
  const initialTab = searchParams.tab === 'books' ? 'books' : 'rabbis';
  return (
    <AppLayout>
      <RabbisAndBooksView initialTab={initialTab} initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
