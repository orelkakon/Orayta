import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import AboutView from '@/components/AboutView/AboutView';

const TITLE = 'אודות';
const DESC = 'על אורייתא — מיזם ללימוד, חזרה ותרגול של מקורות יהודיים. מה כולל האתר, כמה תוכן נאסף בו עד היום, מי עומד מאחוריו וכיצד אפשר לשתף אותו עם אחרים.';
const PATH = '/about';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function AboutPage() {
  return (
    <AppLayout>
      <AboutView />
    </AppLayout>
  );
}
