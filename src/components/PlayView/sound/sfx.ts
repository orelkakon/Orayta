'use client';

import { noise, tone } from './engine';

/** The game's sound vocabulary. Notes in Hz; times in seconds from now. */
export type Sfx = 'tick' | 'tickUrgent' | 'timeUp' | 'correct' | 'wrong' | 'reveal' | 'join' | 'start' | 'lock' | 'whoosh' | 'fanfare' | 'chime';

const N = { E4: 329.6, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, B5: 987.8, C6: 1046.5, E6: 1318.5 };

export function play(s: Sfx): void {
  switch (s) {
    case 'tick': tone(1250, 0, 0.06, { type: 'triangle', gain: 0.18 }); break;
    case 'tickUrgent':
      tone(1650, 0, 0.07, { type: 'square', gain: 0.09, filter: 3200 });
      tone(825, 0, 0.09, { type: 'triangle', gain: 0.14 });
      break;
    case 'timeUp':
      tone(220, 0, 0.55, { type: 'sawtooth', gain: 0.16, glide: 110, filter: 900 });
      noise(0, 0.4, 600, 200, 0.08);
      break;
    case 'correct':
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.07, 0.35, { type: 'triangle', gain: 0.2 }));
      tone(N.E6, 0.3, 0.5, { gain: 0.08 });
      break;
    case 'wrong':
      tone(311, 0, 0.22, { type: 'square', gain: 0.07, filter: 1200 });
      tone(233, 0.2, 0.4, { type: 'square', gain: 0.07, filter: 900, glide: 200 });
      break;
    case 'reveal':
      [N.G4, N.B4, N.D5].forEach(f => tone(f, 0, 0.9, { gain: 0.11, attack: 0.02 }));
      tone(N.G5, 0.02, 1.1, { gain: 0.06 });
      noise(0, 0.25, 3000, 8000, 0.04);
      break;
    case 'join': tone(620, 0, 0.12, { gain: 0.16, glide: 980 }); break;
    case 'start':
      noise(0, 0.7, 300, 4000, 0.07);
      [N.E4, N.A4, N.C5, N.E5].forEach((f, i) => tone(f, 0.45 + i * 0.05, 0.6, { type: 'triangle', gain: 0.12 }));
      break;
    case 'lock': tone(880, 0, 0.05, { type: 'triangle', gain: 0.16 }); tone(1320, 0.04, 0.08, { gain: 0.1 }); break;
    case 'whoosh': noise(0, 0.5, 400, 3500, 0.07); break;
    case 'chime': [N.E5, N.A5].forEach((f, i) => tone(f, i * 0.12, 0.6, { gain: 0.12 })); break;
    case 'fanfare': {
      // Brass-like (filtered saw) call, then a held major chord with sparkle.
      const brass = { type: 'sawtooth' as OscillatorType, gain: 0.12, filter: 2200, attack: 0.03 };
      [[N.G4, 0, 0.16], [N.C5, 0.17, 0.16], [N.E5, 0.34, 0.16], [N.G5, 0.51, 0.5]]
        .forEach(([f, at, d]) => tone(f, at, d, brass));
      [N.C5, N.E5, N.G5, N.C6].forEach(f => tone(f, 1.05, 1.6, { ...brass, gain: 0.07 }));
      [N.C6, N.E6, N.G5 * 2].forEach((f, i) => tone(f, 1.1 + i * 0.12, 0.5, { gain: 0.05 }));
      noise(1.0, 1.4, 2000, 6000, 0.05);
      break;
    }
  }
}
