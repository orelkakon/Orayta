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

function evaluate(fullContent: string, userResponse: string): { score: number; correct: boolean } {
  const allWords = fullContent.trim().split(/\s+/);
  const startCount = getStartWordCount(allWords.length);
  const correctWords = normalize(allWords.slice(startCount).join(' ')).split(/\s+/).filter(Boolean);

  if (correctWords.length === 0) return { score: 1, correct: true };

  const responseWords = normalize(userResponse).split(/\s+/).filter(Boolean);
  const matched = correctWords.filter((w) => responseWords.includes(w)).length;
  const score = matched / correctWords.length;

  // Long completions (>12 words): 6 correct words is enough; otherwise ≥50%
  const correct = correctWords.length > 12 ? matched >= 6 : score >= 0.5;
  return { score, correct };
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { citationId: string; response: string };

  const citation = await prisma.citation.findUnique({
    where: { id: body.citationId },
    include: { locations: true },
  });

  if (!citation) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { score, correct } = evaluate(citation.content, body.response ?? '');

  return NextResponse.json({ score, correct, fullContent: citation.content });
}
