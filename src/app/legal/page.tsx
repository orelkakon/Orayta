import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import LegalView from '@/components/LegalView/LegalView';

const TITLE = 'תנאי שימוש, פרטיות ונגישות';
const DESC = 'תנאי השימוש, מדיניות הפרטיות והצהרת הנגישות של אורייתא: איזה מידע נאסף ולמה, הזכויות שלכם, כללי הפרסום באתר, והתאמות הנגישות ודרכי הפנייה לרכז הנגישות.';
const PATH = '/legal';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function LegalPage() {
  return (
    <AppLayout>
      <LegalView />
    </AppLayout>
  );
}
