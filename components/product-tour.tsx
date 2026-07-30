"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { closeTour, goToTourStep, useTourState } from "@/lib/tour-store";

export interface TourStep {
  /** CSS selector for the element to spotlight. Omitted for the target-less
   *  welcome/closing card, which renders centered instead. */
  selector?: string;
  title: string;
  description: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PAD = 8;
const CARD_WIDTH = 320;
const CARD_GAP = 12;

export function ProductTour({
  steps,
  labels,
}: {
  steps: TourStep[];
  labels: {
    next: string;
    back: string;
    skip: string;
    start: string;
    finish: string;
    stepOf: (step: number, total: number) => string;
  };
}) {
  const { open, step } = useTourState();
  const [rect, setRect] = useState<Rect | null>(null);
  const current = steps[step];
  const total = steps.length;

  // Re-measures the spotlighted element whenever the step changes, and keeps
  // tracking it across scroll/resize while that step is showing. Skipped
  // entirely for target-less steps, which render a centered card instead.
  useEffect(() => {
    const target =
      open && current?.selector ? document.querySelector<HTMLElement>(current.selector) : null;

    if (!target) {
      const clear = window.setTimeout(() => setRect(null), 0);
      return () => window.clearTimeout(clear);
    }

    const measure = () => {
      const box = target.getBoundingClientRect();
      setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
    };

    // Most steps target an element already on screen, so measuring
    // immediately keeps the spotlight in sync with the step change instead
    // of lagging a beat behind it. `scrollIntoView` is still fired for the
    // rare off-screen target, with a follow-up measurement once its (async,
    // unobservable-by-callback) smooth-scroll animation has had time to land.
    measure();
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    const settle = window.setTimeout(measure, 300);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, step, current?.selector]);

  if (!open || !current) return null;

  const isFirst = step === 0;
  const isLast = step === total - 1;
  const handleNext = () => (isLast ? closeTour() : goToTourStep(step + 1));

  const cardBelow = rect ? rect.top + rect.height + SPOTLIGHT_PAD * 2 + 200 < window.innerHeight : false;
  const cardStyle = rect
    ? {
        left: Math.min(
          Math.max(rect.left, 16),
          window.innerWidth - CARD_WIDTH - 16,
        ),
        ...(cardBelow
          ? { top: rect.top + rect.height + SPOTLIGHT_PAD * 2 + CARD_GAP }
          : { top: Math.max(16, rect.top - SPOTLIGHT_PAD * 2 - CARD_GAP - 160) }),
      }
    : undefined;

  return (
    <div role="dialog" aria-modal="true" aria-label={current.title}>
      {/* Full-screen catcher: swallows clicks so the tour can't be dismissed
          by accidentally interacting with the app underneath. It only paints
          the dim tint itself for target-less steps — once a spotlight ring
          exists below, that ring's own 9999px box-shadow spread already dims
          everywhere outside it, and painting color here too would stack a
          second tint on top, dimming the "clear" window right back down.
          A plain div, not a button — it's a mouse-only dismiss affordance;
          the card's own X button (below) is the keyboard-reachable one, and
          giving this a redundant accessible name would put an invisible
          full-screen control ahead of it in tab order. */}
      <div
        aria-hidden="true"
        onClick={closeTour}
        className={cn("fixed inset-0 z-100 cursor-default", !rect && "bg-black/60")}
      />
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-101 rounded-md transition-all duration-300"
          style={{
            top: rect.top - SPOTLIGHT_PAD,
            left: rect.left - SPOTLIGHT_PAD,
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            // Two layers in one declaration: a 2px highlight ring in the
            // theme's primary colour (reads the CSS variable directly, so it
            // already tracks dark mode), then the 9999px spread that dims
            // everything outside this box. An inline `ring-2 ring-primary`
            // class here would just get clobbered by this same box-shadow
            // property rather than combining with it.
            boxShadow: "0 0 0 2px var(--primary), 0 0 0 9999px rgba(0,0,0,0.6)",
          }}
        />
      )}
      <div
        className={cn(
          "elevate animate-in fade-in zoom-in-95 fixed z-102 rounded-md border border-border bg-card p-4 duration-200",
          !rect && "top-1/2 left-1/2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
        )}
        style={rect ? { ...cardStyle, width: CARD_WIDTH } : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-medium">{current.title}</h2>
          <button
            type="button"
            aria-label={labels.skip}
            onClick={closeTour}
            className="-m-1 rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{current.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="micro text-muted-foreground/70">
            {labels.stepOf(step + 1, total)}
          </span>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button type="button" variant="ghost" size="sm" onClick={() => goToTourStep(step - 1)}>
                {labels.back}
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleNext}>
              {isFirst ? labels.start : isLast ? labels.finish : labels.next}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
