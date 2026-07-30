import type { Metadata } from 'next';
import AppLayout from '@/components/Layout/AppLayout';
import TodayView from '@/components/TodayView/TodayView';
import SectionPing from '@/components/common/SectionPing';

export const metadata: Metadata = {
  title: 'יומי',
  description: 'זמני היום לפי המיקום שלכם — זריחה, שקיעה וצאת הכוכבים — לצד התאריך העברי, פרשת השבוע, דף היומי, מצפן לכיוון ירושלים ואירועי היום בלוח השנה.',
  alternates: { canonical: '/today' },
};

export default function TodayPage() {
  return (
    <AppLayout>
      <SectionPing metric="today" />
      <TodayView />
    </AppLayout>
  );
}
