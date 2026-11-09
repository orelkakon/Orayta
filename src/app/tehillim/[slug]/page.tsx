import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CircleView from '@/components/TehillimView/CircleView';
import { HE } from '@/lib/hebrewTexts';
import { isSlug } from '@/lib/tehillim/rules';
import { ogDay, shareMeta } from '@/lib/og/meta';
import { tehillimSpec } from '@/lib/og/tehillim';

interface Props { params: { slug: string } }

/** Readings are unlisted: shared by link, never indexed. The preview shows what it is for and the progress. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/tehillim/${params.slug}`;
  const spec = await tehillimSpec(params.slug).catch(() => null);
  const title = spec ? `${spec.title} · ${HE.TH_PAGE_TITLE}` : HE.TH_PAGE_TITLE;
  const desc = spec?.subtitle ?? HE.TH_PAGE_DESC;
  return {
    title, description: desc, robots: { index: false },
    ...shareMeta(title, desc, path, { p: 'tehillim', s: params.slug, d: ogDay() }),
  };
}

export default function CirclePage({ params }: Props) {
  if (!isSlug(params.slug)) notFound();
  return <CircleView slug={params.slug} />;
}
