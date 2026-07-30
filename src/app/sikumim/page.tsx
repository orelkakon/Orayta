import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import SikumimView from '@/components/SikumimView/SikumimView';

export const metadata: Metadata = {
  title: 'סיכומים',
  description: 'סיכומי לימוד יומיים מסודרים לפי ספר ולפי נושא — לחזרה מהירה על החומר, השלמת פערים ומעקב אחר סדר הלימוד, עם חיפוש חופשי בכל הסיכומים שבאתר.',
  alternates: { canonical: '/sikumim' },
};

interface Props { searchParams: { q?: string } }

export default function SikumimPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <SikumimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
