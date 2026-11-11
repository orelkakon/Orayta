import styled, { css, keyframes } from 'styled-components';

/**
 * Scroll-linked motion for feed slides. Each slide publishes a view timeline
 * (`view-timeline: --slide block` on the slide); these animations ride it,
 * so they run off the main thread and track the finger exactly. Browsers
 * without scroll-driven animations simply don't animate.
 */
/* Scroll-linked page turn: while a swipe is under way the leaving post lifts
   and recedes as the next one rises in; at rest (the middle of the range)
   both are exactly in place. Runs on the scroll timeline — no JS. */
const flow = keyframes`
  0% { opacity: 0; transform: translate3d(0, 24vh, 0) scale(0.92); }
  32% { opacity: 0.85; }
  50% { opacity: 1; transform: none; }
  72% { opacity: 0.7; }
  100% { opacity: 0; transform: translate3d(0, -18vh, 0) scale(0.88); }
`;

/* The backdrop moves at half the slide's pace — depth between swipes. */
const parallax = keyframes`
  from { transform: translate3d(0, -40vh, 0); }
  to { transform: translate3d(0, 40vh, 0); }
`;

const scrollLinked = (name: ReturnType<typeof keyframes>) => css`
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${name} linear both;
      animation-timeline: --slide;
      animation-range: cover 0% cover 100%;
    }
  }
`;

/* Taller than the slide by the parallax travel, so the moving backdrop never
   shows an edge (the slide clips it). */
export const Depth = styled.div`
  position: absolute; top: -40vh; bottom: -40vh; left: 0; right: 0;
  z-index: 0; pointer-events: none;
  ${scrollLinked(parallax)}
`;

export const contentFlow = scrollLinked(flow);
