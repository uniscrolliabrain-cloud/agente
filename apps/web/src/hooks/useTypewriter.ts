// B2_TYPEWRITER_V2 - velocidad adaptativa (40-600 chars/s) con rAF.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useTypewriter(target: string, streamDone: boolean): {
  text: string;
  typing: boolean;
} {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const r = useRef({ shown: 0, target, done: streamDone, acc: 0 });
  r.current.target = target;
  r.current.done = streamDone;

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const s = r.current;
      const dt = (t - last) / 1000;
      last = t;
      if (s.target.length < s.shown) {
        s.shown = 0;
        s.acc = 0;
      }
      const backlog = s.target.length - s.shown;
      if (backlog > 0) {
        s.acc += dt * Math.min(600, 40 + backlog * 6);
        const n = Math.floor(s.acc);
        if (n) {
          s.acc -= n;
          s.shown = Math.min(s.target.length, s.shown + n);
          setShown(s.shown);
        }
      }
      if (s.done && s.shown >= s.target.length) return;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (reduced) return { text: target, typing: !streamDone };
  return { text: target.slice(0, shown), typing: !streamDone || shown < target.length };
}