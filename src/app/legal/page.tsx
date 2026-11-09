import type { Metadata } from 'next';
import LegalView from '@/components/LegalView/LegalView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'תנאי שימוש, פרטיות ונגישות';
const DESC = 'תנאי השימוש, מדיניות הפרטיות והצהרת הנגישות של אורייתא: איזה מידע נאסף ולמה, הזכויות שלכם, כללי הפרסום באתר, והתאמות הנגישות ודרכי הפנייה לרכז הנגישות.';
const PATH = '/legal';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'legal' }),
};

export default function LegalPage() {
  return (
    <>
      <LegalView />
    </>
  );
}
