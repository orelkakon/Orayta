import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import AboutView from '@/components/AboutView/AboutView';

export const metadata: Metadata = {
  title: 'אודות',
  description: 'על אורייתא — מיזם ללימוד, חזרה ותרגול של מקורות יהודיים. מה כולל האתר, כמה תוכן נאסף בו עד היום, מי עומד מאחוריו וכיצד אפשר לשתף אותו עם אחרים.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <AppLayout>
      <AboutView />
    </AppLayout>
  );
}
