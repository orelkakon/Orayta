import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import TodayView from '@/components/TodayView/TodayView';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'יומי';
const DESC = 'זמני היום לפי המיקום שלכם — זריחה, שקיעה וצאת הכוכבים — לצד התאריך העברי, פרשת השבוע, דף היומי, מצפן לכיוון ירושלים ואירועי היום בלוח השנה.';
const PATH = '/today';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function TodayPage() {
  return (
    <AppLayout>
      <SectionPing metric="today" />
      <TodayView />
    </AppLayout>
  );
}
