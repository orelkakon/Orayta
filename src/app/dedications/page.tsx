import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import DedicationsView from '@/components/DedicationsView/DedicationsView';

export const metadata: Metadata = {
  title: 'הקדשות',
  description: 'הקדשת הלימוד באתר לעילוי נשמת, לרפואה שלמה או להצלחה. שלחו בקשת הקדשה, וההקדשה תוצג ללומדים באתר ובפיד רגע של תורה לזכות מי שנקבע.',
  alternates: { canonical: '/dedications' },
};

export default function DedicationsPage() {
  return (
    <AppLayout>
      <DedicationsView />
    </AppLayout>
  );
}
