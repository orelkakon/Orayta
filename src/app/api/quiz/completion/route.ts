import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getStartWordCount(wordCount: number): number {
  const n = wordCount <= 10 ? 3 : wordCount <= 20 ? 4 : 5;
  return Math.min(n, wordCount - 1);
}

function normalize(s: string): string {
  return s.replace(/[^א-ת\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreCompletion(fullContent: string, userResponse: string): number {
  const allWords = fullContent.trim().split(/\s+/);
  const startCount = getStartWordCount(allWords.length);
  const correctWords = normalize(allWords.slice(startCount).join(' ')).split(/\s+/).filter(Boolean);

  if (correctWords.length === 0) return 1;

  const responseWords = normalize(userResponse).split(/\s+/).filter(Boolean);
  const matched = correctWords.filter((w) => responseWords.includes(w)).length;
  return matched / correctWords.length;
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { citationId: string; response: string };

  const citation = await prisma.citation.findUnique({
    where: { id: body.citationId },
    include: { locations: true },
  });

  if (!citation) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const rawScore = scoreCompletion(citation.content, body.response ?? '');
  const savedScore = rawScore >= 0.6 ? 1 : 0;

  if (request.cookies.get('auth')?.value === 'admin') {
    await prisma.quizResult.create({ data: { citationId: body.citationId, score: savedScore } });
  }

  return NextResponse.json({ score: rawScore, fullContent: citation.content });
}
