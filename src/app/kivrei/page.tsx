import type { Metadata } from 'next';
import KivreiView from '@/components/KivreiView/KivreiView';

const TITLE = 'קברי צדיקים באזור';
const DESC = 'ציוני קברי צדיקים סביבכם על המפה — מי הצדיק, תאריך ההילולא, הסבר קצר, קישור לוויקיפדיה וניווט ב-Waze או Google Maps.';
const PATH = '/kivrei';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function KivreiPage() {
  return (
    <>
      <KivreiView />
    </>
  );
}
