import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SECTIONS } from '@/lib/contentsSections';
import { MASECHTOT } from '@/lib/hebrewData';

export const dynamic = 'force-dynamic';

// Every individual prayer counts: each ברכה in a static group, each part of a
// split siddur section, each פרק תהילים. Tanakh reading content is not a prayer.
function countPrayers(): number {
  let total = 0;
  for (const s of SECTIONS) {
    if (s.group === 'tanakh') continue;
    if (s.type === 'sefaria-chapters') total += s.totalChapters ?? 1;
    else if (s.type === 'sefaria-prayer') total += 1;
    else if (s.staticGroups) total += s.staticGroups.reduce((a, g) => a + g.items.length, 0);
    else if (s.staticSections) {
      for (const sec of s.staticSections) {
        if (sec.groups) total += sec.groups.reduce((a, g) => a + g.items.length, 0);
        else if (sec.parts) total += sec.parts.length;
        else total += 1;
      }
    }
  }
  return total;
}

export async function GET() {
  const [citations, rabbis, books, summaries, gematrias, chidushim, videos, dedications, gematriaValues, rabbiPools] = await Promise.all([
    prisma.citation.count(),
    prisma.rabbi.count(),
    prisma.book.count(),
    prisma.sikumEntry.count(),
    prisma.gematria.count(),
    prisma.chidush.count(),
    prisma.instagramReel.count({ where: { active: true, OR: [{ pageId: null }, { page: { active: true } }] } }),
    prisma.dedication.count({ where: { status: 'approved' } }),
    prisma.gematria.groupBy({ by: ['value'] }),
    prisma.rabbi.findMany({ select: { bio: true, imageUrl: true } }),
  ]);

  // Sum of the question pools of all ten quiz modes, mirroring each mode's
  // own filtering: three citation-based modes, bio needs a long-enough bio,
  // image needs a photo, who-first consumes a pair of rabbis per question.
  const questions =
    citations * 3 +
    rabbis +
    gematriaValues.length +
    books +
    Math.floor(rabbis / 2) +
    MASECHTOT.length +
    rabbiPools.filter(r => r.bio.length >= 40).length +
    rabbiPools.filter(r => r.imageUrl).length;

  return NextResponse.json({
    citations, rabbis, books, summaries, gematrias, chidushim,
    videos, dedications, prayers: countPrayers(), questions,
  });
}
