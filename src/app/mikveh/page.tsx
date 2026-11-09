import type { Metadata } from 'next';
import MikvehView from '@/components/MikvehView/MikvehView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'מקווה בסביבה';
const DESC = 'מצאו מקוואות טהרה קרובים אליכם על המפה — מקווה נשים, גברים וכלים, שעות פעילות, נגישות, טלפון וניווט ב-Waze או Google Maps.';
const PATH = '/mikveh';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'mikveh' }),
};

export default function MikvehPage() {
  return (
    <>
      <MikvehView />
    </>
  );
}
