import { Suspense } from 'react';
import type { Metadata } from 'next';
import ParashaView from '@/components/ParashaView/ParashaView';
import SectionPing from '@/components/common/SectionPing';
import { SkeletonText } from '@/components/ui/Skeleton';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'פרשת השבוע';
const DESC = 'פרשת השבוע: תקציר, רעיון לשבת, קריאת התורה לפי העליות וההפטרה לפי מנהג עדות המזרח.';
const PATH = '/parasha';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'parasha' }),
};

export default function ParashaPage() {
  return (
    <>
      <SectionPing metric="today" />
      <Suspense fallback={<SkeletonText lines={8} />}>
        <ParashaView />
      </Suspense>
    </>
  );
}
