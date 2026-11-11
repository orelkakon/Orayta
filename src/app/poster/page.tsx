import type { Metadata } from 'next';
import PosterView from '@/components/PosterView/PosterView';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'דף לבית הכנסת';
const DESC = 'דף A4 מעוצב להדפסה ולתלייה על לוח המודעות של בית הכנסת — עם קודי QR למניין קרוב, לסידור ולחלוקת תהילים באורייתא.';
const PATH = '/poster';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'poster' }),
};

export default function PosterPage() {
  return <PosterView />;
}
