import type { OgSpec } from '@/types/og';
import type { TehillimMode, TehillimPurpose } from '@/types/tehillim';
import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { headingOf } from '@/lib/tehillim/client';
import { isSlug } from '@/lib/tehillim/rules';
import { unitChapters } from '@/lib/tehillim/units';

/** A reading's share card: what it is for, and how much was read so far. */
export async function tehillimSpec(slug: string): Promise<OgSpec | null> {
  if (!isSlug(slug)) return null;
  const c = await prisma.tehillimCircle.findUnique({ where: { slug }, select: { id: true, purpose: true, names: true, title: true, mode: true, books: true } });
  if (!c) return null;
  const done = await prisma.tehillimClaim.findMany({ where: { circleId: c.id, status: 'done' }, select: { unit: true } });
  const chapters = done.reduce((n, d) => n + unitChapters(c.mode as TehillimMode, d.unit), 0);
  const purpose = c.purpose as TehillimPurpose;
  return {
    tone: 'night', icon: 'scroll',
    eyebrow: HE.OG_TH_EYEBROW(HE.TH_PURPOSES[purpose]?.label ?? ''),
    title: c.title ?? headingOf(purpose, c.names),
    subtitle: c.title ? `${headingOf(purpose, c.names)} · ${HE.OG_TH_SUB(chapters, c.books)}` : HE.OG_TH_SUB(chapters, c.books),
  };
}
