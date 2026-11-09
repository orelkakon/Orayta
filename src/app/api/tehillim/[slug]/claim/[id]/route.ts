import { NextRequest } from 'next/server';
import { cleanLine, isSlug, READER_NAME_MAX } from '@/lib/tehillim/rules';
import { finishUnit, releaseUnit } from '@/lib/tehillim/claims';
import { loadCircle, readerHashOf, stateResponse, tehillimError, viewState } from '@/lib/tehillim/server';

export const dynamic = 'force-dynamic';

interface Ctx { params: { slug: string; id: string } }

/** POST { action: 'done' | 'release', name? } — the reader finished the unit, or hands it back. */
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!isSlug(params.slug) || !/^[\w-]{1,40}$/.test(params.id)) return tehillimError('not_found', 404);
  const reader = readerHashOf(req);
  if (!reader) return tehillimError('bad_request', 400);
  const b = await req.json().catch(() => ({})) as { action?: unknown; name?: unknown };
  if (b.action === 'release') {
    await releaseUnit(params.slug, reader, params.id);
  } else if (b.action === 'done') {
    const name = b.name ? cleanLine(b.name, READER_NAME_MAX) : null;
    const r = await finishUnit(params.slug, reader, params.id, name);
    if (!r.ok) return tehillimError(r.error, r.error === 'too_soon' ? 425 : r.error === 'not_found' ? 404 : 403);
  } else {
    return tehillimError('bad_request', 400);
  }
  const snap = await loadCircle(params.slug, true);
  return snap ? stateResponse(viewState(snap, reader, false)) : tehillimError('not_found', 404);
}
