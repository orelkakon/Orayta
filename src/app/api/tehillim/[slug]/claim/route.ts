import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { makeRateLimiter } from '@/lib/minyan/server';
import { isSlug } from '@/lib/tehillim/rules';
import { takeUnit } from '@/lib/tehillim/claims';
import { loadCircle, readerHashOf, stateResponse, tehillimError, tehillimIpHash, viewState } from '@/lib/tehillim/server';

export const dynamic = 'force-dynamic';

/** POST { unit?: number } — take a unit to read (a random free one, or the one picked on the map). */
const limit = makeRateLimiter(60, 10 * 60_000);

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isSlug(params.slug)) return tehillimError('not_found', 404);
  const reader = readerHashOf(req);
  if (!reader) return tehillimError('bad_request', 400);
  if (!isAdmin(req) && limit(tehillimIpHash(req))) return tehillimError('rate_limited', 429);
  const b = await req.json().catch(() => ({})) as { unit?: unknown };
  const want = typeof b.unit === 'number' ? b.unit : null;
  const r = await takeUnit(params.slug, reader, want);
  if (!r.ok) return tehillimError(r.error, r.error === 'not_found' ? 404 : r.error === 'closed' ? 410 : r.error === 'taken' ? 409 : 400);
  const snap = await loadCircle(params.slug, true);
  return snap ? stateResponse(viewState(snap, reader, false)) : tehillimError('not_found', 404);
}
