import type { Metadata } from 'next';
import HilulaView from '@/components/HilulaView/HilulaView';
import { HE } from '@/lib/hebrewTexts';
import { ogDay, shareMeta } from '@/lib/og/meta';

const PATH = '/hilula';

// The preview shows today's date / hilulot — re-rendered hourly so the image URL follows the day.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: HE.HILULA_PAGE_TITLE,
    description: HE.HILULA_PAGE_DESC,
    alternates: { canonical: PATH },
    ...shareMeta(HE.HILULA_PAGE_TITLE, HE.HILULA_PAGE_DESC, PATH, { p: 'hilula', d: ogDay() }),
  };
}

export default function HilulaPage() {
  return (
    <>
      <HilulaView />
    </>
  );
}
