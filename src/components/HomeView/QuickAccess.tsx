'use client';

import { usePathname } from 'next/navigation';
import { HE } from '@/lib/hebrewTexts';
import { Interest, openInterests, pickTiles } from '@/lib/interests';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/PageHeader';
import MoreGrid from '@/components/Layout/MoreGrid';

interface Props {
  /** The visitor's interests (empty = the default tiles). */
  picked: Interest[];
  /** Personalisation is on: offer "התאמה". */
  editable: boolean;
}

/**
 * The everyday tools one tap from home (siddur, ברכת המזון, תהילים, …);
 * with interests picked, the eight tiles that fit them best ("בשבילך").
 */
export default function QuickAccess({ picked, editable }: Props) {
  const pathname = usePathname() ?? '/';
  const tiles = pickTiles(HE.HOME_QUICK, HE.HOME_QUICK_POOL, picked);
  return (
    <Card $pad="md" as="section" aria-labelledby="home-quick-title">
      <SectionHeader
        id="home-quick-title"
        title={picked.length ? HE.HOME_QUICK_FOR_YOU : HE.HOME_QUICK_TITLE}
        button={editable ? { label: HE.HOME_QUICK_EDIT, icon: 'sliders', onClick: openInterests } : undefined}
      />
      <MoreGrid items={tiles} pathname={pathname} columns={4} />
    </Card>
  );
}
