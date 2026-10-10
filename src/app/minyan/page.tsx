import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import MinyanView from '@/components/MinyanView/MinyanView';

const TITLE = 'מניין קרוב';
const DESC = 'מצאו בתי כנסת ומניינים קרובים אליכם על המפה — עם זמני תפילה מדווחים ומאומתים, ניווט ב-Google Maps או Waze וחיוג מהיר.';
const PATH = '/minyan';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function MinyanPage() {
  return (
    <AppLayout>
      <MinyanView />
    </AppLayout>
  );
}
