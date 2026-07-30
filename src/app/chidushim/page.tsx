import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import ChidushimView from '@/components/ChidushimView/ChidushimView';

export const metadata: Metadata = {
  title: 'חידושים',
  description: 'אוסף חידושי תורה ומחשבה על סוגיות הגמרא, פרשת השבוע ומועדי השנה — רעיונות קצרים לעיון, לדרשה ולשולחן שבת, עם חיפוש חופשי בכל החידושים.',
  alternates: { canonical: '/chidushim' },
};

interface Props { searchParams: { q?: string } }

export default function ChidushimPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <ChidushimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
