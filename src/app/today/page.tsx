import type { Metadata } from 'next';
import TodayView from '@/components/TodayView/TodayView';
import SectionPing from '@/components/common/SectionPing';
import { ogDay, shareMeta } from '@/lib/og/meta';

const TITLE = 'יומי';
const DESC = 'זמני היום לפי המיקום שלכם — זריחה, שקיעה וצאת הכוכבים — לצד התאריך העברי, פרשת השבוע, דף היומי, מצפן לכיוון ירושלים ואירועי היום בלוח השנה.';
const PATH = '/today';

// The preview shows today's date / hilulot — re-rendered hourly so the image URL follows the day.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESC,
    alternates: { canonical: PATH },
    ...shareMeta(TITLE, DESC, PATH, { p: 'today', d: ogDay() }),
  };
}

export default function TodayPage() {
  return (
    <>
      <SectionPing metric="today" />
      <TodayView />
    </>
  );
}
