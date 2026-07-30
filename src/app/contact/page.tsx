import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import ContactView from '@/components/ContactView/ContactView';

export const metadata: Metadata = {
  title: 'צור קשר',
  description: 'נשמח לשמוע מכם — הצעות לתוכן חדש, דיווח על טעות במקור, שאלות או כל מחשבה על האתר. שלחו הודעה דרך הטופס ונחזור אליכם בהקדם האפשרי.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <AppLayout>
      <ContactView />
    </AppLayout>
  );
}
