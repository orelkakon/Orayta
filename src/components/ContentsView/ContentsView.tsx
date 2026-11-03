'use client';

import { useSearchParams } from 'next/navigation';
import { SECTIONS } from '@/lib/contentsSections';
import { SIDDUR_EXTRAS } from '@/lib/siddurContent';
import PrayersHub from './PrayersHub';
import HubReader from './HubReader';

/**
 * /content — the prayers hub, or one item open in the reader:
 * /content?open=<section or siddur-extra id>[&chapter=N] (deep links from
 * home, the siddur page and the hilula page use the same URL).
 */
export default function ContentsView() {
  const params = useSearchParams();
  const id = params?.get('open') ?? '';

  const section = SECTIONS.find(s => s.id === id && !s.href);
  if (section) {
    const ch = Number(params?.get('chapter'));
    const chapter = Number.isInteger(ch) && ch >= 1 && ch <= (section.totalChapters ?? 1) ? ch : 1;
    return <HubReader key={id} title={section.title} icon={section.icon} section={section} initialChapter={chapter} />;
  }

  const extra = SIDDUR_EXTRAS.find(x => x.id === id);
  if (extra) {
    return <HubReader key={id} title={extra.name} icon={extra.icon} extra={extra} initialChapter={1} />;
  }

  return <PrayersHub />;
}
