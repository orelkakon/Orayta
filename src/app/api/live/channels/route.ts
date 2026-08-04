import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resolveChannel, fetchChannelAvatar, invalidateLiveSnapshot } from '@/lib/youtubeLive';

export const dynamic = 'force-dynamic';

/** Public: active channels (for the "who we follow" list). Admin (?all=1): everything. */
export async function GET(req: NextRequest) {
  const wantAll = req.nextUrl.searchParams.get('all') === '1' && isAdmin(req);
  const channels = await prisma.liveChannel.findMany({
    where: wantAll ? undefined : { active: true },
    orderBy: { createdAt: 'asc' },
  });
  // One-time avatar backfill for rows added before the avatarUrl column.
  // null = never fetched; a failed fetch stays null so a later request retries.
  await Promise.allSettled(
    channels
      .filter(c => c.avatarUrl === null)
      .map(async c => {
        const avatarUrl = await fetchChannelAvatar(c.channelId);
        if (avatarUrl !== null) {
          c.avatarUrl = avatarUrl;
          await prisma.liveChannel.update({ where: { id: c.id }, data: { avatarUrl } });
        }
      }),
  );
  return NextResponse.json(channels);
}

/** Admin: add a channel by URL / @handle / channel id — resolved by scraping. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { url?: string };
  const input = typeof body.url === 'string' ? body.url.trim() : '';
  if (!input) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  const resolved = await resolveChannel(input);
  if (!resolved) return NextResponse.json({ error: 'unresolvable' }, { status: 422 });

  const exists = await prisma.liveChannel.findUnique({ where: { channelId: resolved.channelId } });
  if (exists) return NextResponse.json({ error: 'duplicate' }, { status: 409 });

  const channel = await prisma.liveChannel.create({ data: resolved });
  await invalidateLiveSnapshot();
  return NextResponse.json(channel, { status: 201 });
}
