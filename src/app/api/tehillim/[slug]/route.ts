import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { cleanLine, cleanNote, isSlug, TITLE_MAX } from '@/lib/tehillim/rules';
import { invalidate, keyMatches, loadCircle, readerHashOf, stateResponse, tehillimError, viewState } from '@/lib/tehillim/server';

export const dynamic = 'force-dynamic';

interface Ctx { params: { slug: string } }

const manageKeyOf = (req: NextRequest) => req.headers.get('x-tehillim-manage');

/** GET — the reading as this viewer sees it (polled by every open page). */
export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isSlug(params.slug)) return tehillimError('not_found', 404);
  const snap = await loadCircle(params.slug);
  if (!snap) return tehillimError('not_found', 404);
  return stateResponse(viewState(snap, readerHashOf(req), keyMatches(manageKeyOf(req), snap.circle.manageHash)));
}

/** PATCH — organizer: close / reopen, title, note, end date. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isSlug(params.slug)) return tehillimError('not_found', 404);
  const snap = await loadCircle(params.slug, true);
  if (!snap) return tehillimError('not_found', 404);
  if (!keyMatches(manageKeyOf(req), snap.circle.manageHash)) return tehillimError('forbidden', 403);
  const b = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!b) return tehillimError('bad_request', 400);
  const data: { closed?: boolean; title?: string | null; note?: string | null; endsAt?: Date | null } = {};
  if (typeof b.closed === 'boolean') data.closed = b.closed;
  if ('title' in b) data.title = b.title ? cleanLine(b.title, TITLE_MAX) : null;
  if ('note' in b) data.note = cleanNote(b.note);
  if ('endsAt' in b) {
    const m = typeof b.endsAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.endsAt);
    data.endsAt = m ? new Date(`${b.endsAt}T23:59:59+02:00`) : null;
    if (m) data.closed = false;
  }
  await prisma.tehillimCircle.update({ where: { id: snap.circle.id }, data });
  invalidate(params.slug);
  const fresh = await loadCircle(params.slug, true);
  return fresh ? stateResponse(viewState(fresh, readerHashOf(req), true)) : tehillimError('not_found', 404);
}

/** DELETE — organizer removes the reading and everything read in it. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isSlug(params.slug)) return tehillimError('not_found', 404);
  const snap = await loadCircle(params.slug, true);
  if (!snap) return tehillimError('not_found', 404);
  if (!keyMatches(manageKeyOf(req), snap.circle.manageHash)) return tehillimError('forbidden', 403);
  await prisma.tehillimCircle.delete({ where: { id: snap.circle.id } });
  invalidate(params.slug);
  return new Response(null, { status: 204 });
}
