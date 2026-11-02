import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import MikvehView from '@/components/MikvehView/MikvehView';

const TITLE = 'מקווה בסביבה';
const DESC = 'מצאו מקוואות טהרה קרובים אליכם על המפה — מקווה נשים, גברים וכלים, שעות פעילות, נגישות, טלפון וניווט ב-Waze או Google Maps.';
const PATH = '/mikveh';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function MikvehPage() {
  return (
    <AppLayout>
      <MikvehView />
    </AppLayout>
  );
}
