import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import GematriaView from '@/components/GematriaView/GematriaView';

export const metadata: Metadata = {
  title: 'גימטריות',
  description: 'חישוב ערכי אותיות במילים, בשמות ובביטויים, לצד אוסף גימטריות וקשרים מספריים בין מושגים בתורה — עם חיפוש חופשי בכל הגימטריות שנאספו באתר.',
  alternates: { canonical: '/gematria' },
};

interface Props { searchParams: { q?: string } }

export default function GematriaPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <GematriaView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
