import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import HilulaView from '@/components/HilulaView/HilulaView';
import { HE } from '@/lib/hebrewTexts';

const PATH = '/hilula';

export const metadata: Metadata = {
  title: HE.HILULA_PAGE_TITLE,
  description: HE.HILULA_PAGE_DESC,
  alternates: { canonical: PATH },
  openGraph: { title: HE.HILULA_PAGE_TITLE, description: HE.HILULA_PAGE_DESC, url: PATH },
};

export default function HilulaPage() {
  return (
    <AppLayout>
      <HilulaView />
    </AppLayout>
  );
}
