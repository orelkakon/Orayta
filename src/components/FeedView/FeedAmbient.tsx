'use client';

import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

const Btn = styled.button<{ $on: boolean }>`
  position: fixed; bottom: 26px; left: 14px; z-index: 301;
  width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
  background: ${p => p.$on ? 'rgba(255,220,140,0.18)' : 'rgba(0,0,0,0.38)'};
  border: 1px solid rgba(255,255,255,${p => p.$on ? '0.38' : '0.12'});
  color: ${p => p.$on ? 'rgba(255,220,140,0.9)' : 'rgba(255,255,255,0.4)'};
  font-size: 0.95rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.25s, border-color 0.25s, color 0.25s;
  backdrop-filter: blur(8px);
`;

const Label = styled.div<{ $visible: boolean }>`
  position: fixed; bottom: 30px; left: 58px; z-index: 301;
  color: rgba(255,255,255,0.5); font-size: 0.72rem;
  opacity: ${p => p.$visible ? 1 : 0}; transition: opacity 0.4s;
  pointer-events: none;
`;

const MASTER_VOL = 0.048;

type Tone = [freq: number, vol: number];
type CleanupFn = () => void;
type PresetFn = (ctx: AudioContext, out: GainNode) => CleanupFn;

function drone(ctx: AudioContext, out: GainNode, tones: Tone[]): CleanupFn {
  const pairs = tones.map(([f, v]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; g.gain.value = v;
    o.connect(g); g.connect(out); o.start();
    return { o, g };
  });
  return () => pairs.forEach(({ o, g }) => { try { o.stop(); } catch {} o.disconnect(); g.disconnect(); });
}

function arpeggio(ctx: AudioContext, out: GainNode, notes: number[], ms: number, vol: number): CleanupFn {
  let alive = true; let idx = 0;
  function tick() {
    if (!alive) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = notes[idx++ % notes.length];
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000 * 0.88);
    o.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + ms / 1000);
    setTimeout(tick, ms);
  }
  tick();
  return () => { alive = false; };
}

const PRESETS: { name: string; play: PresetFn }[] = [
  { name: 'נשמה',  play: (ctx, out) => drone(ctx, out,    [[110, 0.6], [220, 0.3], [330, 0.14]]) },
  { name: 'שלווה', play: (ctx, out) => drone(ctx, out,    [[147, 0.55], [220, 0.45], [294, 0.18]]) },
  { name: 'תפילה', play: (ctx, out) => arpeggio(ctx, out, [220, 261.6, 329.6, 392, 440], 1500, 0.55) },
  { name: 'עומק',  play: (ctx, out) => drone(ctx, out,    [[55, 0.65], [110, 0.38]]) },
  { name: 'אור',   play: (ctx, out) => drone(ctx, out,    [[329.6, 0.4], [494, 0.28], [659.3, 0.16]]) },
  { name: 'שיר',   play: (ctx, out) => drone(ctx, out,    [[130.8, 0.5], [196, 0.38], [261.6, 0.28], [329.6, 0.15]]) },
  { name: 'מנוחה', play: (ctx, out) => arpeggio(ctx, out, [440, 392, 329.6, 261.6, 220], 2000, 0.52) },
];

export default function FeedAmbient() {
  const [on, setOn]           = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [preset]              = useState(() => PRESETS[Math.floor(Math.random() * PRESETS.length)]);
  const ctxRef                = useRef<AudioContext | null>(null);
  const masterRef             = useRef<GainNode | null>(null);
  const stopRef               = useRef<CleanupFn | null>(null);
  const startedRef            = useRef(false);

  useEffect(() => {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0; // silent until unlocked
    master.connect(ctx.destination);
    ctxRef.current  = ctx;
    masterRef.current = master;
    // Build the sound graph now (oscillators run as soon as context resumes)
    stopRef.current = preset.play(ctx, master);

    function unlock() {
      if (startedRef.current) return;
      startedRef.current = true;
      ctx.resume().then(() => {
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(MASTER_VOL, ctx.currentTime + 3.5);
        setOn(true);
        setShowLabel(true);
        setTimeout(() => setShowLabel(false), 2800);
      });
    }

    // Any touch/click on the page unlocks — happens on the very first scroll swipe
    document.addEventListener('touchstart', unlock, { passive: true, once: true });
    document.addEventListener('pointerdown', unlock, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('pointerdown', unlock);
      stopRef.current?.();
      master.disconnect();
      void ctx.close();
      ctxRef.current = null; masterRef.current = null; stopRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once; preset is stable

  const toggle = () => {
    const ctx    = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (on) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setOn(false);
    } else {
      master.gain.linearRampToValueAtTime(MASTER_VOL, ctx.currentTime + 2);
      setOn(true);
    }
  };

  return (
    <>
      <Btn $on={on} onClick={toggle} title={on ? 'כבה מוזיקה' : 'הפעל מוזיקה'}>♪</Btn>
      <Label $visible={showLabel}>{preset.name}</Label>
    </>
  );
}
