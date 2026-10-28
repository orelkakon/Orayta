import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import RabbiBotPage from '@/components/RabbiBot/RabbiBotPage';
import { HE } from '@/lib/hebrewTexts';

const PATH = '/ask';

export const metadata: Metadata = {
  title: HE.RB_PAGE_TITLE,
  description: HE.RB_PAGE_DESC,
  alternates: { canonical: PATH },
  openGraph: { title: HE.RB_PAGE_TITLE, description: HE.RB_PAGE_DESC, url: PATH },
};

export default function AskPage() {
  return (
    <AppLayout>
      <RabbiBotPage />
    </AppLayout>
  );
}
