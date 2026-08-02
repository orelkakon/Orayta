/**
 * Tiny haptics layer over navigator.vibrate — no-ops silently where the API
 * is missing (iOS Safari, desktop). Patterns are tuned to be felt, not heard:
 * a tick for taps, a double pulse for success, a longer buzz for errors.
 */
type VibratePattern = number | number[];

function vibrate(pattern: VibratePattern): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* never let a haptic throw */
  }
}

export const haptics = {
  /** Light tick — tab switches, button presses. */
  tap:     () => vibrate(10),
  /** Crisp double pulse — correct answer, saved, completed. */
  success: () => vibrate([15, 60, 20]),
  /** Single firm buzz — wrong answer, error. */
  error:   () => vibrate(60),
};
