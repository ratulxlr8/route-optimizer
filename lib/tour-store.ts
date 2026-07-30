"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "courier-tour-seen";

interface TourState {
  open: boolean;
  step: number;
}

let state: TourState = { open: false, step: 0 };
let seen = false;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  seen = window.localStorage.getItem(STORAGE_KEY) === "1";
}

function setState(next: TourState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

function markSeen() {
  hydrated = true;
  seen = true;
  window.localStorage.setItem(STORAGE_KEY, "1");
}

export function startTour() {
  setState({ open: true, step: 0 });
}

export function closeTour() {
  markSeen();
  setState({ open: false, step: 0 });
}

export function goToTourStep(step: number) {
  setState({ open: true, step });
}

export function useTourState(): TourState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** First-run only: opens the tour once per browser, the first time a visitor
 *  who has never dismissed it lands on the page. Runs in an effect (not
 *  during render) so the initial client render still matches the closed
 *  server snapshot — no hydration mismatch. */
export function useAutoStartTour() {
  useEffect(() => {
    hydrate();
    if (!seen) startTour();
  }, []);
}
