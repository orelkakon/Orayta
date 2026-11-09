import type { Metadata } from 'next';
import LiveView from '@/components/LiveView/LiveView';
import SectionPing from '@/components/common/SectionPing';
import { shareMeta } from '@/lib/og/meta';

const TITLE = 'שידור חי';
const DESC = 'שיעורי תורה בשידור ישיר — צפייה בשידורים חיים מבתי כנסת ורבנים, ישירות מתוך אורייתא.';
const PATH = '/live';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  ...shareMeta(TITLE, DESC, PATH, { p: 'live' }),
};

export default function LivePage() {
  return (
    <>
      <SectionPing metric="live" />
      <LiveView />
    </>
  );
}
