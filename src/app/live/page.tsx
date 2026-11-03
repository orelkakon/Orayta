import type { Metadata } from 'next';
import LiveView from '@/components/LiveView/LiveView';
import SectionPing from '@/components/common/SectionPing';

const TITLE = 'שידור חי';
const DESC = 'שיעורי תורה בשידור ישיר — צפייה בשידורים חיים מבתי כנסת ורבנים, ישירות מתוך אורייתא.';
const PATH = '/live';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESC, url: PATH },
};

export default function LivePage() {
  return (
    <>
      <SectionPing metric="live" />
      <LiveView />
    </>
  );
}
