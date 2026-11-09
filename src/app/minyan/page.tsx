import type { Metadata } from 'next';
import MinyanView from '@/components/MinyanView/MinyanView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'מניין קרוב';
const DESC = 'מצאו בתי כנסת ומניינים קרובים אליכם על המפה — עם זמני תפילה מדווחים ומאומתים, ניווט ב-Google Maps או Waze וחיוג מהיר.';
const PATH = '/minyan';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'minyan' }),
};

export default function MinyanPage() {
  return (
    <>
      <MinyanView />
    </>
  );
}
