import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canonicalReelUrl } from '@/lib/instagram';
import { runBackfill, gapClosed, BackfillDeps, BackfillEvent } from '@/lib/igBackfill';
import { embedLister, graphLister, graphConfigured, inspectReel } from '@/lib/igSources';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PER_RUN_LIMIT = 10;
const MAX_PAGES = 12;           // 12 × 25 = 300 posts deep with the Graph API
const TIME_BUDGET_MS = 50_000;  // leave headroom under maxDuration
const INSPECT_DELAY_MS = 300;   // be polite to Instagram between embed fetches

/* Best-effort guard against double-clicks starting two runs on one instance.
   Duplicates are impossible anyway (unique `code` + skipDuplicates). */
const running = new Set<string>();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const MAX_SESSION_CODES = 500;

/* Resume state for a gap that one run couldn't close (AppConfig, JSON array). */
const sessionKey = (pageId: string) => `ig_backfill_session:${pageId}`;

async function loadSession(pageId: string): Promise<string[]> {
  const row = await prisma.appConfig.findUnique({ where: { key: sessionKey(pageId) } });
  try {
    const parsed: unknown = row ? JSON.parse(row.value) : [];
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch { return []; }
}

async function saveSession(pageId: string, codes: string[] | null): Promise<void> {
  const key = sessionKey(pageId);
  if (!codes) { await prisma.appConfig.deleteMany({ where: { key } }); return; }
  const value = JSON.stringify(codes.slice(-MAX_SESSION_CODES));
  await prisma.appConfig.upsert({ where: { key }, create: { key, value }, update: { value } });
}

/**
 * Admin: search backwards for reels missing from a page, import up to 10,
 * stop at the first reel we already have. Streams NDJSON progress events
 * (see BackfillEvent) so the admin UI can show live progress.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const page = await prisma.instagramPage.findUnique({ where: { id: params.id } });
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (running.has(page.id)) return NextResponse.json({ error: 'already running' }, { status: 409 });

  const cfg = await prisma.appConfig.findUnique({ where: { key: 'reel_max_seconds' } });
  const maxSeconds = Number(cfg?.value) || 60;
  const useGraph = graphConfigured();
  const session = await loadSession(page.id);

  const deps: BackfillDeps = {
    sourceName: useGraph ? 'graph' : 'embed',
    listPosts: useGraph ? graphLister(page.username) : embedLister(page.username),
    inspectReel: async code => { await sleep(INSPECT_DELAY_MS); return inspectReel(code); },
    existingCodes: async codes => {
      if (codes.length === 0) return new Set();
      const rows = await prisma.instagramReel.findMany({ where: { code: { in: codes } }, select: { code: true } });
      return new Set(rows.map(r => r.code));
    },
    insertReel: async code => {
      const r = await prisma.instagramReel.createMany({
        data: [{ code, url: canonicalReelUrl(code), pageId: page.id }],
        skipDuplicates: true,
      });
      return r.count === 1;
    },
    passed: new Set(session),
  };

  running.add(page.id);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: BackfillEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'));
      try {
        const summary = await runBackfill(deps, {
          limit: PER_RUN_LIMIT, maxSeconds, maxPages: MAX_PAGES, deadline: Date.now() + TIME_BUDGET_MS,
        }, send);
        await saveSession(page.id, gapClosed(summary.stopReason) ? null : [...session, ...summary.passed]);
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        running.delete(page.id);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
