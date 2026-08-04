import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT } from '@/lib/hebrewData';
import { HALACHOT } from '@/lib/storiesContent/halachot';
import { TALES } from '@/lib/storiesContent/tales';
import { findParashaInsight } from '@/lib/storiesContent/parashot';
import type { DailyStoriesPayload, DailyStory, StoryDaf, StoryQuiz, StoryWhoRabbi, Amud } from '@/types';

export const dynamic = 'force-dynamic';

interface CalItem { title: { en: string }; displayValue: { he: string }; url: string }
interface SefariaResp { calendar_items?: CalItem[] }

/** Daf yomi + weekly parasha (name and reading URL), from the Sefaria feed TodayView uses. */
async function fetchCalendar(): Promise<{ daf: StoryDaf | null; parashaName: string | null; parashaUrl: string | null }> {
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
      parashaUrl: parasha ? `https://www.sefaria.org/${parasha.url}` : null,
    };
  } catch {
    return { daf: null, parashaName: null, parashaUrl: null };
  }
}

const locSource = (l: { masechet: string; daf: string; amud: string | null }) =>
  `${l.masechet} ${HE.STUDY_DAF} ${l.daf}${l.amud ? ` ${HE.STUDY_AMUD} ${l.amud}` : ''}`;

/**
 * One bundle with all of today's stories. Selection is deterministic —
 * day-index (Asia/Jerusalem) modulo pool size over a stable id ordering — so
 * every visitor shares the same daily content, rolling at midnight with no
 * cron. Exception: the video story is random per request, by request.
 */
export async function GET() {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const day = Math.floor(Date.parse(date) / 86400000);
  const skip = (n: number) => day % Math.max(1, n);
  const byId = { orderBy: { id: 'asc' as const } };
  const reelQuery = {
    ...byId,
    where: { active: true },
    include: { page: { select: { username: true } } },
  };

  const [[nRabbi, nRabbiImg, nCitation, nReel, nSikum, nChidush, nGematria], cal] = await Promise.all([
    Promise.all([
      prisma.rabbi.count(),
      prisma.rabbi.count({ where: { imageUrl: { not: null } } }),
      prisma.citation.count(),
      prisma.instagramReel.count({ where: { active: true } }),
      prisma.sikumEntry.count(),
      prisma.chidush.count(),
      prisma.gematria.count(),
    ]),
    fetchCalendar(),
  ]);

  // Random video, kept distinct from the daily reel when the pool allows it
  let videoSkip = Math.floor(Math.random() * Math.max(1, nReel));
  if (nReel > 1 && videoSkip === skip(nReel)) videoSkip = (videoSkip + 1) % nReel;

  const [rabbi, whoCandidate, nameWindow, citation, quizCitation, reel, videoReel, sikum, chidush, gematria] = await Promise.all([
    nRabbi ? prisma.rabbi.findFirst({ ...byId, skip: skip(nRabbi) }) : null,
    nRabbiImg ? prisma.rabbi.findFirst({
      ...byId, where: { imageUrl: { not: null } }, skip: (day * 3 + 1) % nRabbiImg,
    }) : null,
    nRabbi >= 3 ? prisma.rabbi.findMany({
      ...byId, skip: (day * 11) % Math.max(1, nRabbi - 8), take: 8, select: { name: true },
    }) : [],
    nCitation ? prisma.citation.findFirst({ ...byId, skip: skip(nCitation), include: { locations: true } }) : null,
    nCitation ? prisma.citation.findFirst({ ...byId, skip: (day * 7 + 3) % nCitation, include: { locations: true } }) : null,
    nReel ? prisma.instagramReel.findFirst({ ...reelQuery, skip: skip(nReel) }) : null,
    nReel ? prisma.instagramReel.findFirst({ ...reelQuery, skip: videoSkip }) : null,
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

  // Daily question: which masechet is this citation from? Distractors and the
  // correct option's position are day-derived, so the question is shared too.
  let quiz: StoryQuiz | null = null;
  const qLoc = quizCitation?.locations[0];
  if (quizCitation && qLoc) {
    const others = MASECHTOT.map(m => m.name).filter(n => n !== qLoc.masechet);
    const options = [0, 1, 2].map(i => others[(day * 5 + i * 11) % others.length]);
    const correctIndex = day % 4;
    options.splice(correctIndex, 0, qLoc.masechet);
    quiz = { question: quizCitation.content, options, correctIndex, source: locSource(qLoc) };
  }

  // Guess-the-rabbi: a daily portrait plus two distractor names from a
  // deterministic window of the directory.
  let whoRabbi: StoryWhoRabbi | null = null;
  if (whoCandidate?.imageUrl) {
    const distractors = Array.from(new Set(nameWindow.map(r => r.name)))
      .filter(n => n !== whoCandidate.name)
      .slice(0, 2);
    if (distractors.length === 2) {
      const correctIndex = day % 3;
      const options = [...distractors];
      options.splice(correctIndex, 0, whoCandidate.name);
      whoRabbi = { imageUrl: whoCandidate.imageUrl, options, correctIndex };
    }
  }

  const parashaInsight = cal.parashaName ? findParashaInsight(cal.parashaName) : null;
  const stories: DailyStory[] = [];

  if (rabbi) stories.push({
    key: 'rabbi',
    data: { ...rabbi, createdAt: rabbi.createdAt.toISOString() },
  });
  if (whoRabbi) stories.push({ key: 'rabbiQuiz', data: whoRabbi });
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
  if (parashaInsight && cal.parashaUrl) stories.push({
    key: 'parasha',
    data: { ...parashaInsight, url: cal.parashaUrl },
  });
  stories.push({ key: 'halacha', data: HALACHOT[day % HALACHOT.length] });
  if (sikum) stories.push({
    key: 'sikum',
    data: {
      id: sikum.id, title: sikum.title, text: sikum.text,
      bookName: sikum.book.name, bookIcon: sikum.book.icon,
      location: sikum.location, date: sikum.date.toISOString(),
    },
  });
  if (quiz) stories.push({ key: 'quiz', data: quiz });
  if (chidush) stories.push({
    key: 'chidush',
    data: {
      ...chidush,
      createdAt: chidush.createdAt.toISOString(),
      updatedAt: chidush.updatedAt.toISOString(),
    },
  });
  stories.push({ key: 'tale', data: TALES[day % TALES.length] });
  if (videoReel) stories.push({
    key: 'video',
    data: { code: videoReel.code, url: videoReel.url, username: videoReel.page?.username ?? null },
  });
  if (gematria) stories.push({
    key: 'gematria',
    data: { ...gematria, createdAt: gematria.createdAt.toISOString(), matches },
  });
  if (cal.daf) stories.push({ key: 'daf', data: cal.daf });
  // רגע של תורה stays last so the reel closes the row (leftmost circle in RTL).
  if (reel) stories.push({
    key: 'reel',
    data: { code: reel.code, url: reel.url, username: reel.page?.username ?? null },
  });

  const payload: DailyStoriesPayload = { date, stories };
  return NextResponse.json(payload);
}
