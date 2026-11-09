import type { Metadata } from 'next';
import DedicationsView from '@/components/DedicationsView/DedicationsView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'הקדשות';
const DESC = 'הקדשת הלימוד באתר לעילוי נשמת, לרפואה שלמה או להצלחה. שלחו בקשת הקדשה, וההקדשה תוצג ללומדים באתר ובפיד רגע של תורה לזכות מי שנקבע.';
const PATH = '/dedications';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'dedications' }),
};

export default function DedicationsPage() {
  return (
    <>
      <DedicationsView />
    </>
  );
}
