import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import DedicationsView from '@/components/DedicationsView/DedicationsView';

const TITLE = 'הקדשות';
const DESC = 'הקדשת הלימוד באתר לעילוי נשמת, לרפואה שלמה או להצלחה. שלחו בקשת הקדשה, וההקדשה תוצג ללומדים באתר ובפיד רגע של תורה לזכות מי שנקבע.';
const PATH = '/dedications';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function DedicationsPage() {
  return (
    <AppLayout>
      <DedicationsView />
    </AppLayout>
  );
}
