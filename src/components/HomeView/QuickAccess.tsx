'use client';

import { usePathname } from 'next/navigation';
import { HE } from '@/lib/hebrewTexts';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/PageHeader';
import MoreGrid from '@/components/Layout/MoreGrid';

/** The everyday tools one tap from home (siddur, ברכת המזון, תהילים, …). */
export default function QuickAccess() {
  const pathname = usePathname() ?? '/';
  return (
    <Card $pad="md" as="section" aria-labelledby="home-quick-title">
      <SectionHeader id="home-quick-title" title={HE.HOME_QUICK_TITLE} />
      <MoreGrid items={HE.HOME_QUICK} pathname={pathname} columns={4} />
    </Card>
  );
}
