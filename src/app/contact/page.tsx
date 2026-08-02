import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import ContactView from '@/components/ContactView/ContactView';

const TITLE = 'צור קשר';
const DESC = 'נשמח לשמוע מכם — הצעות לתוכן חדש, דיווח על טעות במקור, שאלות או כל מחשבה על האתר. שלחו הודעה דרך הטופס ונחזור אליכם בהקדם האפשרי.';
const PATH = '/contact';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function ContactPage() {
  return (
    <AppLayout>
      <ContactView />
    </AppLayout>
  );
}
