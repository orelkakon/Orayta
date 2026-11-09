import type { Metadata } from 'next';
import AboutView from '@/components/AboutView/AboutView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'אודות';
const DESC = 'על אורייתא — מיזם ללימוד, חזרה ותרגול של מקורות יהודיים. מה כולל האתר, כמה תוכן נאסף בו עד היום, מי עומד מאחוריו וכיצד אפשר לשתף אותו עם אחרים.';
const PATH = '/about';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'about' }),
};

export default function AboutPage() {
  return (
    <>
      <AboutView />
    </>
  );
}
