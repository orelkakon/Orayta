import type { Metadata } from 'next';
import ContactView from '@/components/ContactView/ContactView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'צור קשר';
const DESC = 'נשמח לשמוע מכם — הצעות לתוכן חדש, דיווח על טעות במקור, שאלות או כל מחשבה על האתר. שלחו הודעה דרך הטופס ונחזור אליכם בהקדם האפשרי.';
const PATH = '/contact';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'contact' }),
};

export default function ContactPage() {
  return (
    <>
      <ContactView />
    </>
  );
}
