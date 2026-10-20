import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { PlayQuestion, PlaySettings } from '@/types/play';
import { buildQuestions, type PlaySource } from './build';
import { topicOf } from './kinds';

/** Loads only the tables the chosen topics need, then freezes a question set. */
export async function questionsFor(settings: PlaySettings): Promise<PlayQuestion[]> {
  const { seder, masechet } = settings;
  const topics = new Set(settings.kinds.map(topicOf));
  const where: Prisma.CitationWhereInput = masechet || seder
    ? { locations: { some: masechet ? { masechet } : { seder } } }
    : {};
  const [citations, rabbis, books, gematria] = await Promise.all([
    topics.has('talmud')
      ? prisma.citation.findMany({
          where,
          select: { id: true, content: true, locations: { select: { masechet: true, seder: true, daf: true, amud: true } } },
        })
      : [],
    topics.has('rabbis')
      ? prisma.rabbi.findMany({
          select: { id: true, name: true, fullName: true, bio: true, category: true, sortYear: true, datePeriod: true, deathDate: true, imageUrl: true },
        })
      : [],
    topics.has('rabbis') ? prisma.book.findMany({ select: { id: true, title: true, author: true, rabbiId: true } }) : [],
    topics.has('gematria') ? prisma.gematria.findMany({ select: { id: true, word: true, value: true } }) : [],
  ]);
  const src: PlaySource = { citations, rabbis, books, gematria };
  return buildQuestions(src, settings);
}
