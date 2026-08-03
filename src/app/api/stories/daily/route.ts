import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HALACHOT } from '@/lib/storiesContent/halachot';
import { TALES } from '@/lib/storiesContent/tales';
import { findParashaInsight } from '@/lib/storiesContent/parashot';
import type { DailyStoriesPayload, DailyStory, StoryDaf, Amud } from '@/types';

export const dynamic = 'force-dynamic';

interface CalItem { title: { en: string }; displayValue: { he: string }; url: string }
interface SefariaResp { calendar_items?: CalItem[] }

/** Daf yomi + weekly parasha name, from the same Sefaria feed TodayView uses. */
async function fetchCalendar(): Promise<{ daf: StoryDaf | null; parashaName: string | null }> {
  try {
    const d = await fetch('https://www.sefaria.org/api/calendars?diaspora=0', {
      next: { revalidate: 3600 },
    }).then(r => r.json()) as SefariaResp;
    const items = d.calendar_items ?? [];
    const daf = items.find(ci => ci.title.en.includes('Daf Yomi'));
    const parasha = items.find(ci => ci.title.en === 'Parashat Hashavua');
    return {
      daf: daf ? { display: daf.displayValue.he, url: `https://www.sefaria.org/${daf.url}` } : null,
      parashaName: parasha?.displayValue.he ?? null,
    };
  } catch {
    return { daf: null, parashaName: null };
  }
}

/**
 * One bundle with all of today's stories. Selection is deterministic —
 * day-index (Asia/Jerusalem) modulo pool size over a stable id ordering —
 * so every visitor sees the same daily content and it rolls at midnight
 * with no cron and no manual curation.
 */
export async function GET() {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const day = Math.floor(Date.parse(date) / 86400000);
  const skip = (n: number) => day % Math.max(1, n);
  const byId = { orderBy: { id: 'asc' as const } };

  const [[nRabbi, nCitation, nReel, nSikum, nChidush, nGematria], cal] = await Promise.all([
    Promise.all([
      prisma.rabbi.count(),
      prisma.citation.count(),
      prisma.instagramReel.count({ where: { active: true } }),
      prisma.sikumEntry.count(),
      prisma.chidush.count(),
      prisma.gematria.count(),
    ]),
    fetchCalendar(),
  ]);

  const [rabbi, citation, reel, sikum, chidush, gematria] = await Promise.all([
    nRabbi ? prisma.rabbi.findFirst({ ...byId, skip: skip(nRabbi) }) : null,
    nCitation ? prisma.citation.findFirst({ ...byId, skip: skip(nCitation), include: { locations: true } }) : null,
    nReel ? prisma.instagramReel.findFirst({
      ...byId, skip: skip(nReel), where: { active: true },
      include: { page: { select: { username: true } } },
    }) : null,
    nSikum ? prisma.sikumEntry.findFirst({
      ...byId, skip: skip(nSikum),
      include: { book: { select: { name: true, icon: true } } },
    }) : null,
    nChidush ? prisma.chidush.findFirst({ ...byId, skip: skip(nChidush) }) : null,
    nGematria ? prisma.gematria.findFirst({ ...byId, skip: skip(nGematria) }) : null,
  ]);

  const matches = gematria
    ? (await prisma.gematria.findMany({ where: { value: gematria.value }, select: { word: true } }))
        .map(m => m.word).filter(w => w !== gematria.word).slice(0, 5)
    : [];

  const parasha = cal.parashaName ? findParashaInsight(cal.parashaName) : null;
  const stories: DailyStory[] = [];

  if (rabbi) stories.push({
    key: 'rabbi',
    data: { ...rabbi, createdAt: rabbi.createdAt.toISOString() },
  });
  if (citation) stories.push({
    key: 'citation',
    data: {
      id: citation.id,
      content: citation.content,
      locations: citation.locations.map(l => ({
        id: l.id, masechet: l.masechet, seder: l.seder, daf: l.daf, amud: l.amud as Amud | null,
      })),
      createdAt: citation.createdAt.toISOString(),
      updatedAt: citation.updatedAt.toISOString(),
    },
  });
  if (reel) stories.push({
    key: 'reel',
    data: { code: reel.code, url: reel.url, username: reel.page?.username ?? null },
  });
  if (parasha) stories.push({ key: 'parasha', data: parasha });
  stories.push({ key: 'halacha', data: HALACHOT[day % HALACHOT.length] });
  if (sikum) stories.push({
    key: 'sikum',
    data: {
      id: sikum.id, title: sikum.title, text: sikum.text,
      bookName: sikum.book.name, bookIcon: sikum.book.icon,
      location: sikum.location, date: sikum.date.toISOString(),
    },
  });
  if (chidush) stories.push({
    key: 'chidush',
    data: {
      ...chidush,
      createdAt: chidush.createdAt.toISOString(),
      updatedAt: chidush.updatedAt.toISOString(),
    },
  });
  stories.push({ key: 'tale', data: TALES[day % TALES.length] });
  if (gematria) stories.push({
    key: 'gematria',
    data: { ...gematria, createdAt: gematria.createdAt.toISOString(), matches },
  });
  if (cal.daf) stories.push({ key: 'daf', data: cal.daf });

  const payload: DailyStoriesPayload = { date, stories };
  return NextResponse.json(payload);
}
