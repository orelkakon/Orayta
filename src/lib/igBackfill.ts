/**
 * Backfill orchestrator for one Instagram page: walks the profile from the
 * newest post backwards and imports reels missing from our DB, stopping at the
 * first post we already have (that marks the end of the gap).
 *
 * All I/O is injected (`BackfillDeps`) so the gap logic is unit-testable and
 * the route stays a thin streaming wrapper.
 */

export interface IgPost {
  code: string;
  isVideo: boolean;
  /** Pinned posts sit at the top out of chronological order — never a gap marker. */
  pinned: boolean;
}

export interface IgListing { posts: IgPost[]; nextCursor: string | null; }

export interface ReelInspection {
  /** null when the embed page could not be fetched/parsed. */
  durationSec: number | null;
  playable: boolean | null;
}

export interface BackfillDeps {
  sourceName: 'graph' | 'embed';
  listPosts: (cursor: string | null) => Promise<IgListing>;
  inspectReel: (code: string) => Promise<ReelInspection>;
  existingCodes: (codes: string[]) => Promise<Set<string>>;
  /** Inserts one reel; returns false if it already existed (race-safe dedupe). */
  insertReel: (code: string) => Promise<boolean>;
  /**
   * Codes an earlier, unfinished run of this gap already handled (imported or
   * skipped). They are stepped over instead of ending the walk — otherwise a
   * run capped at `limit` would stop on its own imports next time.
   */
  passed: Set<string>;
}

export type StopReason =
  | 'reached-existing'   // hit a reel we already have — gap fully closed
  | 'limit'              // imported the per-run maximum; more may remain
  | 'source-exhausted'   // the source has no older posts to show
  | 'scan-cap'           // scanned the maximum number of listing pages
  | 'time-budget'        // ran out of the request time budget
  | 'source-error';      // a later listing page failed (partial result kept)

export type SkipReason = 'too-long' | 'not-playable' | 'unverified' | 'not-video';

export type BackfillEvent =
  | { type: 'status'; message: 'listing' | 'inspecting'; source: BackfillDeps['sourceName'] }
  | { type: 'progress'; scanned: number; added: number; skipped: number; code?: string }
  | { type: 'skip'; code: string; reason: SkipReason }
  | { type: 'added'; code: string }
  | { type: 'done'; summary: BackfillSummary }
  | { type: 'error'; message: string };

export interface BackfillSummary {
  source: BackfillDeps['sourceName'];
  scanned: number;
  added: string[];
  skipped: Record<SkipReason, number>;
  stopReason: StopReason;
  stoppedAt?: string;
  /** Codes handled in this run (imported + skipped) — persisted to resume an open gap. */
  passed: string[];
  errors: string[];
}

/** The gap is closed (or nothing older is visible) — no resume state needed. */
export function gapClosed(reason: StopReason): boolean {
  return reason === 'reached-existing' || reason === 'source-exhausted';
}

export interface BackfillOptions {
  limit: number;
  maxSeconds: number;
  maxPages: number;
  deadline: number;          // epoch ms
  now?: () => number;
}

export async function runBackfill(
  deps: BackfillDeps,
  opts: BackfillOptions,
  emit: (e: BackfillEvent) => void,
): Promise<BackfillSummary> {
  const now = opts.now ?? Date.now;
  const summary: BackfillSummary = {
    source: deps.sourceName, scanned: 0, added: [],
    skipped: { 'too-long': 0, 'not-playable': 0, unverified: 0, 'not-video': 0 },
    stopReason: 'source-exhausted', passed: [], errors: [],
  };
  const skippedTotal = () => Object.values(summary.skipped).reduce((a, b) => a + b, 0);
  const progress = (code?: string) => emit({
    type: 'progress', scanned: summary.scanned, added: summary.added.length, skipped: skippedTotal(), code,
  });
  const seen = new Set<string>();
  let cursor: string | null = null;

  for (let page = 0; ; page++) {
    if (page >= opts.maxPages) { summary.stopReason = 'scan-cap'; break; }
    emit({ type: 'status', message: 'listing', source: deps.sourceName });

    let listing: IgListing;
    try {
      listing = await deps.listPosts(cursor);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Nothing scanned yet → the whole run failed; otherwise keep the partial result.
      if (page === 0) throw new Error(msg);
      summary.errors.push(msg);
      summary.stopReason = 'source-error';
      break;
    }

    const fresh = listing.posts.filter(p => !seen.has(p.code));
    fresh.forEach(p => seen.add(p.code));
    const existing = await deps.existingCodes(fresh.map(p => p.code));
    let stop: StopReason | null = null;

    for (const post of fresh) {
      if (now() > opts.deadline) { stop = 'time-budget'; break; }
      summary.scanned++;
      if (deps.passed.has(post.code)) continue;
      if (existing.has(post.code)) {
        if (post.pinned) continue;
        summary.stoppedAt = post.code;
        stop = 'reached-existing';
        break;
      }
      if (!post.isVideo) { summary.skipped['not-video']++; continue; }

      emit({ type: 'status', message: 'inspecting', source: deps.sourceName });
      const info = await deps.inspectReel(post.code);
      const reason: SkipReason | null =
        info.durationSec === null || info.playable === null ? 'unverified'
          : !info.playable ? 'not-playable'
            : info.durationSec > opts.maxSeconds ? 'too-long'
              : null;
      if (reason) {
        summary.skipped[reason]++;
        // Unverified is often transient (rate limit) — retry it on the next run.
        if (reason !== 'unverified') summary.passed.push(post.code);
        emit({ type: 'skip', code: post.code, reason });
      } else if (await deps.insertReel(post.code)) {
        summary.added.push(post.code);
        summary.passed.push(post.code);
        emit({ type: 'added', code: post.code });
      } else {
        // Inserted concurrently by another run — it exists now, so the gap ends here.
        summary.stoppedAt = post.code;
        stop = 'reached-existing';
        break;
      }
      progress(post.code);
      if (summary.added.length >= opts.limit) { stop = 'limit'; break; }
    }

    progress();
    if (stop) { summary.stopReason = stop; break; }
    if (!listing.nextCursor) { summary.stopReason = 'source-exhausted'; break; }
    cursor = listing.nextCursor;
  }

  emit({ type: 'done', summary });
  return summary;
}
