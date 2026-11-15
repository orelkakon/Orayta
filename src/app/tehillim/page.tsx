import type { Metadata } from 'next';
import TehillimHome from '@/components/TehillimView/TehillimHome';
import { HE } from '@/lib/hebrewTexts';
import { shareMeta } from '@/lib/og/meta';
import SectionPing from '@/components/common/SectionPing';

const PATH = '/tehillim';

export const metadata: Metadata = {
  title: HE.TH_PAGE_TITLE,
  description: HE.TH_PAGE_DESC,
  alternates: { canonical: PATH },
  ...shareMeta(HE.TH_PAGE_TITLE, HE.TH_PAGE_DESC, PATH, { p: 'tehillim' }),
};

export default function TehillimPage() {
  return (
    <>
      <SectionPing metric="tehillim" />
      <TehillimHome />
    </>
  );
}
