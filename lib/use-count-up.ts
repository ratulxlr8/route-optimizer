"use client";

import { useEffect, useRef, useState } from "react";

/** Eases a displayed number toward `target` over `duration`ms instead of
 *  snapping straight to it — used for price figures that change on every
 *  keystroke, so the total visibly counts up/down rather than jumping. */
export function useCountUp(target: number, duration = 450): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    displayRef.current = display;
  });

  useEffect(() => {
    const from = displayRef.current;
    if (Math.abs(from - target) < 0.01) return;

    // Matches the reduced-motion handling already applied to entrance
    // animations in globals.css — jump straight to the value instead of
    // tweening it. Deferred a tick rather than called directly in the
    // effect body, to avoid the cascading-render lint/perf warning.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setDisplay(target), 0);
      return () => window.clearTimeout(id);
    }

    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}
