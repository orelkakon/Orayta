/**
 * Pure swipe classification — kept free of DOM/React so it can be unit-tested.
 *
 * A gesture only counts as a navigation swipe when it is clearly horizontal,
 * long enough and quick enough. Anything else (vertical scrolling, slow drags
 * that select text, diagonal flicks) is left alone.
 */

export type SwipeDirection = 'right' | 'left';

export interface SwipeSample {
  dx: number;          // end.x - start.x (positive = finger moved right)
  dy: number;          // end.y - start.y
  elapsedMs: number;
}

export const SWIPE_MIN_DISTANCE = 60;
/** |dx| must dominate |dy| by this factor so vertical scrolls never trigger. */
export const SWIPE_AXIS_RATIO = 2;
export const SWIPE_MAX_DURATION_MS = 700;
/** Touches starting this close to a screen edge belong to the OS back gesture. */
export const SWIPE_EDGE_GUARD_PX = 24;

export function classifySwipe({ dx, dy, elapsedMs }: SwipeSample): SwipeDirection | null {
  if (elapsedMs > SWIPE_MAX_DURATION_MS) return null;
  const ax = Math.abs(dx);
  if (ax < SWIPE_MIN_DISTANCE) return null;
  if (ax < Math.abs(dy) * SWIPE_AXIS_RATIO) return null;
  return dx > 0 ? 'right' : 'left';
}

export function isInEdgeGuard(x: number, viewportWidth: number): boolean {
  return x < SWIPE_EDGE_GUARD_PX || x > viewportWidth - SWIPE_EDGE_GUARD_PX;
}
