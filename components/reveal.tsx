"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Fades/slides a block up into place the first time it scrolls into view —
 *  for the long, content-heavy static pages (About, FAQ, courier landing
 *  pages), which otherwise just render fully formed with no sense of motion
 *  as you scroll. Distinct from the `animate-in` mount-triggered fades used
 *  elsewhere: those fire immediately on mount, which is right for
 *  above-the-fold content but wouldn't trigger on scroll position at all. */
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
